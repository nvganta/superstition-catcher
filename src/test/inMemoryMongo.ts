import {
  MongoClient,
  type Db,
  type Document,
  type Filter,
  type OptionalUnlessRequiredId,
  type UpdateFilter,
  type WithId,
} from 'mongodb';

interface IndexSpec {
  key: Record<string, 1 | -1>;
  unique?: boolean;
  expireAfterSeconds?: number;
  name?: string;
}

interface UpdateOptions {
  upsert?: boolean;
}

interface FindOptions {
  sort?: Record<string, 1 | -1>;
}

class InMemoryCollection<T extends Document = Document> {
  private docs = new Map<string, WithId<T>>();
  private indexes: IndexSpec[] = [];

  constructor(private name: string) {}

  private docKey(doc: Document): string {
    return JSON.stringify(doc._id ?? doc);
  }

  private getIndexedValue(doc: Document, field: string): unknown {
    return field.split('.').reduce<unknown>((value, part) => {
      if (value && typeof value === 'object' && part in (value as Document)) {
        return (value as Document)[part];
      }
      return undefined;
    }, doc);
  }

  private valuesEqual(left: unknown, right: unknown): boolean {
    if (left instanceof Date && right instanceof Date) {
      return left.getTime() === right.getTime();
    }
    return left === right;
  }

  private enforceUniqueIndexes(nextDoc: Document, existingId?: unknown) {
    for (const index of this.indexes) {
      if (!index.unique) {
        continue;
      }

      for (const doc of this.docs.values()) {
        if (existingId != null && doc._id === existingId) {
          continue;
        }

        const matches = Object.entries(index.key).every(([field]) => {
          return this.getIndexedValue(doc, field) === this.getIndexedValue(nextDoc, field);
        });

        if (matches) {
          throw new Error(`E11000 duplicate key error collection: ${this.name} index: ${index.name}`);
        }
      }
    }
  }

  private match(filter: Filter<T>): WithId<T>[] {
    return [...this.docs.values()].filter((doc) =>
      Object.entries(filter).every(([key, value]) =>
        this.valuesEqual(this.getIndexedValue(doc, key), value)
      )
    );
  }

  async createIndex(key: Record<string, 1 | -1>, options: IndexSpec = { key }) {
    const spec = { ...options, key };
    const existing = this.indexes.find((index) => index.name === spec.name);
    if (!existing) {
      this.indexes.push(spec);
    }
    return spec.name ?? Object.keys(key).join('_');
  }

  find(filter: Filter<T> = {}) {
    return {
      toArray: async () => this.match(filter),
    };
  }

  async findOne(filter: Filter<T>, options: FindOptions = {}): Promise<WithId<T> | null> {
    let results = this.match(filter);
    if (options.sort) {
      const [field, direction] = Object.entries(options.sort)[0] ?? [];
      if (field) {
        results = [...results].sort((a, b) => {
          const left = this.getIndexedValue(a, field);
          const right = this.getIndexedValue(b, field);
          if (left === right) return 0;
          if (left == null) return 1;
          if (right == null) return -1;
          return left > right ? direction : -direction;
        });
      }
    }
    return results[0] ?? null;
  }

  async insertOne(doc: OptionalUnlessRequiredId<T>) {
    const withId = { ...doc, _id: (doc as WithId<T>)._id ?? crypto.randomUUID() } as WithId<T>;
    this.enforceUniqueIndexes(withId);
    this.docs.set(this.docKey(withId), withId);
    return { insertedId: withId._id };
  }

  async insertMany(docs: OptionalUnlessRequiredId<T>[]) {
    for (const doc of docs) {
      await this.insertOne(doc);
    }
    return { insertedCount: docs.length };
  }

  async updateOne(filter: Filter<T>, update: UpdateFilter<T>, options: UpdateOptions = {}) {
    const existing = await this.findOne(filter);
    let modifiedCount = 0;

    if (!existing) {
      if (!options.upsert) {
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
      }

      const next = {
        ...((update.$setOnInsert as Document) ?? {}),
        ...(filter as Document),
        ...(update.$set as Document),
        _id: crypto.randomUUID(),
      } as unknown as WithId<T>;

      if (update.$inc) {
        for (const [field, amount] of Object.entries(update.$inc as Record<string, number>)) {
          (next as Document)[field] = ((next as Document)[field] as number | undefined ?? 0) + amount;
        }
      }

      this.enforceUniqueIndexes(next);
      this.docs.set(this.docKey(next), next);
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
    }

    const next = { ...existing } as WithId<T>;

    if (update.$setOnInsert) {
      for (const [field, value] of Object.entries(update.$setOnInsert as Document)) {
        if ((next as Document)[field] === undefined) {
          (next as Document)[field] = value;
        }
      }
    }

    if (update.$set) {
      Object.assign(next, update.$set as Document);
    }

    if (update.$inc) {
      for (const [field, amount] of Object.entries(update.$inc as Record<string, number>)) {
        (next as Document)[field] = ((next as Document)[field] as number | undefined ?? 0) + amount;
      }
    }

    this.enforceUniqueIndexes(next, existing._id);
    this.docs.set(this.docKey(next), next);
    modifiedCount = 1;

    return { matchedCount: 1, modifiedCount, upsertedCount: 0 };
  }

  async deleteMany(filter: Filter<T>) {
    const matches = this.match(filter);
    for (const doc of matches) {
      this.docs.delete(this.docKey(doc));
    }
    return { deletedCount: matches.length };
  }

  async countDocuments(filter: Filter<T> = {}) {
    return this.match(filter).length;
  }
}

class InMemoryDb {
  private collections = new Map<string, InMemoryCollection<Document>>();

  collection<T extends Document = Document>(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection(name));
    }
    return this.collections.get(name)! as unknown as ReturnType<Db['collection']> & InMemoryCollection<T>;
  }
}

export async function createInMemoryTestDb(): Promise<{
  db: Db;
  client: MongoClient;
  cleanup: () => Promise<void>;
}> {
  const db = new InMemoryDb() as unknown as Db;
  const client = {
    db: () => db,
    close: async () => undefined,
  } as unknown as MongoClient;

  return {
    db,
    client,
    cleanup: async () => undefined,
  };
}
