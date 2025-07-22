# Product Requirements Document (PRD) - MonEpice&Riz

* **Version:** 1.0.0
* **Date:** 2025-07-22
* **Statut:** Approuvé
* **Projet:** Site E-commerce pour l'épicerie MonEpice&Riz
* **Documentation technique:** [structure.md](./structure.md)

## 1. Introduction et Contexte
Ce document détaille les exigences pour la création de la version 1.0 du site e-commerce pour **MonEpice&Riz**. L'épicerie, basée à Abidjan, a pour objectif de moderniser son service et d'élargir sa clientèle. Le site proposera des produits de consommation courante et, à terme, une gamme de produits d'importation difficiles à trouver à Abidjan.

La plateforme permettra aux clients de passer commande en tant qu'invité, de payer via **CinetPay** et de choisir entre un retrait en magasin ou une livraison à domicile via **Yango Livraison**.

Le projet sera développé sur une stack technique composée de **Laravel** pour le back-end, avec une interface utilisateur s'appuyant sur **Tailwind CSS** et des composants interactifs **Shadcn/ui**.

## 2. Objectifs Métier (Business Goals)
* **Augmenter les ventes** en établissant un canal de vente digital.
* **Élargir la clientèle** au-delà des habitants du quartier pour toucher activement les professionnels et les étudiants d'Abidjan.
* **Se positionner comme une épicerie de référence** pour les produits du quotidien et, à l'avenir, pour des produits d'importation rares.
* **Améliorer la commodité** pour les clients actuels et futurs grâce à la commande en ligne.

## 3. Personas Utilisateurs
* **Le Professionnel Pressé :** Souhaite une solution rapide pour commander ses courses depuis son lieu de travail et se faire livrer à domicile via Yango.
* **La Famille du Quartier :** Cherche à optimiser son temps en préparant ses grosses commandes en ligne pour une livraison ou en faisant des retraits rapides en magasin pour les appoints.
* **L'Étudiant Connecté :** Recherche des prix compétitifs, des promotions et une expérience mobile fluide pour commander des snacks, des boissons et des produits de base.

## 4. Exigences Fonctionnelles (Functional Requirements)

### F1 : Expérience Utilisateur et Catalogue de Produits
* **F1.1 - Page d'Accueil :** La page d'accueil doit afficher de manière visible :
    * Une **bannière promotionnelle** en haut de page.
    * Une barre de recherche.
    * Des sections pour les produits en "Promotion", "Nouveauté" et "Tendance".
* **F1.2 - Filtres du Catalogue :** Le client doit pouvoir affiner sa recherche en utilisant les filtres suivants :
    * Catégories de produits (ex: "BISCUIT", "BOISSONS", etc.).
    * Statut : Promotion, Nouveauté, Tendance.
    * Prix : Trier par prix croissant et décroissant.
* **F1.3 - Page Produit :** Doit présenter clairement le nom du produit, une image, le prix TTC et le bouton "Ajouter au panier".

### F2 : Processus de Commande et Logistique (Guest Checkout V1)
* **F2.1 - Tunnel de Commande :** Le processus se déroule sans création de compte.
    1.  **Panier :** Le client vérifie ses articles.
    2.  **Options de Récupération :** Le client choisit entre "Retrait en magasin" (gratuit) ou "Livraison à domicile via Yango".
    3.  **Règle de Commande Minimum :** Si la livraison est choisie, le système doit imposer un montant minimum de **3000 F CFA**. Un message d'erreur clair doit s'afficher si le panier est inférieur à ce montant.
    4.  **Informations Client :** Saisie des informations nécessaires à la livraison (Nom, téléphone, adresse précise).
    5.  **Paiement :** Le client est redirigé vers CinetPay pour finaliser la transaction.
* **F2.2 - Intégration Yango Livraison :** L'interface doit pouvoir estimer les frais de livraison en se basant sur l'adresse du client et les tarifs de Yango, puis les ajouter au total de la commande.

### F3 : Gestion des Produits à Poids Variable (Boucherie, Poissonnerie)
* **F3.1 - Affichage :** Les produits concernés (ex: "Gigot d'agneau") sont affichés avec un prix au kg et une mention claire : *"Le prix final sera ajusté après la pesée."*
* **F3.2 - Workflow de Paiement Ajusté :**
    1.  Lors du paiement, le système effectue une **pré-autorisation** du montant estimé via CinetPay.
    2.  L'équipe en magasin pèse le produit et note le poids exact.
    3.  L'administrateur met à jour la commande dans le back-office avec le poids final, ce qui recalcule le prix total.
    4.  L'administrateur **capture le paiement final exact** auprès de CinetPay. Le client n'est débité que du montant réel.

### F4 : Panneau d'Administration (Back-Office)
* **F4.1 - Gestion des Produits :** L'administrateur doit pouvoir gérer le catalogue et assigner les étiquettes "Promotion", "Nouveauté", "Tendance" aux produits.
* **F4.2 - Gestion des Commandes :** Le tableau de bord doit permettre de suivre les commandes et d'**ajuster le poids et le prix final** des commandes contenant des produits variables.

## 5. Exigences Techniques
* **Back-End Framework :** **Laravel**.
* **Front-End Framework :** **Laravel Blade** utilisant **Inertia.js** pour l'intégration de composants **React** ou **Vue.js**.
* **Styling & UI :** **Tailwind CSS** et la bibliothèque de composants **Shadcn/ui** (implémentée via la stack Inertia.js).
* **Base de Données :** MySQL ou PostgreSQL, gérée par l'ORM Eloquent de Laravel.
* **Intégrations API :**
    * **Paiement :** CinetPay.
    * **Livraison :** Yango Livraison.
* **Gestion des Stocks :** Les mises à jour du stock seront effectuées **manuellement** par un développeur dans le back-office pour la V1. Il n'y aura pas de synchronisation en temps réel avec Odoo.

## 6. Périmètre du Projet (V1.0)

### En Périmètre (In Scope) :
* L'ensemble des fonctionnalités décrites dans les sections F1 à F4.
* Processus de commande complet en tant qu'invité ("Guest Checkout").
* Panneau d'administration pour la gestion des produits et des commandes.
* Intégration fonctionnelle de CinetPay et Yango.

### Hors Périmètre (Out of Scope - Pour V2 et au-delà) :
* **Création de comptes clients** (historique de commandes, adresses sauvegardées).
* **Synchronisation automatique et en temps réel des stocks** avec le logiciel Odoo.
* Fonctionnalités avancées (listes de favoris, programme de fidélité, etc.).

## 7. Prochaines Étapes
1.  Validation de ce PRD.
2.  Conception de l'interface utilisateur (UI/UX) en s'appuyant sur les maquettes et la bibliothèque Shadcn/ui.
3.  Développement de l'application Laravel et des intégrations API.
4.  Phase de tests pour valider tous les scénarios de commande.
5.  Déploiement et mise en ligne.

## 8. Documentation Technique

Pour l'implémentation technique de ces spécifications :
- **Architecture complète :** Voir [structure.md](./structure.md)
- **Plan de développement :** Voir [task.md](./task.md)
- **Intégrations spécifiques :**
  - Base de données : [supabase.md](./supabase.md)
  - Paiement : [cinetpay.md](./cinetpay.md)