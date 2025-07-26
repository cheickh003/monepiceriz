<?php

namespace App\Http\Middleware;

use App\Models\ShopDataVersion;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        // Récupérer la version optimisée des données du shop
        $dataVersion = ShopDataVersion::getGlobalVersion();
        
        // Combiner avec la version des assets parent
        $assetVersion = parent::version($request);
        
        return md5($assetVersion . $dataVersion);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
        ];
    }
}
