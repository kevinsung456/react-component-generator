import { CodeView } from './CodeView';

interface StreamingCardProps {
  streamingCode: string;
  prompt: string;
}

export function StreamingCard({ streamingCode, prompt }: StreamingCardProps) {
  return (
    <div className="component-card streaming-card">
      <div className="card-header">
        <div className="card-info">
          <p className="card-prompt">
            <span className="prompt-label">프롬프트</span>
            {prompt}
          </p>
          <div className="card-meta">
            <span className="badge badge-streaming">스트리밍 중...</span>
          </div>
        </div>
      </div>
      <CodeView code={streamingCode} isStreaming={true} />
    </div>
  );
}
