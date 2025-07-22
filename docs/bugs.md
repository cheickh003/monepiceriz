# Journal des Bugs et Résolutions - MonEpice&Riz

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-07-22

Ce document recense tous les bugs rencontrés pendant le développement, leur analyse et leur résolution. Il sert de base de connaissances pour éviter de reproduire les mêmes erreurs.

## 📚 Documentation de Référence
- **Architecture:** [structure.md](./structure.md) - Pour les patterns et l'organisation du code
- **Base de données:** [supabase.md](./supabase.md) - Pour les erreurs liées à PostgreSQL/Supabase
- **Paiement:** [cinetpay.md](./cinetpay.md) - Pour les problèmes d'intégration de paiement
- **Configuration:** [structure.md#72-variables-denvironnement](./structure.md#72-variables-denvironnement) - Pour les variables d'environnement

## Légende

### Statuts
- 🔴 **OPEN** : Bug actif non résolu
- 🟡 **IN_PROGRESS** : En cours de résolution
- 🟢 **RESOLVED** : Résolu
- 🔵 **WONT_FIX** : Ne sera pas corrigé
- ⚪ **DUPLICATE** : Doublon d'un autre bug

### Sévérité
- 🚨 **CRITICAL** : Bloque complètement l'application
- ⚠️ **HIGH** : Fonctionnalité majeure impactée
- 🔸 **MEDIUM** : Fonctionnalité mineure impactée
- 🔹 **LOW** : Cosmétique ou amélioration

### Catégories
- **[DB]** : Base de données
- **[API]** : APIs externes (CinetPay, Yango)
- **[UI]** : Interface utilisateur
- **[AUTH]** : Authentification
- **[PERF]** : Performance
- **[SEC]** : Sécurité
- **[DEPLOY]** : Déploiement

---

## Template de Bug

```markdown
### BUG-XXX : [Titre du bug]

**Date :** [Date de découverte]
**Statut :** 🔴 OPEN
**Sévérité :** ⚠️ HIGH
**Catégorie :** [DB]
**Découvert par :** [Nom]
**Assigné à :** [Nom]
**Phase :** [Phase X]

#### Description
[Description détaillée du problème]

#### Étapes pour reproduire
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

#### Comportement attendu
[Ce qui devrait se passer]

#### Comportement actuel
[Ce qui se passe réellement]

#### Environnement
- OS : [Windows/Mac/Linux]
- Browser : [Chrome/Firefox/Safari + version]
- Laravel : [version]
- PHP : [version]
- PostgreSQL : [version]

#### Logs/Screenshots
```
[Logs d'erreur ou captures d'écran]
```

#### Analyse
[Analyse technique du problème]

#### Solution
[Description de la solution mise en place]

#### Code modifié
```php
// Fichiers modifiés et extraits de code
```

#### Tests de non-régression
- [ ] Test unitaire ajouté
- [ ] Test E2E ajouté
- [ ] Testé manuellement

#### Notes
[Notes additionnelles]

---
```

---

## Bugs Actifs

### BUG-001 : [Exemple] Erreur de connexion Supabase en local

**Date :** 22/07/2025
**Statut :** 🔴 OPEN
**Sévérité :** 🚨 CRITICAL
**Catégorie :** [DB]
**Découvert par :** Dev
**Assigné à :** -
**Phase :** Phase 0

#### Description
Impossible de se connecter à Supabase depuis l'environnement local. Erreur SSL.

#### Solution temporaire
Utiliser DATABASE_URL avec ?sslmode=disable en local uniquement.

---

## Bugs Résolus

### BUG-000 : [Template] Exemple de bug résolu

**Date :** 01/01/2025
**Statut :** 🟢 RESOLVED
**Sévérité :** 🔸 MEDIUM
**Catégorie :** [UI]
**Résolu le :** 02/01/2025

#### Description
Template d'exemple

#### Solution
Solution d'exemple

---

## Problèmes Connus et Workarounds

### Supabase

#### Connection Pooling
**Problème :** Limite de connexions atteinte rapidement
**Workaround :** Utiliser le pooler en mode session
```env
DATABASE_URL=postgres://[user]:[pass]@[host].pooler.supabase.com:5432/postgres
```

#### RLS et Migrations
**Problème :** Les migrations Laravel ne respectent pas RLS
**Workaround :** Désactiver RLS temporairement ou utiliser service_role
```php
DB::statement('SET LOCAL row_security = off;');
// Migration code
DB::statement('SET LOCAL row_security = on;');
```

### Laravel

#### Inertia.js et React HMR
**Problème :** Hot Module Replacement ne fonctionne pas
**Solution :** 
```js
// vite.config.js
server: {
    hmr: {
        host: 'localhost',
    },
},
```

#### Queue Jobs et Transactions
**Problème :** Jobs dispatchés avant commit de transaction
**Solution :** Utiliser `afterCommit()`
```php
ProcessOrder::dispatch($order)->afterCommit();
```

### CinetPay

#### Webhook Signature
**Problème :** Signature invalide en local
**Workaround :** Utiliser ngrok pour exposer localhost
```bash
ngrok http 8000
```

#### Timeout sur pré-autorisation
**Problème :** Timeout après 30 secondes
**Solution :** Implémenter retry avec backoff
```php
retry(3, function () {
    return $this->cinetpay->preAuth($data);
}, 1000);
```

### Performance

#### N+1 Queries
**Problème :** Requêtes multiples sur relations
**Solution :** Eager loading systématique
```php
Product::with(['category', 'skus'])->get();
```

#### Images non optimisées
**Problème :** Images trop lourdes
**Solution :** Compression automatique via Supabase Transform
```
https://[project].supabase.co/storage/v1/object/public/products/[image]?width=800&quality=80
```

---

## Patterns de Résolution Courants

### 1. Erreurs de Migration

**Symptôme :** `SQLSTATE[42P01]: Undefined table`
**Causes possibles :**
- Mauvais schéma PostgreSQL
- Ordre des migrations incorrect
- Cache de schéma Laravel

**Résolution type :**
```bash
php artisan migrate:fresh --seed
php artisan cache:clear
php artisan config:clear
```

### 2. Erreurs CORS

**Symptôme :** `Access to XMLHttpRequest blocked by CORS policy`
**Solution :**
```php
// config/cors.php
'allowed_origins' => [env('APP_URL'), env('SUPABASE_URL')],
```

### 3. Erreurs de Timezone

**Symptôme :** Décalage horaire dans les dates
**Solution :**
```php
// config/app.php
'timezone' => 'Africa/Abidjan',

// PostgreSQL
SET timezone = 'Africa/Abidjan';
```

---

## Checklist de Débogage

### Pour tout nouveau bug :

1. **Reproduire**
   - [ ] Reproduit en local
   - [ ] Reproduit en staging
   - [ ] Étapes documentées

2. **Isoler**
   - [ ] Identifier le composant affecté
   - [ ] Vérifier les logs (Laravel, PostgreSQL, navigateur)
   - [ ] Tester avec données minimales

3. **Analyser**
   - [ ] Vérifier les changements récents (git log)
   - [ ] Consulter la documentation
   - [ ] Chercher bugs similaires

4. **Corriger**
   - [ ] Créer branche bugfix
   - [ ] Implémenter fix minimal
   - [ ] Ajouter tests

5. **Valider**
   - [ ] Tests passent
   - [ ] Code review
   - [ ] Déployé en staging

---

## Métriques

### Temps moyen de résolution
- **CRITICAL** : < 4 heures
- **HIGH** : < 1 jour
- **MEDIUM** : < 3 jours
- **LOW** : < 1 semaine

### Bugs par phase
- Phase 0 : 0
- Phase 1 : 0
- Phase 2 : 0
- Phase 3 : 0
- Phase 4 : 0

### Top 5 des catégories
1. [DB] : 0 bugs
2. [UI] : 0 bugs
3. [API] : 0 bugs
4. [AUTH] : 0 bugs
5. [PERF] : 0 bugs

---

## Ressources de Débogage

### Outils
- **Laravel Debugbar** : Debug en développement
- **Laravel Telescope** : Debug en staging
- **Sentry** : Monitoring production
- **pgAdmin** : Analyse queries PostgreSQL
- **Chrome DevTools** : Debug frontend

### Documentation Quick Links
- [Laravel Troubleshooting](https://laravel.com/docs/11.x/errors)
- [Supabase Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [CinetPay API Errors](https://docs.cinetpay.com/api/1.0-fr/errors)

### Commandes Utiles
```bash
# Laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Logs
tail -f storage/logs/laravel.log
tail -f storage/logs/cinetpay.log

# PostgreSQL
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
psql $DATABASE_URL -c "SELECT * FROM pg_locks;"

# NPM
npm run build -- --debug
npm list
```

---

## Changelog

### Documentation Quick Links
- [Laravel Troubleshooting](https://laravel.com/docs/11.x/errors)
- [Supabase Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting) - Voir aussi [supabase.md](./supabase.md)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [CinetPay API Errors](https://docs.cinetpay.com/api/1.0-fr/errors) - Voir aussi [cinetpay.md](./cinetpay.md)

### Changelog

### [2025-07-22] - v1.0.0
- Création du fichier bugs.md
- Structure de base et templates
- Sections workarounds et patterns
- Ajout des références croisées