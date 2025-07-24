# 🔧 Correction de l'erreur SSL PostgreSQL

## Problème
L'erreur `server does not support SSL, but SSL was required` apparaît lors de l'accès au site.

## Solution rapide

### 1. Arrêter le serveur Laravel
Appuyez sur `Ctrl+C` dans le terminal où `php artisan serve` est en cours d'exécution.

### 2. Nettoyer le cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### 3. Redémarrer le serveur
```bash
php artisan serve
```

### 4. Accéder au site
http://localhost:8000

## Si le problème persiste

### Option 1 : Forcer la configuration
```bash
# Modifier directement le fichier de config
sed -i '' "s/'sslmode' => 'require'/'sslmode' => 'disable'/g" config/database.php
```

### Option 2 : Utiliser un autre port
```bash
php artisan serve --port=8080
```
Puis accéder à : http://localhost:8080

### Option 3 : Vérifier Supabase
```bash
# S'assurer que Supabase est démarré
supabase status

# Si non démarré
supabase start
```

## Vérification des données

La base de données contient :
- **48 catégories**
- **8 produits**

Les données sont bien présentes, c'est juste un problème de configuration SSL.

---

**Note** : Ce problème survient car Supabase local n'utilise pas SSL, contrairement à la version production.