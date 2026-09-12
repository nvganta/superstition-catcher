import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { isAdminPassword } from '@/lib/admin-auth';

// Research assistant for a submitted myth: drafts the "why has it been this
// way" sections so a human doesn't start from a blank page.
//
// Admin-gated on purpose. Two reasons, and both matter:
//   1. The entire site rests on THE REAL REASON being actually real. A model
//      will happily invent a confident folk etymology, and one invented origin
//      sitting next to 42 researched ones costs more trust than the feature
//      earns. Every draft gets read by a person before it becomes a case file.
//   2. An open, unauthenticated LLM endpoint is a billing incident waiting for
//      a bored visitor.

const OriginDraft = z.object({
  title: z.string().describe('Short title for the superstition, in the style of a case file'),
  whatPeopleBelieve: z.string().describe('The belief stated plainly, as its believers would state it, without irony'),
  historicalOrigin: z.string().describe('Where the practice appears to come from historically. Say plainly if this is not well documented.'),
  theRealReason: z.string().describe('The practical, material, or social mechanism underneath it, if there is one. If there is no known practical basis, say that outright instead of inventing one.'),
  modernTwist: z.string().describe('How the belief survives, mutates, or fades today'),
  suggestedVerdict: z.enum(['busted', 'hasMerit', 'practicalOrigin']),
  suggestedRegion: z.enum(['india', 'japan', 'china', 'middleEast', 'europe', 'americas', 'africa']),
  suggestedCategory: z.enum([
    'numbers',
    'animals',
    'foodAndEating',
    'deathAndAfterlife',
    'marriageAndLove',
    'homeAndDaily',
    'travelAndJourney',
  ]),
  confidence: z.enum(['high', 'medium', 'low']).describe('How well documented this explanation actually is'),
  uncertaintyNote: z
    .string()
    .describe(
      'What you are unsure about and what a human should verify before publishing. Never leave this empty; if the whole draft is speculative, say so here.'
    ),
});

const SYSTEM_PROMPT = `You are the research assistant for Superstition Catcher, a catalog that documents
superstitions and traces where they came from.

House rules, in order of importance:

1. Never invent history. If you do not know where a practice came from, say so in plain words
   inside the field itself and set confidence to "low". A draft that says "the origin of this is
   not well documented, though similar practices in the region suggest X" is far more valuable
   than a confident fabrication. Do not invent dates, named scholars, studies, or statistics. If
   you reach for a specific citable claim and are not certain of it, drop the claim.

2. Not every superstition has a hidden practical reason. Some are purely symbolic, some are
   religious, some are simply old. The lazy answer is to invent a sanitation or safety rationale
   for everything. Resist that. "There is no known practical basis; this one appears to be purely
   symbolic" is a legitimate and often correct answer for theRealReason.

3. Document beliefs, never sneer at them. The people who hold these beliefs are the readers.
   Warm, curious, genuinely delighted by the strange ones. Never condescending, never
   "of course, primitive people thought...". Where a belief encodes real accumulated knowledge,
   say so with respect.

4. Be careful and neutral around practices touching caste, gender, menstruation, disability, or
   death rites. Describe what is believed and its documented history without endorsing harm and
   without lecturing the reader.

5. Match the house voice: direct, concrete, a little playful, no filler.

uncertaintyNote is the most important field you write. It is what the human editor reads first.`;

export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (!isAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured on the server' },
        { status: 503 }
      );
    }

    const { myth, country } = await request.json();

    if (!myth || typeof myth !== 'string' || !myth.trim()) {
      return NextResponse.json({ error: 'myth is required' }, { status: 400 });
    }

    const client = new Anthropic();

    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: 'high',
        format: zodOutputFormat(OriginDraft),
      },
      messages: [
        {
          role: 'user',
          content: [
            'Draft a case file for this submitted superstition.',
            country ? `Country given by the submitter: ${country}` : 'No country was given.',
            '',
            'Submission:',
            myth.trim().slice(0, 1000),
          ].join('\n'),
        },
      ],
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: 'Could not produce a structured draft for this submission' },
        { status: 502 }
      );
    }

    return NextResponse.json({ draft: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Rate limited, try again shortly' }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid Anthropic API key' }, { status: 502 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('POST /api/explain Anthropic error:', error.status, error.message);
      return NextResponse.json({ error: 'The research assistant failed' }, { status: 502 });
    }
    console.error('POST /api/explain error:', error);
    return NextResponse.json({ error: 'Failed to draft an explanation' }, { status: 500 });
  }
}
