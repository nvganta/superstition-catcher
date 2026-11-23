import { NextResponse } from 'next/server';
import type { EntryWriteResult } from './results';

export function writeResultResponse(result: EntryWriteResult): NextResponse {
  switch (result.kind) {
    case 'created':
      return NextResponse.json({ entry: result.entry }, { status: 201 });
    case 'saved':
      return NextResponse.json({ entry: result.entry });
    case 'invalid':
      return NextResponse.json(
        { error: 'invalid', message: 'Some fields need attention.', issues: result.issues },
        { status: 400 }
      );
    case 'rejected':
      return NextResponse.json(
        {
          error: result.guardrail,
          message:
            result.guardrail === 'heldForEdit'
              ? 'Please remove personal contact details before posting.'
              : 'This post breaks our posting rules.',
          issues: result.issues,
        },
        { status: 422 }
      );
    case 'rateLimited':
      return NextResponse.json(
        { error: 'rateLimited', message: result.message, retryAfter: result.retryAfter },
        { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
      );
    case 'notFound':
      return NextResponse.json({ error: 'notFound', message: 'Entry not found.' }, { status: 404 });
    case 'conflict':
      return NextResponse.json(
        {
          error: 'conflict',
          message: `This entry changed while you were editing (now version ${result.currentVersion}). Reload and try again.`,
          currentVersion: result.currentVersion,
        },
        { status: 409 }
      );
    case 'duplicateId':
      return NextResponse.json(
        { error: 'duplicateId', message: `An entry with id "${result.id}" already exists.` },
        { status: 409 }
      );
  }
}

export function badJsonResponse(): NextResponse {
  return NextResponse.json({ error: 'invalid', message: 'Request body must be JSON.' }, { status: 400 });
}
