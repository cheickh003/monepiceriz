import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageOptions {
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  syncData?: boolean;
}

/**
 * Hook personnalisé pour gérer le localStorage avec synchronisation entre onglets
 * @param key - La clé pour stocker dans localStorage
 * @param initialValue - La valeur initiale
 * @param options - Options pour la sérialisation et la synchronisation
 * @returns [value, setValue, remove] - La valeur, fonction pour modifier, fonction pour supprimer
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
  } = options;

  // Fonction pour lire depuis localStorage
  const readValue = useCallback((): T => {
    // Prévenir les erreurs SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, deserializer]);

  // État avec lazy initial state
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Fonction pour écrire dans localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      // Prévenir les erreurs SSR
      if (typeof window === 'undefined') {
        console.warn(
          `Tentative d'utilisation de localStorage sur le serveur. Veuillez utiliser useLocalStorage uniquement côté client.`
        );
        return;
      }

      try {
        // Permettre la valeur d'être une fonction
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Sauvegarder dans l'état
        setStoredValue(valueToStore);
        
        // Sauvegarder dans localStorage
        window.localStorage.setItem(key, serializer(valueToStore));
        
        // Dispatch un événement custom pour la synchronisation
        if (syncData) {
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: key,
              newValue: serializer(valueToStore),
              url: window.location.href,
              storageArea: window.localStorage,
            })
          );
        }
      } catch (error) {
        console.warn(`Erreur lors de l'écriture dans localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue, syncData]
  );

  // Fonction pour supprimer de localStorage
  const remove = useCallback(() => {
    // Prévenir les erreurs SSR
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Dispatch un événement custom pour la synchronisation
      if (syncData) {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: key,
            newValue: null,
            url: window.location.href,
            storageArea: window.localStorage,
          })
        );
      }
    } catch (error) {
      console.warn(`Erreur lors de la suppression de localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncData]);

  // Écouter les changements de localStorage (synchronisation entre onglets)
  useEffect(() => {
    if (!syncData) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== localStorage) return;
      
      try {
        setStoredValue(e.newValue ? deserializer(e.newValue) : initialValue);
      } catch (error) {
        console.warn(`Erreur lors de la synchronisation de localStorage key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer, initialValue, syncData]);

  // Synchroniser avec localStorage au montage
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, remove];
}

// Hooks spécialisés utilisant useLocalStorage

/**
 * Hook pour gérer les préférences utilisateur
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    viewMode: 'grid' as 'grid' | 'list',
    favoriteFilters: [] as string[],
    currency: 'EUR',
    language: 'fr',
  });

  return { preferences, setPreferences };
}

/**
 * Hook pour gérer les produits récemment vus
 */
export function useRecentlyViewed(maxItems = 10) {
  const [items, setItems] = useLocalStorage<number[]>('recentlyViewed', []);

  const addItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const filtered = prev.filter((id) => id !== productId);
        return [productId, ...filtered].slice(0, maxItems);
      });
    },
    [setItems, maxItems]
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return { items, addItem, clearItems };
}

/**
 * Hook pour gérer les recherches récentes
 */
export function useRecentSearches(maxSearches = 5) {
  const [searches, setSearches] = useLocalStorage<string[]>('recentSearches', []);

  const addSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      
      setSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase());
        return [query, ...filtered].slice(0, maxSearches);
      });
    },
    [setSearches, maxSearches]
  );

  const removeSearch = useCallback(
    (query: string) => {
      setSearches((prev) => prev.filter((s) => s !== query));
    },
    [setSearches]
  );

  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);

  return { searches, addSearch, removeSearch, clearSearches };
}

/**
 * Hook pour gérer la wishlist/favoris
 */
export function useWishlist() {
  const [items, setItems, clearWishlist] = useLocalStorage<number[]>('wishlist', []);

  const addItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => prev.filter((id) => id !== productId));
    },
    [setItems]
  );

  const toggleItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((id) => id !== productId);
        }
        return [...prev, productId];
      });
    },
    [setItems]
  );

  const isInWishlist = useCallback(
    (productId: number) => items.includes(productId),
    [items]
  );

  return { items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist };
}

/**
 * Hook pour nettoyer automatiquement les données expirées
 */
export function useExpirableStorage<T>(
  key: string,
  initialValue: T,
  expirationTime: number // en millisecondes
) {
  interface StoredData<T> {
    value: T;
    expiry: number;
  }

  const isExpired = (expiry: number) => Date.now() > expiry;

  const [storedData, setStoredData] = useLocalStorage<StoredData<T> | null>(
    key,
    null,
    {
      deserializer: (value: string) => {
        const data = JSON.parse(value) as StoredData<T>;
        if (isExpired(data.expiry)) {
          return null;
        }
        return data;
      },
    }
  );

  const value = storedData?.value ?? initialValue;

  const setValue = useCallback(
    (newValue: T) => {
      setStoredData({
        value: newValue,
        expiry: Date.now() + expirationTime,
      });
    },
    [setStoredData, expirationTime]
  );

  const remove = useCallback(() => {
    setStoredData(null);
  }, [setStoredData]);

  // Nettoyer automatiquement les données expirées
  useEffect(() => {
    if (storedData && isExpired(storedData.expiry)) {
      remove();
    }
  }, [storedData, remove]);

  return [value, setValue, remove] as const;
}