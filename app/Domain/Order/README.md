# Order Domain

Gestion des commandes et du panier.

## Responsabilités

- Gestion du panier (ajout, modification, suppression)
- Création et gestion des commandes
- Calcul des totaux et sous-totaux
- Gestion des statuts de commande
- Historique des commandes

## Entités principales

- **Order** : Commandes clients
- **OrderItem** : Articles d'une commande
- **Cart** : Panier temporaire (en session)
- **Customer** : Informations client pour la commande

## Value Objects

- **OrderStatus** : Statuts possibles d'une commande
- **OrderTotal** : Calcul des montants
- **DeliveryAddress** : Adresse de livraison

## Services

- **CartService** : Gestion du panier
- **OrderService** : Création et gestion des commandes
- **OrderCalculator** : Calcul des totaux avec poids variable