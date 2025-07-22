# Plan d'Implémentation et Suivi des Tâches - MonEpice&Riz

Ce document sert de référence centrale pour suivre l'avancement du projet. Chaque tâche est trackée avec son statut, ses dates et ses notes d'implémentation.

**Dernière mise à jour :** 22/07/2025

## Légende des Statuts
- ⏳ **TODO** : À faire
- 🚧 **IN_PROGRESS** : En cours
- ✅ **DONE** : Terminé
- 🔄 **REVIEW** : En revue
- ❌ **BLOCKED** : Bloqué
- 🗓️ **SCHEDULED** : Planifié

## Vue d'ensemble du projet

| Phase | Description | Durée estimée | Statut | Début | Fin |
|-------|-------------|---------------|---------|-------|-----|
| Phase 0 | Pré-production et Fondations | 1 semaine | ⏳ TODO | - | - |
| Phase 1 | Développement du Cœur de la Boutique | 2-3 semaines | ⏳ TODO | - | - |
| Phase 2 | Workflow de Commande et Intégrations | 3-4 semaines | ⏳ TODO | - | - |
| Phase 3 | Finalisation, Tests et Assurance Qualité | 2 semaines | ⏳ TODO | - | - |
| Phase 4 | Lancement et Opérations Post-Lancement | Continu | ⏳ TODO | - | - |

---

## Phase 0 : Pré-production et Fondations

**Objectif :** Mettre en place tous les outils, comptes et la base du projet avant d'écrire la moindre ligne de code métier.

### Tâches

| ID | Tâche | Description | Statut | Assigné | Début | Fin | Notes |
|----|-------|-------------|---------|---------|-------|-----|-------|
| P0.1 | Configuration des Services Tiers | Créer projet Supabase, compte CinetPay, clés API Yango | ⏳ TODO | - | - | - | Créer fichier `.env.example` |
| P0.2 | Initialisation du Projet Laravel | Installer Laravel 11, configurer Supabase, installer dépendances | ⏳ TODO | - | - | - | Laravel + Inertia.js + Tailwind |
| P0.3 | Mise en place du Git | Créer dépôt, branches (`main`, `develop`), push initial | ⏳ TODO | - | - | - | Ajouter `.gitignore` complet |
| P0.4 | Migrations Initiales | Créer migrations pour tables principales | ⏳ TODO | - | - | - | Basé sur `structure.md` |
| P0.5 | Conception UI/UX | Maquettes Figma des pages clés | ⏳ TODO | - | - | - | Style Shadcn/ui |

### Livrables Phase 0
- [ ] Fichier `.env.example` avec toutes les variables
- [ ] Projet Laravel fonctionnel connecté à Supabase
- [ ] Dépôt Git initialisé avec structure de branches
- [ ] Base de données avec tables principales
- [ ] Maquettes Figma validées

### Notes d'implémentation Phase 0
```
[Date] - [Note]
```

---

## Phase 1 : Développement du Cœur de la Boutique

**Objectif :** Construire un catalogue de produits consultable par le public. Pas encore de panier ni de paiement.

### Tâches

| ID | Tâche | Description | Statut | Assigné | Début | Fin | Notes |
|----|-------|-------------|---------|---------|-------|-----|-------|
| P1.1 | Panneau d'Admin - Auth | Authentification 2FA pour le personnel | ⏳ TODO | - | - | - | Laravel Fortify |
| P1.2 | CRUD Catégories | Create, Read, Update, Delete pour les catégories | ⏳ TODO | - | - | - | Avec validation |
| P1.3 | CRUD Produits | Gestion complète des produits et SKUs | ⏳ TODO | - | - | - | Support produits variables |
| P1.4 | Service Storage | Intégration Supabase Storage pour images | ⏳ TODO | - | - | - | Upload/Delete/CDN |
| P1.5 | Seeders de Données | Importer catalogue depuis PDF | ⏳ TODO | - | - | - | Script d'import |
| P1.6 | Front - Page Accueil | Homepage avec sections dynamiques | ⏳ TODO | - | - | - | Promotions, Nouveautés |
| P1.7 | Front - Liste Produits | Page catalogue avec filtres | ⏳ TODO | - | - | - | Filtres: catégorie, prix, statut |
| P1.8 | Front - Détail Produit | Page produit individuel | ⏳ TODO | - | - | - | Galerie, infos, CTA |
| P1.9 | Recherche Full-Text | Recherche PostgreSQL | ⏳ TODO | - | - | - | Index GIN optimisé |

### Livrables Phase 1
- [ ] Panneau admin fonctionnel avec auth 2FA
- [ ] CRUD complet pour catégories et produits
- [ ] Upload d'images fonctionnel
- [ ] Base de données peuplée avec données réelles
- [ ] Site vitrine navigable avec recherche

### Notes d'implémentation Phase 1
```
[Date] - [Note]
```

---

## Phase 2 : Workflow de Commande et Intégrations

**Objectif :** Implémenter l'ensemble du processus de commande, de l'ajout au panier jusqu'au paiement.

### Tâches

| ID | Tâche | Description | Statut | Assigné | Début | Fin | Notes |
|----|-------|-------------|---------|---------|-------|-----|-------|
| P2.1 | Logique Panier | Add to cart, update, remove | ⏳ TODO | - | - | - | LocalStorage + API |
| P2.2 | Migrations Commandes | Tables orders, order_items | ⏳ TODO | - | - | - | Support poids variable |
| P2.3 | Page Panier | Interface panier complète | ⏳ TODO | - | - | - | Reactive avec Inertia |
| P2.4 | Checkout Form | Formulaire guest checkout | ⏳ TODO | - | - | - | Validation côté serveur |
| P2.5 | Service Yango | Calcul frais livraison | ⏳ TODO | - | - | - | API Yango intégrée |
| P2.6 | Service CinetPay | Paiement + webhooks | ⏳ TODO | - | - | - | Mode test d'abord |
| P2.7 | Pré-autorisation | Workflow produits variables | ⏳ TODO | - | - | - | Pre-auth + capture |
| P2.8 | Admin - Commandes | Liste et gestion commandes | ⏳ TODO | - | - | - | Ajustement poids |
| P2.9 | Notifications | Emails confirmation | ⏳ TODO | - | - | - | Queue jobs |
| P2.10 | Pages Status | Success, Failed, Pending | ⏳ TODO | - | - | - | Pages de retour |

### Livrables Phase 2
- [ ] Panier fonctionnel avec persistance
- [ ] Processus checkout complet (guest)
- [ ] Intégration Yango opérationnelle
- [ ] Intégration CinetPay avec webhooks
- [ ] Gestion des produits à poids variable
- [ ] Interface admin pour les commandes

### Notes d'implémentation Phase 2
```
[Date] - [Note]
```

---

## Phase 3 : Finalisation, Tests et Assurance Qualité

**Objectif :** S'assurer que l'application est stable, sécurisée et performante avant le lancement.

### Tâches

| ID | Tâche | Description | Statut | Assigné | Début | Fin | Notes |
|----|-------|-------------|---------|---------|-------|-----|-------|
| P3.1 | Tests E2E | Parcours utilisateurs complets | ⏳ TODO | - | - | - | Cypress ou Playwright |
| P3.2 | Tests Intégrations | Tests API CinetPay/Yango | ⏳ TODO | - | - | - | Mode test |
| P3.3 | Optimisation DB | Analyse requêtes, index | ⏳ TODO | - | - | - | pgAdmin analysis |
| P3.4 | Cache Redis | Mise en cache stratégique | ⏳ TODO | - | - | - | Produits, catégories |
| P3.5 | Audit Sécurité | RLS, validation, CSRF | ⏳ TODO | - | - | - | Checklist complète |
| P3.6 | Performance | Lighthouse, GTmetrix | ⏳ TODO | - | - | - | Target: 90+ score |
| P3.7 | Contenu Final | Textes, images, légal | ⏳ TODO | - | - | - | CGV, mentions |
| P3.8 | Staging Deploy | Environnement de test | ⏳ TODO | - | - | - | Identique à prod |
| P3.9 | Documentation | Guides admin et tech | ⏳ TODO | - | - | - | README, wiki |
| P3.10 | Load Testing | Tests de charge | ⏳ TODO | - | - | - | k6 ou JMeter |

### Livrables Phase 3
- [ ] Rapport de tests complet
- [ ] Audit de sécurité validé
- [ ] Performance optimisée (scores 90+)
- [ ] Documentation complète
- [ ] Site staging validé client

### Notes d'implémentation Phase 3
```
[Date] - [Note]
```

---

## Phase 4 : Lancement et Opérations Post-Lancement

**Objectif :** Mettre le site en production et assurer son bon fonctionnement.

**📚 Documentation requise :** [deployment-o2switch.md](./deployment-o2switch.md) - Guide complet de déploiement sur o2Switch

### Tâches

| ID | Tâche | Description | Statut | Assigné | Début | Fin | Notes |
|----|-------|-------------|---------|---------|-------|-----|-------|
| P4.1 | Checklist Deploy | Vérification pré-prod | ⏳ TODO | - | - | - | Voir checklist |
| P4.2 | DNS & SSL | Configuration domaine | ⏳ TODO | - | - | - | SSL Let's Encrypt |
| P4.3 | Go Live | Déploiement production | ⏳ TODO | - | - | - | Zero downtime |
| P4.4 | Monitoring | Uptime, errors, perf | ⏳ TODO | - | - | - | Sentry + UptimeRobot |
| P4.5 | Backup Auto | Stratégie de backup | ⏳ TODO | - | - | - | Daily + offsite |
| P4.6 | Formation Équipe | Formation utilisateurs | ⏳ TODO | - | - | - | Vidéos + docs |
| P4.7 | Support L1 | Mise en place support | ⏳ TODO | - | - | - | FAQ + contact |
| P4.8 | Analytics | GA4 + heatmaps | ⏳ TODO | - | - | - | Privacy compliant |
| P4.9 | Maintenance | Planning updates | ⏳ TODO | - | - | - | Monthly patches |
| P4.10 | Roadmap V2 | Planification features | ⏳ TODO | - | - | - | Based on feedback |

### Livrables Phase 4
- [ ] Site en production
- [ ] Monitoring actif
- [ ] Équipe formée
- [ ] Documentation support
- [ ] Plan maintenance établi

### Notes d'implémentation Phase 4
```
[Date] - [Note]
```

---

## Tâches Transverses

Ces tâches sont continues tout au long du projet :

| ID | Tâche | Description | Statut | Notes |
|----|-------|-------------|---------|-------|
| T1 | Code Reviews | Revue de code systématique | 🔄 ONGOING | PR obligatoires |
| T2 | Documentation | Mise à jour docs techniques | 🔄 ONGOING | Au fil de l'eau |
| T3 | Tests Unitaires | Coverage > 80% | 🔄 ONGOING | PHPUnit + Jest |
| T4 | Meetings Hebdo | Sync équipe | 🔄 ONGOING | Chaque lundi |
| T5 | Backup Code | Push Git quotidien | 🔄 ONGOING | Automated |

---

## Métriques de Suivi

### Velocity
- **Phase 0** : X tâches/jour
- **Phase 1** : X tâches/jour
- **Phase 2** : X tâches/jour
- **Phase 3** : X tâches/jour

### Burndown Chart
```
[À compléter avec un graphique ou tableau de progression]
```

### Risques Identifiés
1. **Délais API Yango** : Prévoir plan B si retard
2. **Complexité poids variable** : Peut nécessiter plus de temps
3. **Performance Supabase** : Monitor dès le début

---

## Notes de Réunion

### [Date] - Réunion de lancement
```
Participants : 
Points discutés :
Décisions prises :
Actions :
```

---

## Changelog

### [22/07/2025] - Initialisation
- Création du fichier task.md
- Structure complète du plan d'implémentation
- Définition des phases et livrables