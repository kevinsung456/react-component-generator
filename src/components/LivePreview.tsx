import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
}

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_SIZES: Record<Viewport, number | null> = {
  mobile: 375,
  tablet: 768,
  desktop: null,
};

const VIEWPORT_LABELS: Record<Viewport, string> = {
  mobile: '📱',
  tablet: '⊞',
  desktop: '🖥',
};

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const viewportWidth = VIEWPORT_SIZES[viewport];

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-buttons">
          {(Object.keys(VIEWPORT_SIZES) as Viewport[]).map((v) => (
            <button
              key={v}
              className={`viewport-btn ${viewport === v ? 'viewport-btn--active' : ''}`}
              onClick={() => setViewport(v)}
              title={v === 'mobile' ? '모바일 (375px)' : v === 'tablet' ? '태블릿 (768px)' : '데스크탑 (전체)'}
            >
              {VIEWPORT_LABELS[v]}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render-container" style={viewportWidth ? { width: `${viewportWidth}px` } : undefined}>
            <div className="preview-render">
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
