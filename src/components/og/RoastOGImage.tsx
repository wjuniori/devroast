interface RoastOGImageProps {
  score: number;
  verdict: string;
  headline: string;
  language: string;
  lineCount: number;
}

const COLORS = {
  bgPage: '#09090b',
  accentAmber: '#f59e0b',
  accentRed: '#ef4444',
  accentGreen: '#22c55e',
  textPrimary: '#fafafa',
  textTertiary: '#71717a',
};

export default function RoastOGImage({
  score,
  verdict,
  headline,
  language,
  lineCount,
}: RoastOGImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: COLORS.bgPage,
        padding: 64,
        gap: 28,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          width: '100%',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: COLORS.accentGreen, fontSize: 24, fontWeight: 700 }}>&gt;</span>
          <span style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: 500 }}>devroast</span>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ color: COLORS.accentAmber, fontSize: 160, fontWeight: 900, lineHeight: 1 }}>
            {score.toFixed(1)}
          </span>
          <span style={{ color: COLORS.textTertiary, fontSize: 56, lineHeight: 1 }}>/10</span>
        </div>

        {/* Verdict */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: COLORS.accentRed,
            }}
          />
          <span style={{ color: COLORS.accentRed, fontSize: 20 }}>
            {verdict}
          </span>
        </div>

        {/* Language Info */}
        <span style={{ color: COLORS.textTertiary, fontSize: 16, fontFamily: 'JetBrains Mono, monospace' }}>
          lang: {language} · {lineCount} lines
        </span>

        {/* Headline Quote */}
        <span
          style={{
            color: COLORS.textPrimary,
            fontSize: 22,
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          "{headline}"
        </span>
      </div>
    </div>
  );
}
