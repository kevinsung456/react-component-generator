import { useState, useEffect } from 'react';

type Reviver<T> = (value: unknown) => T;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  reviver?: Reviver<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      const parsed: unknown = JSON.parse(raw);
      return reviver ? reviver(parsed) : (parsed as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // QuotaExceededError, SecurityError(private mode) 등 조용히 무시
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
