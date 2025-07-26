<?php

namespace Database\Seeders;

use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Boissons
            ['name' => 'Boissons', 'icon' => 'cup-soda', 'description' => 'Large sélection de boissons fraîches et raffraîchissantes', 'is_featured' => true, 'children' => [
                ['name' => 'Boissons Gazeuses', 'icon' => 'soda', 'description' => 'Sodas et boissons pétillantes'],
                ['name' => 'Boissons Sans Gaz', 'icon' => 'droplet', 'description' => 'Jus et boissons plates'],
                ['name' => 'Eau Minérale', 'icon' => 'water', 'description' => 'Eaux minérales et de source'],
            ]],
            
            // Alimentation
            ['name' => 'Alimentation', 'icon' => 'shopping-basket', 'description' => 'Produits alimentaires de base et spécialités', 'is_featured' => true, 'children' => [
                ['name' => 'Beurre et Gras Végétal', 'icon' => 'butter', 'description' => 'Beurres et matières grasses'],
                ['name' => 'Biscuits', 'icon' => 'cookie', 'description' => 'Biscuits et gourmandises'],
                ['name' => 'Charcuteries Spécialisées', 'icon' => 'ham', 'description' => 'Charcuterie fine et spécialités'],
                ['name' => 'Conserve Thon et Sardine', 'icon' => 'fish', 'description' => 'Conserves de poissons'],
                ['name' => 'Divers', 'icon' => 'package-2', 'description' => 'Autres produits alimentaires'],
                ['name' => 'Farine', 'icon' => 'wheat', 'description' => 'Farines tous usages'],
                ['name' => 'Granules', 'icon' => 'grain', 'description' => 'Granulés et céréales'],
                ['name' => 'Huiles', 'icon' => 'droplets', 'description' => 'Huiles de cuisine'],
                ['name' => 'Pâtes Alimentaires', 'icon' => 'noodles', 'description' => 'Pâtes italiennes et asiatiques'],
                ['name' => 'Riz', 'icon' => 'rice', 'description' => 'Riz de toutes variétés', 'is_featured' => true],
                ['name' => 'Vinaigre', 'icon' => 'flask-conical', 'description' => 'Vinaigres et condiments'],
            ]],
            
            // Épices et Condiments
            ['name' => 'Épices', 'icon' => 'pepper', 'description' => 'Épices du monde entier pour sublimer vos plats', 'is_featured' => true, 'meta_title' => 'Épices de qualité - MonEpice&Riz', 'meta_description' => 'Découvrez notre sélection d\'épices fraîches et authentiques', 'children' => []],
            ['name' => 'Sauces', 'icon' => 'sauce', 'description' => 'Sauces et condiments pour tous les goûts', 'children' => [
                ['name' => 'Ketchup', 'icon' => 'tomato', 'description' => 'Ketchup et sauces tomate'],
                ['name' => 'Mayonnaise', 'icon' => 'egg', 'description' => 'Mayonnaise et sauces blanches'],
                ['name' => 'Moutarde', 'icon' => 'jar', 'description' => 'Moutardes fines et à l\'ancienne'],
            ]],
            
            // Viandes et Poissons
            ['name' => 'Boucherie', 'icon' => 'beef', 'description' => 'Viandes fraîches et charcuterie de qualité', 'banner_image' => '/images/categories/boucherie.jpg', 'children' => [
                ['name' => 'Viande de Bœuf Fraîche', 'icon' => 'cow', 'description' => 'Bœuf de qualité supérieure'],
                ['name' => 'Viande de Bœuf Fumée', 'icon' => 'smoke', 'description' => 'Bœuf fumé artisanal'],
                ['name' => 'Viande Fraîche d\'Agneau', 'icon' => 'sheep', 'description' => 'Agneau tendre et savoureux'],
                ['name' => 'Viande Fraîche de Veau', 'icon' => 'baby', 'description' => 'Veau de première qualité'],
                ['name' => 'Volaille', 'icon' => 'drumstick-bite', 'description' => 'Poulet, dinde et canard'],
                ['name' => 'Saucisse pour Barbecue', 'icon' => 'hotdog', 'description' => 'Saucisses et merguez'],
                ['name' => 'Salaisons', 'icon' => 'bacon', 'description' => 'Charcuterie sèche'],
                ['name' => 'Pâtés', 'icon' => 'pie', 'description' => 'Pâtés et terrines'],
                ['name' => 'Jambons', 'icon' => 'ham', 'description' => 'Jambons blancs et crus'],
                ['name' => 'Viandes Cuites', 'icon' => 'utensils', 'description' => 'Plats préparés à base de viande'],
                ['name' => 'Pondeuse Fumée', 'icon' => 'egg', 'description' => 'Volaille fumée'],
            ]],
            
            ['name' => 'Poissonnerie', 'icon' => 'fish', 'description' => 'Poissons frais et fruits de mer', 'banner_image' => '/images/categories/poissonnerie.jpg', 'children' => [
                ['name' => 'Poissons et Fruits de Mer', 'icon' => 'waves', 'description' => 'Sélection quotidienne de produits de la mer'],
            ]],
            
            // Petit Déjeuner
            ['name' => 'Petit Déjeuner', 'icon' => 'coffee', 'description' => 'Tout pour bien commencer la journée', 'is_featured' => true, 'children' => [
                ['name' => 'Friandise', 'icon' => 'candy-cane', 'description' => 'Douceurs sucrées pour le matin'],
                ['name' => 'Yaourt', 'icon' => 'glass-water', 'description' => 'Yaourts et produits laitiers'],
            ]],
            
            // Hygiène et Entretien
            ['name' => 'Hygiène', 'icon' => 'soap', 'description' => 'Produits d\'hygiène pour toute la famille', 'children' => [
                ['name' => 'Hygiène Buccale', 'icon' => 'toothbrush', 'description' => 'Dentifrices et brosses à dents'],
                ['name' => 'Hygiène Corporelle', 'icon' => 'shower', 'description' => 'Savons et gels douche'],
            ]],
            
            ['name' => 'Produits d\'Entretien', 'icon' => 'spray-can', 'description' => 'Tout pour l\'entretien de la maison', 'children' => [
                ['name' => 'PH', 'icon' => 'sparkles', 'description' => 'Produits d\'hygiène pH neutre'],
                ['name' => 'Emballage', 'icon' => 'package', 'description' => 'Sacs et emballages'],
            ]],
            
            // MonEpice&Riz
            ['name' => 'Mon Épice&Riz', 'icon' => 'store', 'description' => 'Nos produits exclusifs et spécialités maison', 'is_featured' => true, 'meta_title' => 'Produits exclusifs MonEpice&Riz', 'meta_description' => 'Découvrez nos produits exclusifs et spécialités maison', 'children' => []],
        ];
        
        foreach ($categories as $position => $categoryData) {
            $parent = Category::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'icon' => $categoryData['icon'],
                'description' => $categoryData['description'] ?? null,
                'banner_image' => $categoryData['banner_image'] ?? null,
                'is_featured' => $categoryData['is_featured'] ?? false,
                'meta_title' => $categoryData['meta_title'] ?? $categoryData['name'] . ' - MonEpice&Riz',
                'meta_description' => $categoryData['meta_description'] ?? $categoryData['description'] ?? null,
                'position' => $position + 1,
                'is_active' => true,
            ]);
            
            foreach ($categoryData['children'] as $childPosition => $childData) {
                Category::create([
                    'name' => $childData['name'],
                    'slug' => Str::slug($childData['name']),
                    'icon' => $childData['icon'],
                    'description' => $childData['description'] ?? null,
                    'is_featured' => $childData['is_featured'] ?? false,
                    'meta_title' => $childData['meta_title'] ?? $childData['name'] . ' - ' . $parent->name . ' - MonEpice&Riz',
                    'meta_description' => $childData['meta_description'] ?? $childData['description'] ?? null,
                    'parent_id' => $parent->id,
                    'position' => $childPosition + 1,
                    'is_active' => true,
                ]);
            }
        }
    }
}