import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
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
    Ruler
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttributeValue {
    value: string;
    hex_color?: string;
}

interface ProductAttributeCreateProps {}

export default function ProductAttributeCreate({}: ProductAttributeCreateProps) {
    const [values, setValues] = useState<AttributeValue[]>([]);
    const [newValue, setNewValue] = useState('');
    const [newHexColor, setNewHexColor] = useState('#000000');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        type: 'select',
        is_required: false,
        values: values
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
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(name));
        }
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
    };

    const removeValue = (index: number) => {
        const updatedValues = values.filter((_, i) => i !== index);
        setValues(updatedValues);
        setData('values', updatedValues);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/product-attributes', {
            onSuccess: () => {
                // Success is handled by the backend
            },
        });
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

    const breadcrumbs = [
        { label: 'Attributs produits', href: '/admin/product-attributes' },
        { label: 'Nouvel attribut' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvel attribut" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouvel attribut</h1>
                        <p className="text-muted-foreground">
                            Créez un nouvel attribut pour vos variantes de produits
                        </p>
                    </div>
                    <div className="flex gap-2">
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
                                    onChange={(e) => setData('slug', e.target.value)}
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
                                    onValueChange={(value) => setData('type', value as any)}
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
                                    onCheckedChange={(checked) => setData('is_required', checked)}
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
                                {values.length > 0 ? (
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
                                                {values.map((value, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{value.value}</TableCell>
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
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Aucune valeur ajoutée</p>
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