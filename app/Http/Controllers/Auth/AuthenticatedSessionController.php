<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Debug: Log user info
        $user = auth()->user();
        \Log::info('User login debug:', [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'is_admin' => in_array($user->role, ['admin', 'manager'])
        ]);

        // Rediriger vers la page admin si l'utilisateur est admin ou manager
        if (auth()->user() && in_array(auth()->user()->role, ['admin', 'manager'])) {
            \Log::info('Redirecting to admin dashboard');
            // Forcer la redirection vers admin sans utiliser intended()
            return redirect()->to(route('admin.dashboard', absolute: false));
        }

        \Log::info('Redirecting to user dashboard');
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
