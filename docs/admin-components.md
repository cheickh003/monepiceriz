# Composants Admin Réutilisables

Ce document décrit les composants réutilisables créés pour l'interface d'administration de Monepiceriz.

## Vue d'ensemble

Les composants admin ont été créés pour standardiser l'interface utilisateur et réduire la duplication de code dans les pages d'administration. Ils sont situés dans `resources/js/Components/admin/`.

## Composants disponibles

### 1. AdminTable

Un composant de tableau générique avec support du tri, pagination et états vides.

#### Props
- `columns: Column[]` - Configuration des colonnes
- `data: T[]` - Données à afficher
- `loading?: boolean` - État de chargement
- `pagination?` - Configuration de la pagination
- `sortBy?: string` - Colonne triée actuellement
- `sortDirection?: 'asc' | 'desc'` - Direction du tri
- `onSort?` - Callback pour le tri
- `emptyState?: ReactNode` - Composant à afficher quand aucune donnée

#### Exemple d'utilisation
```tsx
const columns: Column<Product>[] = [
    {
        key: 'name',
        title: 'Nom',
        sortable: true,
        render: (value, record) => <span className="font-medium">{value}</span>
    },
    {
        key: 'actions',
        title: 'Actions',
        align: 'right',
        render: (_, record) => <ActionDropdown actions={actions} />
    }
];

<AdminTable
    columns={columns}
    data={products}
    pagination={pagination}
    emptyState={<EmptyState icon={Package} title="Aucun produit" />}
/>
```

### 2. SearchInput

Un composant de recherche avec debounce intégré.

#### Props
- `placeholder?: string` - Texte de placeholder
- `initialValue?: string` - Valeur initiale
- `delay?: number` - Délai de debounce (défaut: 300ms)
- `onSearch?: (value: string) => void` - Callback appelé après debounce
- `title?: string` - Titre de la carte (si showCard=true)
- `showCard?: boolean` - Afficher dans une carte (défaut: true)

#### Exemple d'utilisation
```tsx
<SearchInput
    placeholder="Rechercher un produit..."
    initialValue={search}
    onSearch={setSearch}
    title="Recherche"
/>

// Version simplifiée sans carte
<SimpleSearchInput
    placeholder="Rechercher..."
    onSearch={handleSearch}
/>
```

### 3. ActionDropdown

Un menu déroulant d'actions avec support des icônes et séparateurs.

#### Props
- `actions: ActionItem[]` - Liste des actions
- `trigger?: ReactNode` - Élément déclencheur personnalisé
- `align?: 'start' | 'center' | 'end'` - Alignement du menu

#### Actions prédéfinies
```tsx
import { commonActions, useCrudActions } from '@/Components/admin';

// Actions individuelles
const viewAction = commonActions.view('/admin/products/1');
const editAction = commonActions.edit('/admin/products/1/edit');
const deleteAction = commonActions.delete(() => handleDelete());

// Hook pour actions CRUD complètes
const actions = useCrudActions('/admin/products', product, {
    canDuplicate: true,
    onDuplicate: () => handleDuplicate(product),
    onDelete: () => handleDelete(product),
    deleteDisabled: product.orders_count > 0
});
```

#### Exemple d'utilisation
```tsx
<ActionDropdown
    actions={[
        commonActions.view(`/admin/products/${product.id}`),
        commonActions.edit(`/admin/products/${product.id}/edit`),
        commonActions.delete(() => handleDelete(product))
    ]}
/>
```

### 4. EmptyState

Un composant pour afficher les états vides avec icône, titre et actions.

#### Props
- `icon?: LucideIcon` - Icône à afficher
- `title: string` - Titre principal
- `description?: string` - Description
- `actions?: EmptyStateAction[]` - Actions disponibles
- `size?: 'sm' | 'md' | 'lg'` - Taille du composant

#### États prédéfinis
```tsx
import { emptyStates, useEmptyStateWithCreate } from '@/Components/admin';

// États prédéfinis
const noProducts = emptyStates.noProducts('/admin/products/create');
const noSearchResults = emptyStates.noSearchResults(searchTerm);

// Hook pour générer facilement un état avec action de création
const emptyState = useEmptyStateWithCreate('noProducts', '/admin/products/create');
```

#### Exemple d'utilisation
```tsx
<EmptyState
    icon={Package}
    title="Aucun produit"
    description="Vous n'avez pas encore créé de produit."
    actions={[{
        label: 'Créer un produit',
        href: '/admin/products/create',
        icon: Plus
    }]}
/>
```

## Hooks utilitaires

### useCrudActions
Génère automatiquement les actions CRUD standard pour un élément.

```tsx
const actions = useCrudActions('/admin/products', product, {
    canView: true,
    canEdit: true,
    canDuplicate: true,
    canDelete: true,
    onDuplicate: () => handleDuplicate(product),
    onDelete: () => handleDelete(product),
    deleteDisabled: product.orders_count > 0
});
```

### useEmptyStateWithCreate
Génère un état vide approprié avec action de création.

```tsx
const emptyState = useEmptyStateWithCreate('noProducts', '/admin/products/create');
```

## Intégration avec les hooks de debounce

Les composants utilisent les hooks de debounce existants :

```tsx
import { useDebouncedInput, useDebouncedSearch } from '@/hooks/useDebounce';

// Dans SearchInput
const { value, debouncedValue, setValue, isDirty } = useDebouncedInput(initialValue, delay);
```

## Refactorisation des pages existantes

Les pages suivantes ont été refactorisées pour utiliser ces composants :

### Categories/Index.tsx
- Remplacement du tableau manuel par `AdminTable`
- Utilisation de `SearchInput` pour la recherche
- `ActionDropdown` pour les actions sur chaque catégorie
- `EmptyState` pour les états vides

### Products/Index.tsx
- Remplacement du tableau complexe par `AdminTable`
- Configuration des colonnes avec rendu personnalisé
- Intégration de la pagination
- États vides avec actions de création

### ProductAttributes/Index.tsx
- Simplification avec `AdminTable`
- `SearchInput` avec debounce
- Actions CRUD standardisées

### Orders/Index.tsx
- Tableau simplifié avec `AdminTable`
- Recherche debouncée intégrée
- États vides appropriés

## Avantages

1. **Consistance** : Interface utilisateur cohérente dans toute l'administration
2. **Réutilisabilité** : Composants facilement réutilisables
3. **Maintenabilité** : Modifications centralisées dans les composants
4. **Performance** : Debounce intégré pour les recherches
5. **Accessibilité** : Composants construits avec les bonnes pratiques
6. **TypeScript** : Support complet avec types appropriés

## Migration

Pour migrer une page existante :

1. Importer les composants nécessaires :
```tsx
import {
    AdminTable,
    SearchInput,
    ActionDropdown,
    EmptyState,
    useCrudActions,
    type Column
} from '@/Components/admin';
```

2. Configurer les colonnes :
```tsx
const columns: Column<T>[] = [
    {
        key: 'name',
        title: 'Nom',
        sortable: true,
        render: (value, record) => // rendu personnalisé
    }
];
```

3. Remplacer le tableau existant :
```tsx
<AdminTable
    columns={columns}
    data={data}
    emptyState={<EmptyState ... />}
/>
```

4. Remplacer la recherche :
```tsx
<SearchInput
    onSearch={handleSearch}
    placeholder="Rechercher..."
/>
```

## Notes techniques

- Les composants utilisent les composants UI existants (shadcn/ui)
- Compatible avec Inertia.js pour la navigation
- Support des icônes Lucide React
- Intégration avec le système de types TypeScript existant
- Gestion des erreurs et états de chargement 