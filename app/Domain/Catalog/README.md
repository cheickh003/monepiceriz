# Catalog Domain

Gestion du catalogue de produits.

## Responsabilités

- Gestion des catégories
- Gestion des produits et leurs variantes (SKUs)
- Gestion des attributs produits (poids, conditionnement)
- Gestion des images produits
- Recherche et filtrage de produits

## Entités principales

- **Category** : Catégories de produits
- **Product** : Produits du catalogue
- **ProductSku** : Variantes de produits (différents poids/conditionnements)
- **ProductAttribute** : Attributs des produits
- **ProductAttributeValue** : Valeurs possibles des attributs

## Services

- **ProductService** : Logique métier des produits
- **CategoryService** : Gestion des catégories
- **SearchService** : Recherche full-text PostgreSQL