import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook de debounce pour optimiser les performances
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Créer un timer pour mettre à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour créer une fonction debouncée
 * @param callback - La fonction à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La fonction debouncée
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Mettre à jour la référence du callback si elle change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Annuler le timer précédent
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Créer un nouveau timer
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook pour debouncer une valeur avec des options avancées
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes
 * @param options - Options supplémentaires
 * @returns Un objet contenant la valeur debouncée et des méthodes de contrôle
 */
interface DebounceOptions {
  leading?: boolean; // Exécuter immédiatement au début
  trailing?: boolean; // Exécuter à la fin du délai (par défaut: true)
  maxWait?: number; // Temps maximum d'attente
}

export function useAdvancedDebounce<T>(
  value: T,
  delay: number,
  options: DebounceOptions = {}
) {
  const { leading = false, trailing = true, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastDebouncedTimeRef = useRef<number | null>(null);
  const leadingRef = useRef(leading);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setDebouncedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const now = Date.now();
    const isFirstCall = lastCallTimeRef.current === null;
    lastCallTimeRef.current = now;

    // Exécuter immédiatement si leading est activé et c'est le premier appel
    if (leadingRef.current && isFirstCall) {
      setDebouncedValue(value);
      lastDebouncedTimeRef.current = now;
    }

    // Fonction pour mettre à jour la valeur
    const updateValue = () => {
      setDebouncedValue(value);
      lastDebouncedTimeRef.current = Date.now();
      cancel();
    };

    // Gérer le délai maximum si spécifié
    if (maxWait && !maxTimeoutRef.current) {
      const timeElapsed = lastDebouncedTimeRef.current
        ? now - lastDebouncedTimeRef.current
        : 0;
      const timeToWait = Math.max(0, maxWait - timeElapsed);

      maxTimeoutRef.current = setTimeout(() => {
        updateValue();
        maxTimeoutRef.current = null;
      }, timeToWait);
    }

    // Gérer le debounce normal
    if (trailing) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        updateValue();
        lastCallTimeRef.current = null;
        leadingRef.current = leading; // Réinitialiser pour le prochain cycle
      }, delay);
    }

    return cancel;
  }, [value, delay, cancel, leading, trailing, maxWait]);

  return {
    debouncedValue,
    cancel,
    flush,
    isPending: timeoutRef.current !== null,
  };
}

/**
 * Hook pour debouncer les entrées de formulaire
 * @param initialValue - La valeur initiale
 * @param delay - Le délai en millisecondes
 * @returns Un objet avec la valeur, la valeur debouncée et un setter
 */
export function useDebouncedInput<T = string>(
  initialValue: T,
  delay: number = 500
) {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return {
    value,
    debouncedValue,
    setValue,
    isDirty: value !== debouncedValue,
  };
}

/**
 * Hook pour debouncer les recherches avec état de chargement
 * @param searchFunction - La fonction de recherche à exécuter
 * @param delay - Le délai en millisecondes
 * @returns Un objet avec les méthodes de recherche et l'état
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedQuery);
        if (!cancelled) {
          setResults(searchResults);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Erreur de recherche'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    debouncedQuery,
  };
}

/**
 * Hook pour throttle (limiter la fréquence d'exécution)
 * @param value - La valeur à throttler
 * @param delay - Le délai minimum entre les mises à jour
 * @returns La valeur throttlée
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdatedRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdatedRef.current;

    if (timeSinceLastUpdate >= delay) {
      // Si assez de temps s'est écoulé, mettre à jour immédiatement
      setThrottledValue(value);
      lastUpdatedRef.current = now;
    } else {
      // Sinon, programmer une mise à jour pour plus tard
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastUpdatedRef.current = Date.now();
      }, delay - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}