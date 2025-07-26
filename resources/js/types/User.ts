export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
    
    // Two-factor authentication
    two_factor_confirmed_at?: string;
    has_two_factor?: boolean;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: UserRole;
    _method?: string;
}

export interface UserProfileUpdateData {
    name: string;
    email: string;
}

export interface UserPasswordUpdateData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface UserFilter {
    role?: UserRole;
    email_verified?: boolean;
    search?: string;
    sort?: 'name' | 'email' | 'created_at';
    order?: 'asc' | 'desc';
}

export interface AuthUser extends User {
    permissions?: string[];
    can?: (permission: string) => boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface PasswordResetData {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface TwoFactorAuthData {
    code: string;
    recovery_code?: string;
}

// Enums
export type UserRole = 'admin' | 'user';

// Constants
export const USER_ROLES: Record<UserRole, string> = {
    admin: 'Administrateur',
    user: 'Utilisateur'
};

export const USER_PERMISSIONS = {
    // Gestion des produits
    'products.view': 'Voir les produits',
    'products.create': 'Créer des produits',
    'products.edit': 'Modifier les produits',
    'products.delete': 'Supprimer les produits',
    
    // Gestion des catégories
    'categories.view': 'Voir les catégories',
    'categories.create': 'Créer des catégories',
    'categories.edit': 'Modifier les catégories',
    'categories.delete': 'Supprimer les catégories',
    
    // Gestion des commandes
    'orders.view': 'Voir les commandes',
    'orders.edit': 'Modifier les commandes',
    'orders.delete': 'Supprimer les commandes',
    'orders.export': 'Exporter les commandes',
    
    // Gestion des utilisateurs
    'users.view': 'Voir les utilisateurs',
    'users.create': 'Créer des utilisateurs',
    'users.edit': 'Modifier les utilisateurs',
    'users.delete': 'Supprimer les utilisateurs',
    
    // Administration
    'admin.dashboard': 'Accès au tableau de bord admin',
    'admin.settings': 'Gérer les paramètres',
} as const;

export type Permission = keyof typeof USER_PERMISSIONS; 