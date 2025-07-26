# Guide des Loading States et Feedback Utilisateur

Ce guide présente les composants et patterns pour améliorer le feedback utilisateur dans l'application Monepiceriz.

## Vue d'ensemble

Les loading states et le feedback utilisateur sont essentiels pour une expérience utilisateur fluide. Ils informent l'utilisateur que :
- Une action est en cours
- Le système répond à leurs interactions
- Des erreurs peuvent survenir
- Des opérations longues progressent

## Composants Disponibles

### 1. LoadingButton

Bouton avec état de chargement intégré.

```tsx
import { LoadingButton } from '@/Components/LoadingButton';

<LoadingButton
  loading={isLoading}
  loadingText="Enregistrement..."
  onClick={handleSave}
>
  Enregistrer
</LoadingButton>
```

**Props :**
- `loading: boolean` - État de chargement
- `loadingText?: string` - Texte affiché pendant le chargement
- `loadingIcon?: React.ReactNode` - Icône personnalisée
- `showSpinner?: boolean` - Afficher le spinner (défaut: true)

### 2. PrimaryButton (amélioré)

Le composant PrimaryButton existant supporte maintenant les états `processing`.

```tsx
import PrimaryButton from '@/Components/PrimaryButton';

<PrimaryButton
  processing={form.processing}
  loadingText="Connexion..."
>
  Se connecter
</PrimaryButton>
```

### 3. ActionButton

Bouton spécialisé pour les actions d'administration avec confirmation optionnelle.

```tsx
import { ActionButton } from '@/Components/admin';
import { Trash2 } from 'lucide-react';

<ActionButton
  icon={Trash2}
  loading={isDeleting}
  loadingText="Suppression..."
  variant="destructive"
  confirmMessage="Êtes-vous sûr de vouloir supprimer ?"
  onClick={handleDelete}
>
  Supprimer
</ActionButton>
```

### 4. Progress & MultiProgress

Barres de progression pour les opérations longues.

```tsx
import { Progress, MultiProgress } from '@/Components/ui/progress';

// Progression simple
<Progress 
  value={progress} 
  label="Upload en cours"
  showPercentage 
/>

// Progression multiple
<MultiProgress 
  items={[
    { id: 'file1', label: 'image1.jpg', value: 75, variant: 'default' },
    { id: 'file2', label: 'image2.jpg', value: 100, variant: 'success' },
    { id: 'file3', label: 'doc.pdf', value: 45, variant: 'warning' }
  ]} 
/>
```

### 5. ActionProgress

Affichage du progrès d'actions complexes avec différents états.

```tsx
import { ActionProgress, MultiActionProgress } from '@/Components/ActionProgress';

<ActionProgress
  title="Upload des fichiers"
  description="Traitement en cours..."
  status="loading"
  progress={65}
/>

<MultiActionProgress
  actions={[
    { id: '1', title: 'Validation', status: 'success', progress: 100 },
    { id: '2', title: 'Upload', status: 'loading', progress: 45 },
    { id: '3', title: 'Traitement', status: 'idle', progress: 0 }
  ]}
/>
```

### 6. LoadingSpinner

Spinner simple pour les états de chargement.

```tsx
import LoadingSpinner from '@/Components/LoadingSpinner';

<LoadingSpinner size="medium" text="Chargement..." />
```

## Patterns d'Usage avec Inertia.js

### Formulaires avec useForm

```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
  name: '',
  email: ''
});

return (
  <form onSubmit={handleSubmit}>
    {/* Champs du formulaire */}
    
    <PrimaryButton 
      processing={processing}
      loadingText="Enregistrement..."
    >
      Enregistrer
    </PrimaryButton>
  </form>
);
```

### Actions avec router

```tsx
import { router } from '@inertiajs/react';
import { useState } from 'react';

const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = () => {
  setIsDeleting(true);
  router.delete(`/admin/products/${product.id}`, {
    onSuccess: () => setIsDeleting(false),
    onError: () => setIsDeleting(false)
  });
};
```

### Hook personnalisé avec Progress

Le hook `useProductForm` intègre maintenant le suivi des progrès :

```tsx
const {
  processing,
  uploadProgress,
  uploadingFiles,
  handleSubmit
} = useProductForm();

// Affichage des progrès d'upload
{uploadingFiles.length > 0 && (
  <MultiProgress 
    items={uploadingFiles.map(fileKey => ({
      id: fileKey,
      label: fileKey,
      value: uploadProgress[fileKey] || 0
    }))}
  />
)}
```

## Bonnes Pratiques

### 1. Désactivation des Boutons

Toujours désactiver les boutons pendant les opérations :

```tsx
<Button 
  disabled={processing || isLoading}
  onClick={handleAction}
>
  Action
</Button>
```

### 2. Feedback Immédiat

Fournir un feedback immédiat pour toute action utilisateur :

```tsx
const handleSave = async () => {
  setIsSaving(true);
  try {
    await saveData();
    toast.success("Données sauvegardées");
  } catch (error) {
    toast.error("Erreur lors de la sauvegarde");
  } finally {
    setIsSaving(false);
  }
};
```

### 3. États Cohérents

Utiliser les mêmes patterns dans toute l'application :

```tsx
// ✅ Bon
<ActionButton loading={isLoading} loadingText="Traitement...">
  Action
</ActionButton>

// ❌ Éviter
<Button disabled={isLoading}>
  {isLoading ? "Chargement..." : "Action"}
</Button>
```

### 4. Gestion des Erreurs

Toujours gérer les états d'erreur :

```tsx
<ActionProgress
  title="Upload fichier"
  status={uploadStatus}
  error={uploadError}
  progress={uploadProgress}
/>
```

## Exemples Concrets

### Formulaire de Produit

```tsx
const {
  processing,
  uploadProgress,
  uploadingFiles,
  handleSubmit
} = useProductForm();

return (
  <form onSubmit={handleSubmit}>
    {/* Champs du formulaire */}
    
    {/* Progrès d'upload */}
    {uploadingFiles.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle>Upload en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiProgress 
            items={uploadingFiles.map(fileKey => ({
              id: fileKey,
              label: fileKey === 'main_image' ? 'Image principale' : `Image ${fileKey}`,
              value: uploadProgress[fileKey] || 0
            }))}
          />
        </CardContent>
      </Card>
    )}
    
    {/* Bouton de soumission */}
    <LoadingButton
      type="submit"
      loading={processing}
      loadingText="Enregistrement..."
    >
      Enregistrer le produit
    </LoadingButton>
  </form>
);
```

### Page de Commandes

```tsx
const [isCapturingPayment, setIsCapturingPayment] = useState(false);

const handleCapturePayment = () => {
  setIsCapturingPayment(true);
  router.post(`/admin/orders/${order.id}/capture`, {}, {
    onFinish: () => setIsCapturingPayment(false)
  });
};

return (
  <ActionButton
    icon={CreditCard}
    loading={isCapturingPayment}
    loadingText="Capture en cours..."
    onClick={handleCapturePayment}
  >
    Capturer le paiement
  </ActionButton>
);
```

## Page de Démonstration

Une page de démonstration est disponible à `/admin/loading-states-demo` pour voir tous les composants en action.

## Migration des Composants Existants

Pour migrer les boutons existants :

1. **Remplacer les Button simples par LoadingButton** :
```tsx
// Avant
<Button disabled={processing}>
  {processing ? "Chargement..." : "Action"}
</Button>

// Après
<LoadingButton loading={processing} loadingText="Chargement...">
  Action
</LoadingButton>
```

2. **Utiliser ActionButton pour les actions admin** :
```tsx
// Avant
<Button onClick={handleDelete} variant="destructive">
  <Trash2 className="mr-2 h-4 w-4" />
  Supprimer
</Button>

// Après
<ActionButton
  icon={Trash2}
  variant="destructive"
  confirmMessage="Confirmer la suppression ?"
  onClick={handleDelete}
>
  Supprimer
</ActionButton>
```

3. **Ajouter des progress bars pour les uploads** :
```tsx
{isUploading && (
  <Progress 
    value={uploadProgress} 
    label="Upload en cours"
    showPercentage 
  />
)}
```

## Conclusion

Ces composants offrent une expérience utilisateur cohérente et professionnelle. Ils s'intègrent naturellement avec Inertia.js et suivent les meilleures pratiques UX modernes. 