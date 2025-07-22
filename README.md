# MonEpice&Riz - E-commerce Platform

Site e-commerce pour l'épicerie MonEpice&Riz basée à Abidjan, développé avec Laravel et React (Inertia.js).

## 🚀 Stack Technique

- **Backend:** Laravel 11.x
- **Frontend:** React avec Inertia.js
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Payment:** CinetPay
- **Delivery:** Yango API
- **Hosting:** o2Switch

## 📚 Documentation

Toute la documentation du projet se trouve dans le dossier `/docs` :

- [PRD (Product Requirements)](./docs/prd.md) - Spécifications fonctionnelles
- [Architecture Technique](./docs/structure.md) - Structure et patterns
- [Guide Supabase](./docs/supabase.md) - Configuration base de données
- [Intégration CinetPay](./docs/cinetpay.md) - Système de paiement
- [Plan de Développement](./docs/task.md) - Suivi des tâches
- [Déploiement o2Switch](./docs/deployment-o2switch.md) - Guide de mise en production

## 🛠️ Installation Locale

1. **Cloner le repository**
   ```bash
   git clone [url-du-repo]
   cd monepiceriz
   ```

2. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos credentials
   ```

3. **Installer les dépendances**
   ```bash
   composer install
   npm install
   ```

4. **Générer la clé d'application**
   ```bash
   php artisan key:generate
   ```

5. **Lancer le développement**
   ```bash
   npm run dev
   php artisan serve
   ```

## 🏗️ Structure du Projet

```
monepiceriz/
├── docs/           # Documentation complète
├── app/            # Code Laravel
├── resources/      # Vues React/Inertia
├── database/       # Migrations et seeders
├── public/         # Assets publics
└── config/         # Configuration
```

## 🤝 Contribution

1. Lire la documentation dans `/docs`
2. Suivre les conventions établies
3. Tester avant de push
4. Documenter les changements

## 📞 Support

- Documentation technique : `/docs`
- Tracking des bugs : `/docs/bugs.md`
- Plan de développement : `/docs/task.md`

## 📄 License

Propriétaire - MonEpice&Riz © 2025