import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useInertiaErrorHandler, useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';

export default function TestErrorHandling() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: ''
    });

    const { createFormErrorHandler } = useInertiaErrorHandler();
    const { handlers } = useErrorHandler();

    // Test de création avec gestion d'erreurs
    const handleCreateTest = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/test-create', {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "L'élément a été créé avec succès",
                    variant: "success",
                });
            },
            onError: createFormErrorHandler('create', {
                toastDescription: "Impossible de créer l'élément de test"
            })
        });
    };

    // Test de modification avec gestion d'erreurs
    const handleUpdateTest = () => {
        router.put('/admin/test-update', data, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "L'élément a été modifié avec succès",
                    variant: "success",
                });
            },
            onError: createFormErrorHandler('update', {
                toastDescription: "Impossible de modifier l'élément de test"
            })
        });
    };

    // Test de suppression avec gestion d'erreurs
    const handleDeleteTest = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet élément de test ?')) {
            router.delete('/admin/test-delete', {
                onSuccess: () => {
                    toast({
                        title: "Succès",
                        description: "L'élément a été supprimé avec succès",
                        variant: "success",
                    });
                },
                onError: createFormErrorHandler('delete', {
                    toastDescription: "Impossible de supprimer l'élément de test"
                })
            });
        }
    };

    // Test avec handlers prédéfinis
    const handleTestWithPredefinedHandlers = () => {
        // Simuler une erreur réseau
        router.get('/admin/test-network-error', {}, {
            onError: handlers.network
        });
    };

    // Test avec handler personnalisé
    const handleTestWithCustomHandler = () => {
        router.get('/admin/test-custom-error', {}, {
            onError: (errors) => {
                console.log('Erreur personnalisée:', errors);
                toast({
                    title: "Erreur Personnalisée",
                    description: "Ceci est un exemple d'erreur avec handler personnalisé",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Test - Gestion d'Erreurs" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Test du Système de Gestion d'Erreurs</h1>
                    <p className="text-muted-foreground">
                        Cette page permet de tester le système de gestion d'erreurs cohérent.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Test de Formulaire avec Gestion d'Erreurs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Test de Formulaire</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateTest} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        placeholder="Entrez un nom"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                        placeholder="Entrez un email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Tester Création
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Tests d'Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tests d'Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button 
                                onClick={handleUpdateTest}
                                variant="outline"
                                className="w-full"
                            >
                                Tester Modification
                            </Button>

                            <Button 
                                onClick={handleDeleteTest}
                                variant="destructive"
                                className="w-full"
                            >
                                Tester Suppression
                            </Button>

                            <Button 
                                onClick={handleTestWithPredefinedHandlers}
                                variant="secondary"
                                className="w-full"
                            >
                                Tester Handler Réseau
                            </Button>

                            <Button 
                                onClick={handleTestWithCustomHandler}
                                variant="outline"
                                className="w-full"
                            >
                                Tester Handler Personnalisé
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Documentation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comment tester</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><strong>Formulaire :</strong> Laissez les champs vides et soumettez pour tester les erreurs de validation.</p>
                            <p><strong>Actions :</strong> Cliquez sur les boutons pour tester différents types d'erreurs.</p>
                            <p><strong>Toast :</strong> Les messages de succès et d'erreur apparaîtront en haut à droite.</p>
                            <p><strong>Console :</strong> Ouvrez la console du navigateur pour voir les logs d'erreurs.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 