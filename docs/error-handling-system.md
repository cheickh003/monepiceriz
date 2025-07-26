# Système de Gestion d'Erreurs Cohérent

Ce document décrit le système de gestion d'erreurs cohérent implémenté pour toutes les pages admin en utilisant les callbacks `onError` d'Inertia.js et un composant Toast global.

## Architecture du Système

### 1. Hook `useErrorHandler`

Le hook principal qui fournit une gestion d'erreurs centralisée et réutilisable.

**Emplacement**: `resources/js/hooks/useErrorHandler.ts`

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { handleError, createErrorHandler, handlers } = useErrorHandler();
```

#### Fonctionnalités principales:

- **`handleError(error, options)`**: Gère une erreur avec des options personnalisables
- **`createErrorHandler(options)`**: Crée un handler d'erreur réutilisable
- **`handlers`**: Handlers prédéfinis pour les opérations courantes (create, update, delete, etc.)

### 2. Hook `useInertiaErrorHandler`

Hook spécialisé pour les formulaires Inertia avec des messages adaptés.

```typescript
import { useInertiaErrorHandler } from '@/hooks/useErrorHandler';

const { createFormErrorHandler } = useInertiaErrorHandler();

// Utilisation dans un formulaire
const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/categories', {
        onSuccess: () => {
            toast({
                title: "Succès",
                description: "La catégorie a été créée avec succès",
                variant: "success",
            });
        },
        onError: createFormErrorHandler('create', {
            toastDescription: "Impossible de créer la catégorie"
        })
    });
};
```

### 3. Configuration Globale

**Emplacement**: `resources/js/app.tsx`

Le système inclut une gestion globale des erreurs Inertia via l'événement `error`:

```typescript
// Configuration globale des gestionnaires d'erreur Inertia
router.on('error', (event) => {
    const errors = event.detail.errors;
    console.error('Inertia Global Error:', errors);
    
    // Affichage d'un toast générique pour les erreurs non gérées
    if (Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        
        toast({
            title: "Erreur de validation",
            description: errorMessage || "Une erreur de validation s'est produite",
            variant: "destructive",
        });
    }
});
```

### 4. Composant Toast

Le système utilise le composant Toast existant dans `resources/js/Components/ui/toast.tsx` avec le hook `useToast` pour afficher les notifications.

## Patterns d'Utilisation

### 1. Formulaires de Création

```typescript
import { useInertiaErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';

export default function CategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({...});
    const { createFormErrorHandler } = useInertiaErrorHandler();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories', {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "La catégorie a été créée avec succès",
                    variant: "success",
                });
            },
            onError: createFormErrorHandler('create', {
                toastDescription: "Impossible de créer la catégorie"
            })
        });
    };
}
```

### 2. Formulaires de Modification

```typescript
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/categories/${category.id}`, {
        onSuccess: () => {
            toast({
                title: "Succès", 
                description: "La catégorie a été modifiée avec succès",
                variant: "success",
            });
        },
        onError: createFormErrorHandler('update', {
            toastDescription: "Impossible de modifier la catégorie"
        })
    });
};
```

### 3. Suppression d'Éléments

```typescript
const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        router.delete(`/admin/categories/${category.id}`, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "La catégorie a été supprimée avec succès",
                    variant: "success",
                });
            },
            onError: createFormErrorHandler('delete', {
                toastDescription: "Impossible de supprimer la catégorie"
            })
        });
    }
};
```

### 4. Hooks Personnalisés

Pour les hooks comme `useProductForm`, intégrez la gestion d'erreurs directement:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';

export const useProductForm = (options = {}) => {
    const { handlers } = useErrorHandler();
    
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        router.post(url, formData, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: isEdit 
                        ? "Le produit a été modifié avec succès" 
                        : "Le produit a été créé avec succès",
                    variant: "success",
                });
                onSuccess?.();
            },
            onError: (errors) => {
                const errorHandler = isEdit ? handlers.update : handlers.create;
                errorHandler(errors);
                onError?.(errors);
            },
        });
    }, []);
};
```

## Types d'Erreurs Gérées

### 1. Erreurs de Validation (422)
- Messages extraits des erreurs de validation Laravel
- Affichage du premier message d'erreur pertinent
- Toast avec variant "destructive"

### 2. Erreurs d'Autorisation (401/403)
- Messages spécifiques selon le code d'erreur
- Redirection automatique si nécessaire

### 3. Erreurs Serveur (5xx)
- Messages génériques pour les erreurs serveur
- Logging des erreurs pour le debugging

### 4. Erreurs Réseau
- Gestion des timeouts et erreurs de connexion
- Messages utilisateur appropriés

## Handlers Prédéfinis

Le système fournit des handlers prédéfinis pour les opérations courantes:

```typescript
const { handlers } = useErrorHandler();

// Handlers disponibles:
handlers.create    // Pour les créations
handlers.update    // Pour les modifications  
handlers.delete    // Pour les suppressions
handlers.fetch     // Pour le chargement de données
handlers.validation // Pour les erreurs de validation
handlers.permission // Pour les erreurs de permissions
handlers.network   // Pour les erreurs réseau
```

## Personnalisation

### Options du Handler d'Erreur

```typescript
interface ErrorHandlerOptions {
  showToast?: boolean;           // Afficher le toast (défaut: true)
  toastTitle?: string;           // Titre personnalisé
  toastDescription?: string;     // Description personnalisée
  onError?: (errors: any) => void; // Callback personnalisé
}
```

### Exemple de Personnalisation Avancée

```typescript
const customErrorHandler = createErrorHandler({
    showToast: true,
    toastTitle: "Erreur Personnalisée",
    toastDescription: "Une erreur spécifique s'est produite",
    onError: (errors) => {
        // Logique personnalisée
        console.error('Erreur personnalisée:', errors);
        // Redirection, analytics, etc.
    }
});
```

## Avantages du Système

1. **Cohérence**: Tous les messages d'erreur suivent le même format
2. **Réutilisabilité**: Handlers réutilisables dans toute l'application
3. **Maintenabilité**: Gestion centralisée des erreurs
4. **Extensibilité**: Facile d'ajouter de nouveaux types d'erreurs
5. **UX**: Feedback immédiat et cohérent pour l'utilisateur
6. **Debugging**: Logging centralisé des erreurs

## Migration des Pages Existantes

Pour migrer une page existante vers le nouveau système:

1. Importer le hook approprié:
```typescript
import { useInertiaErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';
```

2. Utiliser le hook dans le composant:
```typescript
const { createFormErrorHandler } = useInertiaErrorHandler();
```

3. Remplacer les anciens gestionnaires d'erreur:
```typescript
// Ancien
onError: () => {
    alert('Erreur!');
}

// Nouveau
onError: createFormErrorHandler('create', {
    toastDescription: "Message d'erreur spécifique"
})
```

4. Ajouter les toasts de succès:
```typescript
onSuccess: () => {
    toast({
        title: "Succès",
        description: "Opération réussie",
        variant: "success",
    });
}
```

## Tests

Pour tester le système de gestion d'erreurs:

1. **Tests Unitaires**: Tester les hooks `useErrorHandler` et `useInertiaErrorHandler`
2. **Tests d'Intégration**: Vérifier que les erreurs sont correctement affichées
3. **Tests E2E**: Simuler des erreurs réseau et serveur

## Bonnes Pratiques

1. **Messages Spécifiques**: Utilisez des messages d'erreur contextuels
2. **Feedback Positif**: N'oubliez pas les toasts de succès
3. **Logging**: Loggez toujours les erreurs pour le debugging
4. **Graceful Degradation**: Gérez les cas où le toast ne peut pas s'afficher
5. **Accessibilité**: Assurez-vous que les messages sont accessibles aux lecteurs d'écran

## Maintenance

- Vérifiez régulièrement les logs d'erreurs pour identifier les patterns
- Mettez à jour les messages d'erreur selon les retours utilisateurs
- Ajoutez de nouveaux handlers selon les besoins de l'application 