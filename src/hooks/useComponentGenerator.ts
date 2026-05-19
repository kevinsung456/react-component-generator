/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider, StreamingComponent } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { parseSseBuffer } from '../utils/sseParser';

type SerializedComponent = Omit<GeneratedComponent, 'createdAt'> & {
  createdAt: string;
};

function reviveComponents(value: unknown): GeneratedComponent[] {
  if (!Array.isArray(value)) return [];
  return (value as SerializedComponent[]).map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));
}

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  streamingComponent: StreamingComponent | null;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
  promptHistory: string[];
  clearHistory: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useLocalStorage<GeneratedComponent[]>(
    'rcg__components',
    [],
    reviveComponents
  );
  const [promptHistory, setPromptHistory] = useLocalStorage<string[]>(
    'rcg__prompt_history',
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingComponent, setStreamingComponent] = useState<StreamingComponent | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date();

    setStreamingComponent({ id, prompt, streamingCode: '', createdAt });

    try {
      const res = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate component');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = parseSseBuffer(buffer);
        buffer = remainder;

        for (const event of events) {
          if (event.type === 'delta') {
            setStreamingComponent((prev) =>
              prev ? { ...prev, streamingCode: prev.streamingCode + (event.text || '') } : prev
            );
          } else if (event.type === 'done') {
            const newComponent: GeneratedComponent = {
              id,
              prompt,
              code: event.code || '',
              createdAt,
            };

            setComponents((prev) => {
              const updated = [newComponent, ...prev];
              return updated.slice(0, 20);
            });

            setPromptHistory((prev) => {
              const deduplicated = prev.filter((p) => p !== prompt);
              return [prompt, ...deduplicated].slice(0, 50);
            });

            setStreamingComponent(null);
          } else if (event.type === 'error') {
            throw new Error(event.message || 'Unknown error');
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStreamingComponent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  const clearHistory = useCallback(() => {
    setPromptHistory([]);
  }, []);

  return {
    components,
    streamingComponent,
    isLoading,
    error,
    generate,
    removeComponent,
    clearAll,
    promptHistory,
    clearHistory,
  };
}
