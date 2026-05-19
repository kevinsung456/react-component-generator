export interface SseEvent {
  type: 'delta' | 'done' | 'error';
  text?: string;
  code?: string;
  message?: string;
}

export function parseSseBuffer(buffer: string): { events: SseEvent[]; remainder: string } {
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() ?? '';
  const events: SseEvent[] = [];

  for (const part of parts) {
    if (!part.startsWith('data: ')) continue;
    try {
      events.push(JSON.parse(part.slice(6)));
    } catch {
      // Skip malformed JSON
    }
  }

  return { events, remainder };
}
