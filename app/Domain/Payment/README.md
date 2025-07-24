# Payment Domain

Gestion des paiements via CinetPay.

## Responsabilités

- Intégration avec l'API CinetPay
- Gestion des pré-autorisations pour produits à poids variable
- Traitement des webhooks de paiement
- Journalisation des transactions
- Gestion des remboursements

## Entités principales

- **PaymentLog** : Journal des transactions
- **PaymentIntent** : Intention de paiement
- **PreAuthorization** : Pré-autorisation pour produits variables

## Value Objects

- **PaymentStatus** : Statuts de paiement
- **PaymentMethod** : Méthodes de paiement acceptées
- **TransactionReference** : Référence unique de transaction

## Services

- **CinetPayService** : Communication avec l'API CinetPay
- **PaymentService** : Orchestration des paiements
- **WebhookHandler** : Traitement des notifications CinetPay
- **PreAuthService** : Gestion des pré-autorisations