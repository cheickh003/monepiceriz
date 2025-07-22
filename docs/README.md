# Documentation MonEpice&Riz

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-07-22

Bienvenue dans la documentation complète du projet e-commerce MonEpice&Riz. Cette documentation est organisée pour faciliter le développement, le suivi et la maintenance du projet.

## 📊 Matrice de Dépendances

| Document | Dépend de | Requis pour | Version |
|----------|-----------|-------------|----------|
| prd.md | - | Tous | 1.0 |
| structure.md | prd.md | task.md, supabase.md, cinetpay.md | 1.0 |
| supabase.md | structure.md | task.md (Phase 0) | 1.0 |
| cinetpay.md | structure.md | task.md (Phase 2) | 1.0 |
| task.md | Tous les docs ci-dessus | Développement | 1.0 |
| bugs.md | structure.md, supabase.md, cinetpay.md | Support continu | 1.0 |
| deployment-o2switch.md | structure.md, task.md | Phase 4 | 1.0 |

## 📋 Documents Disponibles

### 1. **[prd.md](./prd.md)** - Product Requirements Document
Le document de spécifications fonctionnelles qui définit :
- Les objectifs métier
- Les personas utilisateurs
- Les exigences fonctionnelles détaillées
- Le périmètre du projet (v1.0)

### 2. **[structure.md](./structure.md)** - Architecture Technique
L'architecture complète du projet incluant :
- Stack technique (Laravel, Supabase, React)
- Schéma de base de données
- Organisation du code (DDD)
- Patterns et bonnes pratiques
- Configuration et sécurité

### 3. **[supabase.md](./supabase.md)** - Guide Supabase
Guide d'intégration de Supabase comprenant :
- Configuration initiale
- Politiques de sécurité (RLS)
- Storage pour les images
- Services et intégrations
- Monitoring et maintenance

### 4. **[cinetpay.md](./cinetpay.md)** - Intégration CinetPay
Documentation complète pour le paiement :
- Configuration SDK PHP
- Workflow de paiement
- Gestion des produits à poids variable
- Webhooks et sécurité
- Tests et débogage

### 5. **[task.md](./task.md)** - Plan d'Implémentation
Suivi détaillé du projet par phases :
- Phase 0 : Pré-production (1 semaine)
- Phase 1 : Développement catalogue (2-3 semaines)
- Phase 2 : Workflow commande (3-4 semaines)
- Phase 3 : Tests et QA (2 semaines)
- Phase 4 : Lancement et ops

### 6. **[bugs.md](./bugs.md)** - Journal des Bugs
Système de tracking des bugs avec :
- Template standardisé
- Catégorisation et sévérité
- Solutions et workarounds
- Patterns de résolution
- Métriques de suivi

### 7. **[deployment-o2switch.md](./deployment-o2switch.md)** - Guide de Déploiement o2Switch
Guide spécifique pour l'hébergement o2Switch :
- Configuration de l'environnement
- Build et préparation des fichiers
- Upload et installation via SSH/FTP
- Configuration des crons et queues
- Troubleshooting et maintenance

## 🚀 Quick Start

### Pour commencer le développement

1. **Lire le PRD** pour comprendre les objectifs
2. **Consulter structure.md** pour l'architecture
3. **Suivre task.md** pour les étapes d'implémentation
4. **Référencer bugs.md** en cas de problème

### Ordre de lecture recommandé

1. `prd.md` - Comprendre le projet
2. `structure.md` - Comprendre l'architecture
3. `supabase.md` - Configurer la base de données
4. `task.md` - Commencer l'implémentation
5. `cinetpay.md` - Quand vous atteignez la phase 2
6. `bugs.md` - En cas de problème
7. `deployment-o2switch.md` - Pour la mise en production (Phase 4)

## 📊 État du Projet

**Phase actuelle :** Phase 0 - Pré-production
**Statut :** ⏳ TODO
**Prochaine milestone :** Configuration des services tiers

## 🛠️ Outils de Développement

- **IDE :** VSCode avec extensions Laravel et React
- **Base de données :** Supabase (PostgreSQL)
- **Version Control :** Git
- **API Testing :** Postman/Insomnia
- **Browser Testing :** Chrome DevTools

## 📞 Contacts

- **Chef de projet :** [À définir]
- **Lead Developer :** [À définir]
- **Support Supabase :** support@supabase.com
- **Support CinetPay :** support@cinetpay.com

## 🔄 Mise à jour de la Documentation

Cette documentation est vivante et doit être mise à jour régulièrement :

- **task.md** : Quotidiennement pendant le développement
- **bugs.md** : À chaque bug découvert/résolu
- **Autres docs** : Selon les besoins et découvertes

## 📝 Conventions

- Utiliser le format Markdown
- Dater toutes les entrées importantes
- Être précis et concis
- Inclure des exemples de code
- Maintenir les tables des matières à jour

---

**Dernière mise à jour:** 2025-07-22

## 📌 Notes de Version

### v1.0.0 (2025-07-22)
- Documentation initiale complète
- Standardisation des formats
- Ajout de la matrice de dépendances