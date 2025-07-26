import React, { useState } from 'react';
import { FileUpload } from '@/Components/ui/file-upload';
import { useProductImageUpload } from '@/hooks/useSupabaseUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ProductImageUploadProps {
    productId?: number;
    onImagesUploaded?: (images: Array<{ url: string; path: string }>) => void;
    maxFiles?: number;
    className?: string;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
    productId,
    onImagesUploaded,
    maxFiles = 10,
    className
}) => {
    const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; path: string }>>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
    const {
        uploadProductImage,
        uploadProductGallery,
        isUploading,
        uploadProgress
    } = useProductImageUpload();

    const handleUpload = async (files: File[]) => {
        try {
            let results;
            
            if (files.length === 1) {
                const result = await uploadProductImage(files[0], productId);
                results = [result];
            } else {
                results = await uploadProductGallery(files, productId);
            }

            const newImages = results.map(r => ({ url: r.url, path: r.path }));
            setUploadedImages(prev => [...prev, ...newImages]);
            onImagesUploaded?.(newImages);
            
            // Réinitialiser les fichiers sélectionnés après upload réussi
            setSelectedFiles([]);
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            throw error;
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Images du produit</CardTitle>
                <CardDescription>
                    Ajoutez des images de votre produit. La première image sera l'image principale.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                        Formats acceptés : JPG, JPEG, PNG, WebP. Taille maximale : 10MB par image.
                    </AlertDescription>
                </Alert>

                <FileUpload
                    name="product_images"
                    value={selectedFiles}
                    onChange={setSelectedFiles}
                    onUpload={handleUpload}
                    maxSize={10 * 1024 * 1024} // 10MB
                    maxFiles={maxFiles}
                    allowedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
                    validateFileSignature={true}
                    disabled={isUploading}
                    autoUpload={false}
                    showInfo={true}
                />

                {uploadedImages.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Images uploadées :</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {uploadedImages.map((image, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img
                                        src={image.url}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover rounded"
                                    />
                                    {index === 0 && (
                                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                            Principal
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Exemple d'utilisation dans un formulaire avec validation Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/Components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';

// Schéma de validation pour le formulaire de produit
const productFormSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
    description: z.string().optional(),
    price: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Prix invalide')
        .transform(val => parseFloat(val)),
    images: z.array(z.object({
        url: z.string().url(),
        path: z.string()
    })).min(1, 'Au moins une image est requise')
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const ProductFormExample: React.FC = () => {
    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        mode: 'onChange', // Validation en temps réel
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            images: []
        }
    });

    const onSubmit = async (data: ProductFormData) => {
        console.log('Données du formulaire:', data);
        // Envoyer les données au serveur
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du produit</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ex: T-shirt en coton bio" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Décrivez votre produit..." 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prix (€)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ProductImageUpload
                                    onImagesUploaded={(images) => {
                                        field.onChange([...field.value, ...images]);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={form.formState.isSubmitting || !form.formState.isValid}
                    >
                        {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};