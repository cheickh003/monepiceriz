# 🚀 Quick Start - MonEpice&Riz

## Démarrage rapide en 3 étapes

### 1. Préparer la base de données
```bash
# Si Supabase n'est pas démarré
supabase start

# Si les migrations ne sont pas faites
php artisan migrate
php artisan db:seed
```

### 2. Démarrer l'application
```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

### 3. Accéder au site
- 🛒 **Boutique** : http://localhost:8000
- 🔐 **Admin** : http://localhost:8000/admin

## Comptes de test

### Admin
- Email : `admin@monepiceriz.com`
- Mot de passe : `password`

### Client (à créer)
- Utiliser le formulaire d'inscription

## Fonctionnalités à tester

### Sur mobile (recommandé)
1. **Ouvrir Chrome DevTools** (F12)
2. **Activer le mode mobile** (Ctrl+Shift+M)
3. **Sélectionner iPhone 12 Pro**

### Parcours utilisateur
1. ✅ Parcourir les catégories
2. ✅ Ajouter des produits au panier
3. ✅ Voir le compteur du panier se mettre à jour
4. ✅ Ouvrir le panier (icône en haut)
5. ✅ Modifier les quantités
6. ✅ Rechercher un produit

### Navigation mobile
- **Accueil** : Logo ou icône maison
- **Favoris** : ❤️ (page stub)
- **Recherche** : 🔍
- **Profil** : 👤 (connexion requise)
- **Menu** : ☰ (liste des options)

## Arrêt des services

```bash
# Arrêter Laravel
Ctrl+C dans le terminal Laravel

# Arrêter Vite
Ctrl+C dans le terminal Vite

# Arrêter Supabase
supabase stop
```

---

**Bon shopping ! 🛒**