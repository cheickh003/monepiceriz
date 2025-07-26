import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Save,
    X,
    Plus,
    Trash2,
    Palette,
    Hash,
    Weight,
    Ruler,
    Clock,
    AlertCircle,
    Package
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface AttributeValue {
    id?: number;
    value: string;
    hex_color?: string;
    _destroy?: boolean;
}

interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'size' | 'weight';
    is_required: boolean;
    values: AttributeValue[];
    products_count: number;
    created_at: string;
    updated_at: string;
}

interface ProductWithAttribute {
    id: number;
    name: string;
    reference: string;
}

interface ProductAttributeEditProps {
    attribute: Attribute;
    products_using_attribute?: ProductWithAttribute[];
}

export default function ProductAttributeEdit({ attribute, products_using_attribute }: ProductAttributeEditProps) {
    const [values, setValues] = useState<AttributeValue[]>(attribute.values);
    const [newValue, setNewValue] = useState('');
    const [newHexColor, setNewHexColor] = useState('#000000');
    const [hasChanges, setHasChanges] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        is_required: attribute.is_required,
        values: values,
        _method: 'PUT'
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setHasChanges(true);
    };

    const handleFieldChange = (field: string, value: any) => {
        setData(field as any, value);
        setHasChanges(true);
    };

    const addValue = () => {
        if (!newValue.trim()) return;

        const value: AttributeValue = {
            value: newValue,
            ...(data.type === 'color' && { hex_color: newHexColor })
        };

        const updatedValues = [...values, value];
        setValues(updatedValues);
        setData('values', updatedValues);
        setNewValue('');
        setNewHexColor('#000000');
        setHasChanges(true);
    };

    const removeValue = (index: number) => {
        const updatedValues = [...values];
        if (updatedValues[index].id) {
            // Mark existing value for deletion
            updatedValues[index]._destroy = true;
        } else {
            // Remove new value
            updatedValues.splice(index, 1);
        }
        setValues(updatedValues);
        setData('values', updatedValues);
        setHasChanges(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/product-attributes/${attribute.id}`, {
            onSuccess: () => {
                setHasChanges(false);
            },
        });
    };

    const handleDelete = () => {
        const message = (products_using_attribute ?? []).length > 0
            ? `Cet attribut est utilisé par ${(products_using_attribute ?? []).length} produit(s). Êtes-vous sûr de vouloir le supprimer ?`
            : `Êtes-vous sûr de vouloir supprimer l'attribut "${attribute.name}" ?`;

        if (confirm(message)) {
            router.delete(`/admin/product-attributes/${attribute.id}`, {
                onSuccess: () => {
                    router.visit('/admin/product-attributes');
                },
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'color':
                return <Palette className="h-4 w-4" />;
            case 'size':
                return <Ruler className="h-4 w-4" />;
            case 'weight':
                return <Weight className="h-4 w-4" />;
            default:
                return <Hash className="h-4 w-4" />;
        }
    };

    const canChangeType = (products_using_attribute ?? []).length === 0;

    const breadcrumbs = [
        { label: 'Attributs produits', href: '/admin/product-attributes' },
        { label: attribute.name }
    ];

    const activeValues = values.filter(v => !v._destroy);

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${attribute.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Modifier l'attribut</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Créé le {formatDate(attribute.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Modifié le {formatDate(attribute.updated_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                        <Link href="/admin/product-attributes">
                            <Button type="button" variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </div>
                </div>

                {/* Unsaved changes warning */}
                {hasChanges && (
                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <p>Vous avez des modifications non sauvegardées</p>
                    </div>
                )}

                {/* Products using this attribute */}
                {products_using_attribute && products_using_attribute.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Produits utilisant cet attribut ({(products_using_attribute ?? []).length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(products_using_attribute ?? []).slice(0, 10).map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/admin/products/${product.id}`}
                                        className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                                    >
                                        {product.name} ({product.reference})
                                    </Link>
                                ))}
                                {(products_using_attribute ?? []).length > 10 && (
                                    <span className="inline-flex items-center rounded-md border bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                        +{(products_using_attribute ?? []).length - 10} autres
                                    </span>
                                )}
                            </div>
                            {!canChangeType && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <AlertCircle className="inline h-4 w-4 mr-1" />
                                    Le type ne peut pas être modifié car l'attribut est utilisé par des produits
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de l'attribut *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className={cn(errors.name && 'border-red-500')}
                                    placeholder="Ex: Couleur, Taille, Poids"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                                    className={cn(errors.slug && 'border-red-500')}
                                    placeholder="couleur"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-red-500">{errors.slug}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type d'attribut *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => handleFieldChange('type', value)}
                                    disabled={!canChangeType}
                                >
                                    <SelectTrigger className={cn(errors.type && 'border-red-500')}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="select">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4" />
                                                Sélection
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="color">
                                            <div className="flex items-center gap-2">
                                                <Palette className="h-4 w-4" />
                                                Couleur
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="size">
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-4 w-4" />
                                                Taille
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="weight">
                                            <div className="flex items-center gap-2">
                                                <Weight className="h-4 w-4" />
                                                Poids
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-red-500">{errors.type}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_required">Attribut obligatoire</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Les produits devront avoir une valeur pour cet attribut
                                    </p>
                                </div>
                                <Switch
                                    id="is_required"
                                    checked={data.is_required}
                                    onCheckedChange={(checked) => handleFieldChange('is_required', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Values */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {getTypeIcon(data.type)}
                                Valeurs de l'attribut
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Add value form */}
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder={
                                                data.type === 'color' ? 'Rouge' :
                                                data.type === 'size' ? 'XL' :
                                                data.type === 'weight' ? '500g' :
                                                'Nouvelle valeur'
                                            }
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addValue();
                                                }
                                            }}
                                        />
                                    </div>
                                    {data.type === 'color' && (
                                        <Input
                                            type="color"
                                            value={newHexColor}
                                            onChange={(e) => setNewHexColor(e.target.value)}
                                            className="w-20"
                                        />
                                    )}
                                    <Button type="button" onClick={addValue} size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Values list */}
                                {activeValues.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Valeur</TableHead>
                                                    {data.type === 'color' && (
                                                        <TableHead>Couleur</TableHead>
                                                    )}
                                                    <TableHead className="w-10"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {values.map((value, index) => {
                                                    if (value._destroy) return null;
                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {value.value}
                                                                {value.id && (
                                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                                        ID: {value.id}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            {data.type === 'color' && (
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="h-6 w-6 rounded border"
                                                                            style={{ backgroundColor: value.hex_color }}
                                                                        />
                                                                        <span className="font-mono text-sm">
                                                                            {value.hex_color}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeValue(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Aucune valeur active</p>
                                        <p className="text-sm">
                                            Ajoutez des valeurs possibles pour cet attribut
                                        </p>
                                    </div>
                                )}

                                {errors.values && (
                                    <p className="text-sm text-red-500">{errors.values}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}