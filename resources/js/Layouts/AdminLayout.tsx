import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    FolderTree,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Home
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    pattern?: RegExp;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, breadcrumbs }) => {
    const { auth, url } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation: NavItem[] = [
        {
            label: 'Tableau de bord',
            href: '/admin',
            icon: LayoutDashboard,
            pattern: /^\/admin\/?$/
        },
        {
            label: 'Commandes',
            href: '/admin/orders',
            icon: ShoppingCart,
            pattern: /^\/admin\/orders/
        },
        {
            label: 'Produits',
            href: '/admin/products',
            icon: Package,
            pattern: /^\/admin\/products/
        },
        {
            label: 'Catégories',
            href: '/admin/categories',
            icon: FolderTree,
            pattern: /^\/admin\/categories/
        },
        {
            label: 'Attributs',
            href: '/admin/product-attributes',
            icon: Settings,
            pattern: /^\/admin\/product-attributes/
        }
    ];

    const isActive = (item: NavItem) => {
        if (item.pattern) {
            return item.pattern.test(url);
        }
        return url === item.href;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-6 border-b">
                        <Link href="/admin" className="flex items-center">
                            <img 
                                src="/logo-monepiceriz.png" 
                                alt="Monepiceriz" 
                                className="h-10 w-auto"
                            />
                            <span className="ml-2 text-xs text-gray-500">Admin</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);
                                
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </ScrollArea>

                    {/* User menu */}
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {auth.user.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Déconnexion
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* Breadcrumbs */}
                        <div className="flex-1">
                            {breadcrumbs && breadcrumbs.length > 0 ? (
                                <nav className="flex items-center space-x-2 text-sm">
                                    <Link
                                        href="/admin"
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <Home className="h-4 w-4" />
                                    </Link>
                                    {breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={index}>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                            {crumb.href ? (
                                                <Link
                                                    href={crumb.href}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-900 font-medium">
                                                    {crumb.label}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </nav>
                            ) : (
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {title || 'Monepiceriz'}
                                </h1>
                            )}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-2">
                            <Link href="/" target="_blank">
                                <Button variant="outline" size="sm">
                                    Voir la boutique
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;