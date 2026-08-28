import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "../api/apiError";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Re-run the async function (e.g. pull-to-refresh or after a mutation). */
  reload: () => void;
}

/**
 * Single responsibility: run an async loader on mount (and on demand),
 * exposing loading / error / data so every screen handles those states
 * the same way. `deps` re-runs the loader when they change.
 *
 * A reload that already has data updates it in place (no spinner / blank
 * screen); the full-screen spinner only shows on the first load or after
 * an error clears the data.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runLoader = useCallback(loader, deps);

  const execute = useCallback(() => {
    let cancelled = false;
    if (!hasData.current) setIsLoading(true);
    setError(null);

    runLoader()
      .then((result) => {
        if (cancelled) return;
        hasData.current = true;
        setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [runLoader]);

  useEffect(execute, [execute]);

  const reload = useCallback(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, reload };
}
