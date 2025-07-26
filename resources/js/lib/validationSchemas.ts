import { z } from 'zod';

// Messages d'erreur personnalisés
const errorMessages = {
    required: (field: string) => `${field} est requis`,
    min: (field: string, min: number) => `${field} doit contenir au moins ${min} caractères`,
    max: (field: string, max: number) => `${field} ne doit pas dépasser ${max} caractères`,
    email: 'Email invalide',
    url: 'URL invalide',
    number: {
        positive: (field: string) => `${field} doit être positif`,
        min: (field: string, min: number) => `${field} doit être supérieur ou égal à ${min}`,
        max: (field: string, max: number) => `${field} doit être inférieur ou égal à ${max}`,
        integer: (field: string) => `${field} doit être un nombre entier`
    },
    array: {
        min: (field: string, min: number) => `Au moins ${min} ${field} requis`,
        max: (field: string, max: number) => `Maximum ${max} ${field} autorisés`
    },
    file: {
        size: (max: number) => `La taille du fichier ne doit pas dépasser ${max / 1024 / 1024}MB`,
        type: (types: string[]) => `Types de fichiers autorisés: ${types.join(', ')}`
    }
};

// Schémas de base réutilisables
const baseSchemas = {
    email: z.string().email(errorMessages.email),
    url: z.string().url(errorMessages.url).optional(),
    slug: z.string()
        .min(1, errorMessages.min('Le slug', 1))
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
    price: z.number()
        .positive(errorMessages.number.positive('Le prix'))
        .multipleOf(0.01, 'Le prix doit avoir au maximum 2 décimales'),
    quantity: z.number()
        .int(errorMessages.number.integer('La quantité'))
        .min(0, errorMessages.number.min('La quantité', 0)),
    percentage: z.number()
        .min(0, errorMessages.number.min('Le pourcentage', 0))
        .max(100, errorMessages.number.max('Le pourcentage', 100))
};

// Schéma pour les SKUs de produit
export const skuSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, errorMessages.required('Le nom du SKU')),
    sku: z.string()
        .min(1, errorMessages.required('Le code SKU'))
        .regex(/^[A-Z0-9-]+$/, 'Le code SKU doit contenir uniquement des lettres majuscules, chiffres et tirets'),
    purchase_price: baseSchemas.price,
    price_ht: baseSchemas.price,
    price_ttc: baseSchemas.price,
    compare_at_price: baseSchemas.price.optional().nullable(),
    stock_quantity: baseSchemas.quantity,
    reserved_quantity: baseSchemas.quantity.default(0),
    low_stock_threshold: baseSchemas.quantity.default(5),
    weight_grams: z.number().positive().optional().nullable(),
    is_variable_weight: z.boolean().default(false),
    min_weight_grams: z.number().positive().optional().nullable(),
    max_weight_grams: z.number().positive().optional().nullable(),
    is_default: z.boolean().default(false),
    attribute_values: z.array(z.number()).optional(),
    _destroy: z.boolean().optional()
}).refine(data => {
    if (data.is_variable_weight) {
        return data.min_weight_grams !== null && data.max_weight_grams !== null;
    }
    return true;
}, {
    message: "Les poids min et max sont requis pour les produits à poids variable",
    path: ["min_weight_grams"]
});

// Schéma pour les attributs de produit
export const productAttributeValueSchema = z.object({
    id: z.number().optional(),
    value: z.string().min(1, errorMessages.required('La valeur')),
    label: z.string().min(1, errorMessages.required('Le label')),
    hex_color: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide')
        .optional()
        .nullable(),
    position: z.number().int().min(0).default(0),
    _destroy: z.boolean().optional()
});

export const productAttributeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, errorMessages.required('Le nom de l\'attribut')),
    slug: baseSchemas.slug,
    type: z.enum(['select', 'color', 'size', 'text']),
    is_required: z.boolean().default(false),
    position: z.number().int().min(0).default(0),
    values: z.array(productAttributeValueSchema)
        .min(1, errorMessages.array.min('valeur d\'attribut', 1)),
    _destroy: z.boolean().optional()
});

// Schéma principal pour les produits
export const productSchema = z.object({
    name: z.string()
        .min(3, errorMessages.min('Le nom du produit', 3))
        .max(255, errorMessages.max('Le nom du produit', 255)),
    slug: baseSchemas.slug,
    reference: z.string()
        .min(1, errorMessages.required('La référence'))
        .regex(/^[A-Z0-9-]+$/, 'La référence doit contenir uniquement des lettres majuscules, chiffres et tirets'),
    barcode: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category_id: z.union([z.string(), z.number()])
        .transform(val => typeof val === 'string' ? parseInt(val) : val)
        .refine(val => !isNaN(val) && val > 0, errorMessages.required('La catégorie')),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    is_variable_weight: z.boolean().default(false),
    position: z.number().int().min(0).default(0),
    meta_title: z.string().max(60, errorMessages.max('Le titre SEO', 60)).optional().nullable(),
    meta_description: z.string().max(160, errorMessages.max('La description SEO', 160)).optional().nullable(),
    meta_keywords: z.array(z.string()).optional().nullable(),
    skus: z.array(skuSchema)
        .min(1, errorMessages.array.min('SKU', 1))
        .refine(skus => {
            const activeSkus = skus.filter(sku => !sku._destroy);
            return activeSkus.filter(sku => sku.is_default).length === 1;
        }, "Un seul SKU doit être défini par défaut"),
    attributes: z.array(productAttributeSchema).optional(),
    _method: z.string().optional()
});

// Schéma pour les catégories
export const categorySchema = z.object({
    name: z.string()
        .min(2, errorMessages.min('Le nom de la catégorie', 2))
        .max(100, errorMessages.max('Le nom de la catégorie', 100)),
    slug: baseSchemas.slug,
    parent_id: z.union([z.string(), z.number(), z.null()])
        .transform(val => {
            if (val === null || val === '') return null;
            return typeof val === 'string' ? parseInt(val) : val;
        })
        .nullable(),
    position: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    icon: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    _method: z.string().optional()
});

// Schéma pour les utilisateurs
export const userSchema = z.object({
    name: z.string()
        .min(2, errorMessages.min('Le nom', 2))
        .max(100, errorMessages.max('Le nom', 100)),
    email: baseSchemas.email,
    password: z.string()
        .min(8, errorMessages.min('Le mot de passe', 8))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
        .optional(),
    password_confirmation: z.string().optional(),
    role: z.enum(['admin', 'manager', 'user']).default('user'),
    is_active: z.boolean().default(true),
    phone: z.string()
        .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide')
        .optional()
        .nullable(),
    _method: z.string().optional()
}).refine(data => {
    if (data.password) {
        return data.password === data.password_confirmation;
    }
    return true;
}, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"]
});

// Schéma pour la connexion
export const loginSchema = z.object({
    email: baseSchemas.email,
    password: z.string().min(1, errorMessages.required('Le mot de passe')),
    remember: z.boolean().default(false)
});

// Schéma pour l'inscription
export const registerSchema = z.object({
    name: z.string()
        .min(2, errorMessages.min('Le nom', 2))
        .max(100, errorMessages.max('Le nom', 100)),
    email: baseSchemas.email,
    password: z.string()
        .min(8, errorMessages.min('Le mot de passe', 8))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    password_confirmation: z.string(),
    terms: z.boolean().refine(val => val === true, {
        message: "Vous devez accepter les conditions d'utilisation"
    })
}).refine(data => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"]
});

// Schéma pour les commandes
export const orderItemSchema = z.object({
    product_sku_id: z.number(),
    quantity: baseSchemas.quantity.min(1, errorMessages.number.min('La quantité', 1)),
    unit_price: baseSchemas.price,
    estimated_weight: z.number().positive().optional()
});

export const orderSchema = z.object({
    customer_email: baseSchemas.email,
    customer_name: z.string().min(2, errorMessages.min('Le nom du client', 2)),
    customer_phone: z.string()
        .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
    shipping_address: z.string().min(10, errorMessages.min('L\'adresse de livraison', 10)),
    shipping_city: z.string().min(2, errorMessages.min('La ville', 2)),
    shipping_postal_code: z.string()
        .regex(/^[0-9]{5}$/, 'Code postal invalide'),
    shipping_country: z.string().default('FR'),
    billing_same_as_shipping: z.boolean().default(true),
    billing_address: z.string().optional(),
    billing_city: z.string().optional(),
    billing_postal_code: z.string().optional(),
    billing_country: z.string().optional(),
    payment_method: z.enum(['card', 'paypal', 'bank_transfer', 'cash']),
    notes: z.string().optional().nullable(),
    items: z.array(orderItemSchema).min(1, errorMessages.array.min('article', 1))
}).refine(data => {
    if (!data.billing_same_as_shipping) {
        return data.billing_address && data.billing_city && data.billing_postal_code;
    }
    return true;
}, {
    message: "L'adresse de facturation est requise si différente de l'adresse de livraison",
    path: ["billing_address"]
});

// Hook pour utiliser la validation avec react-hook-form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';

export function useZodForm<TSchema extends z.ZodType>(
    schema: TSchema,
    props?: UseFormProps<z.infer<TSchema>>
) {
    return useForm<z.infer<TSchema>>({
        ...props,
        resolver: zodResolver(schema),
        mode: 'onChange' // Validation en temps réel
    });
}

// Types inférés des schémas
export type ProductFormData = z.infer<typeof productSchema>;
export type SkuFormData = z.infer<typeof skuSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;