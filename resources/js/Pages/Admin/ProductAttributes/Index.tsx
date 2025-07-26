import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    SearchInput,
    AdminTable,
    ActionDropdown,
    EmptyState,

    type Column
} from '@/Components/admin';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Settings,
    Palette,
    Hash,
    Weight,
    Ruler
} from 'lucide-react';

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
}

interface ProductAttributesIndexProps {
    attributes: Attribute[];
}

export default function ProductAttributesIndex({ attributes }: ProductAttributesIndexProps) {
    const [search, setSearch] = useState('');
    const [showAddValueDialog, setShowAddValueDialog] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
    const [newValue, setNewValue] = useState('');
    const [newHexColor, setNewHexColor] = useState('#000000');

    const handleDelete = (attribute: Attribute) => {
        const message = attribute.products_count > 0
            ? `Cet attribut est utilisé par ${attribute.products_count} produit(s). Êtes-vous sûr de vouloir le supprimer ?`
            : `Êtes-vous sûr de vouloir supprimer l'attribut "${attribute.name}" ?`;

        if (confirm(message)) {
            router.delete(`/admin/product-attributes/${attribute.id}`, {
                onSuccess: () => {
                    // Success is handled by the backend
                },
            });
        }
    };

    const handleAddValue = () => {
        if (!selectedAttribute || !newValue.trim()) return;

        router.post(`/admin/product-attributes/${selectedAttribute.id}/values`, {
            value: newValue,
            hex_color: selectedAttribute.type === 'color' ? newHexColor : null
        }, {
            onSuccess: () => {
                setShowAddValueDialog(false);
                setNewValue('');
                setNewHexColor('#000000');
                setSelectedAttribute(null);
            }
        });
    };

    const openAddValueDialog = (attribute: Attribute) => {
        setSelectedAttribute(attribute);
        setShowAddValueDialog(true);
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

    const filteredAttributes = attributes.filter(attr =>
        attr.name.toLowerCase().includes(search.toLowerCase()) ||
        attr.slug.toLowerCase().includes(search.toLowerCase())
    );

    const breadcrumbs = [
        { label: 'Attributs produits' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Attributs produits" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attributs produits</h1>
                        <p className="text-muted-foreground">
                            Gérez les attributs et variantes de vos produits
                        </p>
                    </div>
                    <Link href="/admin/product-attributes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvel attribut
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recherche</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un attribut..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Attributes Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Obligatoire</TableHead>
                                        <TableHead>Valeurs</TableHead>
                                        <TableHead className="text-center">Produits</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAttributes.map((attribute) => (
                                        <TableRow key={attribute.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">{attribute.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {attribute.slug}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(attribute.type)}
                                                    <span>{getTypeLabel(attribute.type)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={attribute.is_required ? 'default' : 'secondary'}>
                                                    {attribute.is_required ? 'Oui' : 'Non'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {(attribute.values || []).slice(0, 3).map((value) => (
                                                            <div
                                                                key={value.id}
                                                                className="inline-flex items-center justify-center h-6 px-2 text-xs font-medium bg-gray-100 rounded-full border-2 border-white"
                                                                title={value.value}
                                                            >
                                                                {attribute.type === 'color' && value.hex_color ? (
                                                                    <div
                                                                        className="h-4 w-4 rounded-full border"
                                                                        style={{ backgroundColor: value.hex_color }}
                                                                    />
                                                                ) : (
                                                                    value.value
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(attribute.values || []).length > 3 && (
                                                        <span className="text-sm text-muted-foreground">
                                                            +{(attribute.values || []).length - 3}
                                                        </span>
                                                    )}
                                                    {(attribute.values || []).length === 0 && (
                                                        <span className="text-sm text-muted-foreground">
                                                            Aucune valeur
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {attribute.products_count}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-attributes/${attribute.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Voir
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-attributes/${attribute.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Modifier
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openAddValueDialog(attribute)}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Ajouter valeur
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(attribute)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredAttributes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Settings className="h-8 w-8" />
                                                    <p>Aucun attribut trouvé</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Value Dialog */}
                <Dialog open={showAddValueDialog} onOpenChange={setShowAddValueDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une valeur</DialogTitle>
                            <DialogDescription>
                                Ajoutez une nouvelle valeur à l'attribut "{selectedAttribute?.name}"
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="value">Valeur *</Label>
                                <Input
                                    id="value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="Ex: Rouge, XL, 500g..."
                                />
                            </div>
                            {selectedAttribute?.type === 'color' && (
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