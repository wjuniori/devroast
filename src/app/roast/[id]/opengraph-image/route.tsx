import { ImageResponse } from 'next/og';
import db from '@/db/client';
import { roastSubmissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import RoastOGImage from '@/components/og/RoastOGImage';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let roast: typeof roastSubmissions.$inferSelect | undefined;
  try {
    roast = await db.query.roastSubmissions.findFirst({
      where: eq(roastSubmissions.id, id),
    });
  } catch {
    return new Response('Database error', { status: 500 });
  }

  if (!roast || roast.status !== 'completed') {
    return new Response('Not found', { status: 404 });
  }

  let fontData: ArrayBuffer;
  try {
    fontData = await fetch(
      new URL('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf')
    ).then((res) => res.arrayBuffer());
  } catch {
    fontData = new ArrayBuffer();
  }

  return new ImageResponse(
    <RoastOGImage
      score={Number(roast.score) || 0}
      verdict={roast.verdict || 'analyzed'}
      headline={roast.headline || 'Code roasted to perfection'}
      language={roast.language || 'unknown'}
      lineCount={roast.sourceLineCount || 0}
    />,
    {
      ...size,
      fonts: [{ name: 'JetBrains Mono', data: fontData, weight: 400 }],
    }
  );
}
