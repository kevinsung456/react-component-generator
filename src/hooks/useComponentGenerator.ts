/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { useLocalStorage } from './useLocalStorage';

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

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => {
        const updated = [newComponent, ...prev];
        return updated.slice(0, 20);
      });

      setPromptHistory((prev) => {
        const deduplicated = prev.filter((p) => p !== prompt);
        return [prompt, ...deduplicated].slice(0, 50);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
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
    isLoading,
    error,
    generate,
    removeComponent,
    clearAll,
    promptHistory,
    clearHistory,
  };
}
