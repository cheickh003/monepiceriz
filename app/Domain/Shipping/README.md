# Shipping Domain

Gestion de la livraison via Yango API.

## Responsabilités

- Intégration avec l'API Yango
- Calcul des frais de livraison
- Gestion des zones de livraison
- Suivi des livraisons
- Gestion des livreurs

## Entités principales

- **Delivery** : Informations de livraison
- **DeliveryZone** : Zones de livraison disponibles
- **DeliveryTracking** : Suivi en temps réel

## Value Objects

- **DeliveryFee** : Frais de livraison calculés
- **DeliveryStatus** : Statuts de livraison
- **DeliveryAddress** : Adresse validée pour livraison
- **Distance** : Distance calculée pour la livraison

## Services

- **YangoService** : Communication avec l'API Yango
- **DeliveryCalculator** : Calcul des frais selon distance/poids
- **ZoneService** : Vérification des zones de livraison
- **TrackingService** : Suivi des livraisons en cours