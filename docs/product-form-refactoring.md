# Refactorisation des Formulaires de Produits

## Vue d'ensemble

Cette refactorisation vise à améliorer la maintenabilité et la réutilisabilité du code des formulaires de produits en extrayant la logique commune dans un hook personnalisé et des fonctions utilitaires.

## Architecture

### 1. Types Communs (`resources/js/types/Product.ts`)

Centralisation de toutes les interfaces TypeScript liées aux produits :

- `Category` : Structure des catégories avec support hiérarchique
- `Attribute` : Attributs de produits avec leurs valeurs
- `ProductImage` : Images de produits
- `Sku` : Variantes de produits (Stock Keeping Units)
- `Product` : Modèle complet de produit
- `ProductFormData` : Structure des données de formulaire

### 2. Fonctions Utilitaires (`resources/js/lib/productUtils.ts`)

Fonctions pures pour la manipulation des données :

#### Gestion des SKUs
- `createDefaultSku()` : Crée un nouveau SKU avec valeurs par défaut
- `updateSkuInList()` : Met à jour un SKU et gère la logique des SKUs par défaut
- `updateSkuAttribute()` : Met à jour les attributs d'un SKU
- `removeSkuFromList()` : Supprime ou marque pour suppression un SKU
- `validateSkus()` : Valide qu'il y a au moins un SKU actif

#### Gestion des Formulaires
- `generateSlug()` : Génère un slug URL-friendly à partir d'un nom
- `prepareFormDataForSubmission()` : Prépare les données pour l'envoi au serveur
- `getInitialFormData()` : Données initiales pour la création
- `getInitialFormDataFromProduct()` : Données initiales pour l'édition

#### Utilitaires
- `renderCategoryOptions()` : Génère les options de catégories hiérarchiques

### 3. Hook Personnalisé (`resources/js/hooks/useProductForm.ts`)

Hook React qui encapsule toute la logique de gestion d'état des formulaires de produits.

#### Interface
```typescript
interface UseProductFormOptions {
    product?: Product;        // Produit existant (pour l'édition)
    onSuccess?: () => void;   // Callback de succès
    onError?: (errors: any) => void; // Callback d'erreur
}
```

#### États Exposés
- `data` : Données du formulaire
- `processing` : État de traitement
- `errors` : Erreurs de validation
- `activeTab` : Onglet actif
- `skus` : Liste des SKUs
- `existingImages` : Images existantes (édition)
- `mainImage` : Nouvelle image principale
- `galleryImages` : Nouvelles images de galerie
- `hasChanges` : Indicateur de modifications

#### Actions Exposées
- `handleNameChange()` : Gestion du nom avec génération automatique du slug
- `handleMainImageChange()` : Gestion de l'image principale
- `handleGalleryImagesChange()` : Gestion des images de galerie
- `deleteExistingImage()` : Suppression d'images existantes
- `addSku()` : Ajout d'un nouveau SKU
- `updateSku()` : Mise à jour d'un SKU
- `updateSkuAttributeValue()` : Mise à jour des attributs de SKU
- `removeSku()` : Suppression d'un SKU
- `handleSubmit()` : Soumission du formulaire
- `handleDuplicate()` : Duplication de produit (édition)
- `resetForm()` : Réinitialisation du formulaire
- `updateData()` : Mise à jour générique des données

## Utilisation

### Composant de Création

```typescript
import { useProductForm } from '@/hooks/useProductForm';

export default function ProductCreate({ categories, attributes }) {
    const {
        data,
        processing,
        errors,
        skus,
        handleNameChange,
        handleSubmit,
        // ... autres propriétés
    } = useProductForm();

    return (
        <form onSubmit={handleSubmit}>
            {/* Interface utilisateur */}
        </form>
    );
}
```

### Composant d'Édition

```typescript
import { useProductForm } from '@/hooks/useProductForm';

export default function ProductEdit({ product, categories, attributes }) {
    const {
        data,
        processing,
        errors,
        hasChanges,
        existingImages,
        handleSubmit,
        handleDuplicate,
        // ... autres propriétés
    } = useProductForm({ 
        product,
        onSuccess: () => console.log('Succès'),
        onError: (errors) => console.error(errors)
    });

    return (
        <form onSubmit={handleSubmit}>
            {/* Interface utilisateur */}
        </form>
    );
}
```

## Avantages de la Refactorisation

### 1. Réutilisabilité
- Le hook `useProductForm` peut être utilisé dans tous les formulaires de produits
- Les fonctions utilitaires sont réutilisables dans d'autres contextes
- Types partagés assurent la cohérence

### 2. Maintenabilité
- Logique centralisée dans le hook
- Séparation claire entre logique métier et interface utilisateur
- Tests unitaires plus faciles sur les fonctions utilitaires

### 3. Cohérence
- Comportement identique entre création et édition
- Validation centralisée
- Gestion d'erreurs unifiée

### 4. Extensibilité
- Ajout facile de nouvelles fonctionnalités
- Hook configurable via options
- Interface claire pour les callbacks

## Gestion des États Complexes

### SKUs
- Support pour création, modification et suppression
- Gestion automatique des SKUs par défaut
- Marquage pour suppression en mode édition

### Images
- Gestion séparée des images existantes et nouvelles
- Support pour suppression d'images existantes
- Upload multiple pour la galerie

### Validation
- Validation en temps réel
- Messages d'erreur contextuels
- Prévention de soumission avec données invalides

## Migration

Pour migrer les composants existants :

1. Remplacer les imports d'interfaces par ceux de `@/types/Product`
2. Remplacer la logique locale par l'utilisation du hook `useProductForm`
3. Adapter l'interface utilisateur pour utiliser les propriétés exposées
4. Tester le comportement pour s'assurer de la compatibilité

## Tests Recommandés

1. **Tests unitaires** pour les fonctions utilitaires
2. **Tests d'intégration** pour le hook
3. **Tests de composants** pour les formulaires
4. **Tests end-to-end** pour les workflows complets

Cette refactorisation améliore significativement la structure du code tout en conservant toutes les fonctionnalités existantes. 