# Composants Admin

Ce dossier contient les composants réutilisables pour l'interface d'administration, suivant les patterns shadcn/ui et cohérents avec le design existant.

## Composants disponibles

### AdminTable

Composant de tableau avancé avec support du tri, pagination et états vides.

**Fonctionnalités :**
- Colonnes configurables avec rendu personnalisé
- Tri par colonnes (optionnel)
- Pagination intégrée
- État de chargement
- État vide personnalisable
- Alignement des colonnes (left, center, right)

**Utilisation :**
```tsx
import { AdminTable, type Column } from '@/Components/admin';

const columns: Column<Product>[] = [
    {
        key: 'name',
        title: 'Nom',
        sortable: true,
        render: (value, record) => (
            <div className="font-medium">{value}</div>
        )
    },
    {
        key: 'price',
        title: 'Prix',
        align: 'right',
        render: (value) => formatPrice(value)
    }
];

<AdminTable
    data={products}
    columns={columns}
    loading={loading}
    pagination={pagination}
    onSort={(key, direction) => handleSort(key, direction)}
    emptyState={{
        title: "Aucun produit",
        description: "Vous n'avez pas encore ajouté de produits.",
        action: {
            label: "Ajouter un produit",
            onClick: () => navigate('/admin/products/create')
        }
    }}
/>
```

### ActionDropdown

Menu déroulant pour les actions CRUD avec icônes et variantes.

**Fonctionnalités :**
- Actions avec liens ou callbacks
- Icônes automatiques selon la clé d'action
- Variantes (default, destructive, warning)
- Actions désactivées
- Séparateurs entre groupes d'actions
- Liens externes

**Utilisation :**
```tsx
import { ActionDropdown, type ActionItem } from '@/Components/admin';

const actions: ActionItem[] = [
    {
        key: 'view',
        label: 'Voir',
        href: `/admin/products/${product.id}`
    },
    {
        key: 'edit',
        label: 'Modifier',
        href: `/admin/products/${product.id}/edit`
    },
    {
        key: 'delete',
        label: 'Supprimer',
        variant: 'destructive',
        onClick: () => handleDelete(product),
        disabled: product.hasOrders
    }
];

<ActionDropdown actions={actions} />
```

### SearchInput

Composant de recherche avec debounce et indicateur de chargement.

**Fonctionnalités :**
- Debounce configurable (300ms par défaut)
- Indicateur de chargement
- Bouton d'effacement
- Raccourcis clavier (Enter, Escape)
- Tailles multiples (sm, default, lg)

**Utilisation :**
```tsx
import { SearchInput } from '@/Components/admin';

<SearchInput
    value={searchTerm}
    placeholder="Rechercher des produits..."
    onSearch={handleSearch}
    onClear={handleClearSearch}
    loading={loading}
    debounceMs={500}
    showClearButton={true}
/>
```

### EmptyState

Composant pour afficher les états vides avec actions optionnelles.

**Fonctionnalités :**
- États prédéfinis pour cas courants
- Icônes personnalisables
- Actions primaires et secondaires
- Tailles multiples
- Types d'états (default, search, error, success)

**Utilisation :**
```tsx
import { EmptyState, EmptyStates } from '@/Components/admin';

// État prédéfini
<EmptyState
    {...EmptyStates.noProducts(() => navigate('/admin/products/create'))}
/>

// État personnalisé
<EmptyState
    title="Aucune donnée"
    description="Aucun élément à afficher pour le moment."
    icon={<Package className="h-12 w-12 text-muted-foreground" />}
    action={{
        label: "Actualiser",
        onClick: () => window.location.reload()
    }}
/>
```

### useCrudActions (Hook)

Hook pour générer automatiquement les actions CRUD communes.

**Fonctionnalités :**
- Actions CRUD automatiques (view, edit, delete, duplicate)
- Messages de confirmation personnalisables
- Actions désactivées conditionnellement
- Actions personnalisées
- Gestion automatique des routes

**Utilisation :**
```tsx
import { useCrudActions } from '@/Components/admin';

const actions = useCrudActions('/admin/products', product, {
    canView: true,
    canEdit: true,
    canDelete: true,
    canDuplicate: true,
    deleteDisabled: product.hasOrders,
    onDelete: () => handleCustomDelete(product),
    deleteConfirmMessage: `Supprimer le produit "${product.name}" ?`,
    customActions: [
        {
            key: 'export',
            label: 'Exporter',
            onClick: () => exportProduct(product)
        }
    ]
});

return <ActionDropdown actions={actions} />;
```

## États prédéfinis (EmptyStates)

- `noProducts(onCreateProduct?)` - Aucun produit
- `noOrders()` - Aucune commande  
- `noCategories(onCreateCategory?)` - Aucune catégorie
- `noUsers()` - Aucun utilisateur
- `searchNoResults(query, onClearSearch?)` - Aucun résultat de recherche
- `error(message, onRetry?)` - Erreur générique

## Patterns et conventions

### Nommage des actions
Les clés d'actions suivent des conventions pour l'attribution automatique d'icônes :
- `view`, `show` → Icône Eye
- `edit` → Icône Edit
- `delete` → Icône Trash2
- `duplicate`, `copy` → Icône Copy
- `download` → Icône Download
- `archive` → Icône Archive
- `restore` → Icône RotateCcw

### Variantes d'actions
- `default` - Action normale
- `destructive` - Action de suppression (rouge)
- `warning` - Action d'attention (orange)

### Alignement des colonnes
- `left` - Alignement à gauche (par défaut)
- `center` - Alignement centré
- `right` - Alignement à droite (recommandé pour les prix/nombres)

## Intégration avec les pages existantes

Ces composants sont conçus pour remplacer progressivement les implémentations existantes dans les pages admin. Ils sont compatibles avec :

- Inertia.js pour la navigation
- Laravel pour les routes backend
- Shadcn/ui pour le design system
- Tailwind CSS pour les styles

## Démonstration

Une page de démonstration est disponible dans `AdminComponentsDemo.tsx` montrant l'utilisation de tous les composants avec des données d'exemple. 