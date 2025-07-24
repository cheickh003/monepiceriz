import { Head } from '@inertiajs/react'
import ShopLayout from '@/Layouts/ShopLayout'
import { Heart } from 'lucide-react'

export default function Favorites() {
  return (
    <ShopLayout>
      <Head title="Favoris" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>
        
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Vous n'avez pas encore de favoris
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Ajoutez vos produits préférés pour les retrouver facilement
          </p>
        </div>
      </div>
    </ShopLayout>
  )
}