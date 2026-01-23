import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Interakktive - AI-Powered Trading Indicators';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a14 0%, #000000 100%)',
          position: 'relative',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '24px',
            }}
          >
            INTERAKKTIVE
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: '#ffffff',
              marginBottom: '16px',
            }}
          >
            AI-Powered Trading Indicators
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 24,
              color: '#9ca3af',
              maxWidth: '800px',
            }}
          >
            Advanced ML-enabled indicators for TradingView
          </div>

          {/* Feature badges */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                padding: '12px 24px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: 18,
              }}
            >
              8 Free Indicators
            </div>
            <div
              style={{
                padding: '12px 24px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '8px',
                color: '#a78bfa',
                fontSize: 18,
              }}
            >
              ATLAS PRO Suite
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
