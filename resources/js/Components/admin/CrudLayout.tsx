import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader, PageHeaderAction } from '@/Components/admin/PageHeader';
import { BreadcrumbNav, BreadcrumbItem } from '@/Components/admin/BreadcrumbNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CrudLayoutProps {
    title: string;
    pageTitle?: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: PageHeaderAction[];
    children: React.ReactNode;
    showCard?: boolean;
    cardTitle?: string;
    cardDescription?: string;
    successMessage?: string;
    errorMessage?: string;
    warningMessage?: string;
    className?: string;
}

export const CrudLayout: React.FC<CrudLayoutProps> = ({
    title,
    pageTitle,
    description,
    breadcrumbs = [],
    actions = [],
    children,
    showCard = true,
    cardTitle,
    cardDescription,
    successMessage,
    errorMessage,
    warningMessage,
    className = ''
}) => {
    return (
        <>
            <Head title={title} />
            <AdminLayout>
                <div className={`space-y-6 ${className}`}>
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <BreadcrumbNav items={breadcrumbs} />
                    )}

                    {/* Page Header */}
                    <PageHeader
                        title={pageTitle || title}
                        description={description}
                        actions={actions}
                    />

                    {/* Messages d'alerte */}
                    {successMessage && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Succès</AlertTitle>
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {warningMessage && (
                        <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle>Attention</AlertTitle>
                            <AlertDescription>{warningMessage}</AlertDescription>
                        </Alert>
                    )}

                    {/* Contenu principal */}
                    {showCard ? (
                        <Card>
                            {(cardTitle || cardDescription) && (
                                <CardHeader>
                                    {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
                                    {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
                                </CardHeader>
                            )}
                            <CardContent className={cardTitle || cardDescription ? '' : 'pt-6'}>
                                {children}
                            </CardContent>
                        </Card>
                    ) : (
                        children
                    )}
                </div>
            </AdminLayout>
        </>
    );
};

// Layout pour les pages de liste
interface CrudListLayoutProps extends Omit<CrudLayoutProps, 'showCard'> {
    totalItems?: number;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: React.ReactNode;
    bulkActions?: React.ReactNode;
}

export const CrudListLayout: React.FC<CrudListLayoutProps> = ({
    totalItems,
    searchValue,
    onSearchChange,
    filters,
    bulkActions,
    ...props
}) => {
    return (
        <CrudLayout {...props} showCard={false}>
            <div className="space-y-4">
                {/* Barre de recherche et filtres */}
                {(searchValue !== undefined || filters || bulkActions) && (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 items-center gap-4">
                            {searchValue !== undefined && onSearchChange && (
                                <div className="relative max-w-sm flex-1">
                                    <input
                                        type="search"
                                        placeholder="Rechercher..."
                                        value={searchValue}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            )}
                            {filters}
                        </div>
                        {bulkActions}
                    </div>
                )}

                {/* Contenu de la liste */}
                {props.children}
            </div>
        </CrudLayout>
    );
};

// Layout pour les formulaires
interface CrudFormLayoutProps extends Omit<CrudLayoutProps, 'showCard' | 'cardTitle'> {
    isEdit?: boolean;
    formTitle?: string;
    submitButton?: React.ReactNode;
    cancelHref?: string;
}

export const CrudFormLayout: React.FC<CrudFormLayoutProps> = ({
    isEdit = false,
    formTitle,
    submitButton,
    cancelHref,
    ...props
}) => {
    const defaultFormTitle = formTitle || (isEdit ? `Modifier ${props.title}` : `Créer ${props.title}`);

    return (
        <CrudLayout 
            {...props} 
            showCard={true}
            cardTitle={defaultFormTitle}
        >
            {props.children}
            
            {/* Boutons du formulaire */}
            {(submitButton || cancelHref) && (
                <div className="mt-6 flex items-center justify-end gap-4">
                    {cancelHref && (
                        <a
                            href={cancelHref}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Annuler
                        </a>
                    )}
                    {submitButton}
                </div>
            )}
        </CrudLayout>
    );
};

// Layout pour les pages de détails
interface CrudShowLayoutProps extends Omit<CrudLayoutProps, 'showCard'> {
    sections?: Array<{
        title: string;
        description?: string;
        content: React.ReactNode;
        className?: string;
    }>;
}

export const CrudShowLayout: React.FC<CrudShowLayoutProps> = ({
    sections = [],
    ...props
}) => {
    return (
        <CrudLayout {...props} showCard={false}>
            {sections.length > 0 ? (
                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <Card key={index} className={section.className}>
                            <CardHeader>
                                <CardTitle>{section.title}</CardTitle>
                                {section.description && (
                                    <CardDescription>{section.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>{section.content}</CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        {props.children}
                    </CardContent>
                </Card>
            )}
        </CrudLayout>
    );
};

// Layout pour les pages vides
interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon: Icon,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {Icon && (
                <Icon className="mb-4 h-12 w-12 text-muted-foreground" />
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
            {action && (
                <div className="mt-4">
                    {action.href ? (
                        <a
                            href={action.href}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {action.label}
                        </a>
                    ) : (
                        <button
                            onClick={action.onClick}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};