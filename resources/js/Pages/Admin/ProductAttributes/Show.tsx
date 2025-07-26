import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Edit,
    Trash2,
    Package,
    Calendar,
    Plus,
    Palette,
    Hash,
    Weight,
    Ruler,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AttributeValue {
    id: number;
    value: string;
    hex_color?: string;
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
    sku_name: string;
    attribute_value: string;
}

interface ProductAttributeShowProps {
    attribute: Attribute;
    products_using_attribute: ProductWithAttribute[];
    usage_stats?: {
        total_products: number;
        total_skus: number;
        most_used_value?: string;
        least_used_value?: string;
    };
}

export default function ProductAttributeShow({ 
    attribute, 
    products_using_attribute,
    usage_stats 
}: ProductAttributeShowProps) {
    const [showAddValueDialog, setShowAddValueDialog] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newHexColor, setNewHexColor] = useState('#000000');

    const handleDelete = () => {
        const message = products_using_attribute.length > 0
            ? `Cet attribut est utilisé par ${products_using_attribute.length} produit(s). Êtes-vous sûr de vouloir le supprimer ?`
            : `Êtes-vous sûr de vouloir supprimer l'attribut "${attribute.name}" ?`;

        if (confirm(message)) {
            router.delete(`/admin/product-attributes/${attribute.id}`, {
                onSuccess: () => {
                    router.visit('/admin/product-attributes');
                },
            });
        }
    };

    const handleAddValue = () => {
        if (!newValue.trim()) return;

        router.post(`/admin/product-attributes/${attribute.id}/values`, {
            value: newValue,
            hex_color: attribute.type === 'color' ? newHexColor : null
        }, {
            onSuccess: () => {
                setShowAddValueDialog(false);
                setNewValue('');
                setNewHexColor('#000000');
            }
        });
    };

    const handleDeleteValue = (valueId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette valeur ?')) {
            router.delete(`/admin/product-attributes/${attribute.id}/values/${valueId}`);
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

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'color':
                return 'Couleur';
            case 'size':
                return 'Taille';
            case 'weight':
                return 'Poids';
            default:
                return 'Sélection';
        }
    };

    const breadcrumbs = [
        { label: 'Attributs produits', href: '/admin/product-attributes' },
        { label: attribute.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={attribute.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{attribute.name}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {getTypeIcon(attribute.type)}
                                <span className="text-sm text-muted-foreground">
                                    {getTypeLabel(attribute.type)}
                                </span>
                            </div>
                            <Badge variant={attribute.is_required ? 'default' : 'secondary'}>
                                {attribute.is_required ? (
                                    <>
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Obligatoire
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Optionnel
                                    </>
                                )}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/product-attributes/${attribute.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Valeurs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{attribute.values.length}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Produits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{usage_stats?.total_products ?? 0}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                SKUs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{usage_stats?.total_skus ?? 0}</span>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Créé le
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-sm">{formatDate(attribute.created_at)}</span>
                        </CardContent>
                    </Card>
                </div>

                {/* General Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">Slug</dt>
                                <dd className="font-mono text-sm">{attribute.slug}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">Type</dt>
                                <dd className="flex items-center gap-2">
                                    {getTypeIcon(attribute.type)}
                                    <span>{getTypeLabel(attribute.type)}</span>
                                </dd>
                            </div>
                            {usage_stats?.most_used_value && (
                                <div>
                                    <dt className="text-sm text-muted-foreground">Valeur la plus utilisée</dt>
                                    <dd>{usage_stats.most_used_value}</dd>
                                </div>
                            )}
                            {usage_stats?.least_used_value && (
                                <div>
                                    <dt className="text-sm text-muted-foreground">Valeur la moins utilisée</dt>
                                    <dd>{usage_stats.least_used_value}</dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                {/* Values */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Valeurs de l'attribut</CardTitle>
                        <Button size="sm" onClick={() => setShowAddValueDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une valeur
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {attribute.values.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Valeur</TableHead>
                                        {attribute.type === 'color' && (
                                            <TableHead>Couleur</TableHead>
                                        )}
                                        <TableHead className="text-center">Produits utilisant</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attribute.values.map((value) => {
                                        const productsCount = products_using_attribute.filter(
                                            p => p.attribute_value === value.value
                                        ).length;
                                        
                                        return (
                                            <TableRow key={value.id}>
                                                <TableCell className="font-medium">
                                                    {value.value}
                                                </TableCell>
                                                {attribute.type === 'color' && (
                                                    <TableCell>
                                                        {value.hex_color && (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-6 w-6 rounded border"
                                                                    style={{ backgroundColor: value.hex_color }}
                                                                />
                                                                <span className="font-mono text-sm">
                                                                    {value.hex_color}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">
                                                    {productsCount}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteValue(value.id)}
                                                        disabled={productsCount > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                Aucune valeur définie pour cet attribut
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Products using this attribute */}
                {products_using_attribute.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Produits utilisant cet attribut</CardTitle>
                            <Link href={`/admin/products?attribute_id=${attribute.id}`}>
                                <Button size="sm" variant="outline">
                                    Voir tous les produits
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Valeur</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products_using_attribute.slice(0, 10).map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>{product.reference}</TableCell>
                                            <TableCell>{product.sku_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {attribute.type === 'color' && (
                                                        <div
                                                            className="h-4 w-4 rounded border"
                                                            style={{
                                                                backgroundColor: attribute.values.find(
                                                                    v => v.value === product.attribute_value
                                                                )?.hex_color
                                                            }}
                                                        />
                                                    )}
                                                    {product.attribute_value}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Voir
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {products_using_attribute.length > 10 && (
                                <p className="mt-4 text-center text-sm text-muted-foreground">
                                    Et {products_using_attribute.length - 10} autres produits...
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Add Value Dialog */}
                <Dialog open={showAddValueDialog} onOpenChange={setShowAddValueDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une valeur</DialogTitle>
                            <DialogDescription>
                                Ajoutez une nouvelle valeur à l'attribut "{attribute.name}"
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="value">Valeur *</Label>
                                <Input
                                    id="value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder={
                                        attribute.type === 'color' ? 'Rouge' :
                                        attribute.type === 'size' ? 'XL' :
                                        attribute.type === 'weight' ? '500g' :
                                        'Nouvelle valeur'
                                    }
                                />
                            </div>
                            {attribute.type === 'color' && (
                                <div className="space-y-2">
                                    <Label htmlFor="color">Couleur</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={newHexColor}
                                            onChange={(e) => setNewHexColor(e.target.value)}
                                            className="h-10 w-20"
                                        />
                                        <Input
                                            value={newHexColor}
                                            onChange={(e) => setNewHexColor(e.target.value)}
                                            placeholder="#000000"
                                            className="flex-1 font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddValueDialog(false);
                                    setNewValue('');
                                    setNewHexColor('#000000');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button onClick={handleAddValue} disabled={!newValue.trim()}>
                                Ajouter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}