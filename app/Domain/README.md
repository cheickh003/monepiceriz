# Domain Layer

Ce dossier contient la logique métier de l'application organisée selon les principes du Domain-Driven Design (DDD).

## Structure

- **Catalog/** : Gestion du catalogue produits (catégories, produits, SKUs, attributs)
- **Order/** : Gestion des commandes (panier, commandes, articles de commande)
- **Payment/** : Gestion des paiements (CinetPay, pré-autorisation, webhooks)
- **Shipping/** : Gestion de la livraison (Yango API, calcul des frais)

## Principes

Chaque domaine contient :
- **Entities/** : Objets métier avec identité
- **ValueObjects/** : Objets sans identité (prix, poids, adresse)
- **Services/** : Logique métier complexe
- **Repositories/** : Interfaces d'accès aux données
- **Events/** : Événements du domaine
- **Exceptions/** : Exceptions spécifiques au domaine