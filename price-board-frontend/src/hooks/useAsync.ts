import { useCallback, useEffect, useState } from "react";
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
 */
export function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runLoader = useCallback(loader, deps);

  const execute = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    runLoader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
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
