import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { LoadingButton } from '@/Components/LoadingButton';
import { Progress, MultiProgress } from '@/Components/ui/progress';
import { ActionProgress, MultiActionProgress } from '@/Components/ActionProgress';
import { ActionButton, ActionButtonGroup } from '@/Components/admin';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import { 
    Save, 
    Upload, 
    Download, 
    Trash2, 
    RefreshCw,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function LoadingStatesDemo() {
    const [loadingStates, setLoadingStates] = useState({
        button1: false,
        button2: false,
        upload: false,
        delete: false,
        refresh: false
    });

    const [progress, setProgress] = useState(0);
    const [uploadProgress, setUploadProgress] = useState([
        { id: 'file1', label: 'image1.jpg', value: 0, max: 100 },
        { id: 'file2', label: 'image2.jpg', value: 0, max: 100 },
        { id: 'file3', label: 'document.pdf', value: 0, max: 100 },
    ]);

    type ActionState = {
        id: string;
        title: string;
        status: 'idle' | 'loading' | 'success' | 'error';
        progress: number;
    };

    const [actionStates, setActionStates] = useState<ActionState[]>([
        { id: 'validate', title: 'Validation des données', status: 'idle', progress: 0 },
        { id: 'upload', title: 'Upload des fichiers', status: 'idle', progress: 0 },
        { id: 'process', title: 'Traitement des images', status: 'idle', progress: 0 },
        { id: 'save', title: 'Sauvegarde en base', status: 'idle', progress: 0 },
    ]);

    const toggleLoading = (key: keyof typeof loadingStates) => {
        setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const simulateMultiUpload = () => {
        setUploadProgress(prev => prev.map(item => ({ ...item, value: 0 })));
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const updated = prev.map(item => ({
                    ...item,
                    value: Math.min(item.value + Math.random() * 15, 100)
                }));
                
                if (updated.every(item => item.value >= 100)) {
                    clearInterval(interval);
                }
                
                return updated;
            });
        }, 300);
    };

    const simulateMultiAction = () => {
        setActionStates(prev => prev.map(action => ({ ...action, status: 'idle', progress: 0 })));
        
        let currentIndex = 0;
        const processNext = () => {
            if (currentIndex >= actionStates.length) return;
            
            setActionStates(prev => prev.map((action, index) => {
                if (index === currentIndex) {
                    return { ...action, status: 'loading' };
                }
                return action;
            }));

            const progressInterval = setInterval(() => {
                setActionStates(prev => prev.map((action, index) => {
                    if (index === currentIndex) {
                        const newProgress = Math.min(action.progress + 20, 100);
                        if (newProgress >= 100) {
                            clearInterval(progressInterval);
                            setTimeout(() => {
                                setActionStates(prev => prev.map((a, i) => {
                                    if (i === currentIndex) {
                                        return { ...a, status: 'success' };
                                    }
                                    return a;
                                }));
                                currentIndex++;
                                setTimeout(processNext, 500);
                            }, 500);
                        }
                        return { ...action, progress: newProgress };
                    }
                    return action;
                }));
            }, 200);
        };
        
        processNext();
    };

    const breadcrumbs = [
        { label: 'Administration', href: '/admin' },
        { label: 'Démonstration Loading States' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Démonstration Loading States" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Démonstration des Loading States</h1>
                    <p className="text-muted-foreground">
                        Exemples d'utilisation des composants de feedback utilisateur
                    </p>
                </div>

                {/* Boutons avec Loading States */}
                <Card>
                    <CardHeader>
                        <CardTitle>Boutons avec Loading States</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                            <LoadingButton
                                loading={loadingStates.button1}
                                loadingText="Enregistrement..."
                                onClick={() => toggleLoading('button1')}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer
                            </LoadingButton>

                            <PrimaryButton
                                processing={loadingStates.button2}
                                loadingText="Chargement..."
                                onClick={() => toggleLoading('button2')}
                            >
                                Bouton Primary
                            </PrimaryButton>

                            <ActionButton
                                icon={Upload}
                                loading={loadingStates.upload}
                                loadingText="Upload..."
                                onClick={() => toggleLoading('upload')}
                            >
                                Upload Fichier
                            </ActionButton>

                            <ActionButton
                                icon={Trash2}
                                loading={loadingStates.delete}
                                loadingText="Suppression..."
                                variant="destructive"
                                confirmMessage="Êtes-vous sûr de vouloir supprimer ?"
                                onClick={() => toggleLoading('delete')}
                            >
                                Supprimer
                            </ActionButton>
                        </div>

                        <ActionButtonGroup>
                            <ActionButton
                                icon={RefreshCw}
                                loading={loadingStates.refresh}
                                loadingText="Actualisation..."
                                variant="outline"
                                onClick={() => toggleLoading('refresh')}
                            >
                                Actualiser
                            </ActionButton>
                            <Button variant="secondary">Annuler</Button>
                        </ActionButtonGroup>
                    </CardContent>
                </Card>

                {/* Progress Bars */}
                <Card>
                    <CardHeader>
                        <CardTitle>Barres de Progression</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Progress 
                                value={progress} 
                                label="Progression générale"
                                showPercentage 
                            />
                            <Button 
                                onClick={simulateProgress}
                                className="mt-2"
                                size="sm"
                            >
                                Simuler Progression
                            </Button>
                        </div>

                        <div>
                            <h4 className="font-medium mb-3">Upload Multiple</h4>
                            <MultiProgress items={uploadProgress} />
                            <Button 
                                onClick={simulateMultiUpload}
                                className="mt-2"
                                size="sm"
                            >
                                Simuler Upload Multiple
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Spinners */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spinners de Chargement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-8 items-center">
                            <LoadingSpinner size="small" text="Petit" />
                            <LoadingSpinner size="medium" text="Moyen" />
                            <LoadingSpinner size="large" text="Grand" />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Progression des Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MultiActionProgress actions={actionStates} />
                        <Button 
                            onClick={simulateMultiAction}
                            className="mt-4"
                        >
                            Simuler Actions Multiples
                        </Button>
                    </CardContent>
                </Card>

                {/* Examples d'États */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemples d'États</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ActionProgress
                            title="Opération réussie"
                            description="Le fichier a été uploadé avec succès"
                            status="success"
                        />
                        
                        <ActionProgress
                            title="Opération en cours"
                            description="Upload du fichier en cours..."
                            status="loading"
                            progress={65}
                        />
                        
                        <ActionProgress
                            title="Erreur détectée"
                            description="Impossible de traiter le fichier"
                            status="error"
                            error="Format de fichier non supporté"
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 