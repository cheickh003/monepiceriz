# Support Layer

Utilitaires et helpers transverses à l'application.

## Responsabilités

- Helpers et utilitaires réutilisables
- Traits communs
- Services de cryptage/décryptage
- Formatters et validators
- Logging et monitoring

## Structure suggérée

- **Helpers/** : Fonctions utilitaires
- **Traits/** : Traits réutilisables
- **Encryption/** : Services de chiffrement
- **Formatters/** : Formatage des données (prix, dates, etc.)
- **Validators/** : Règles de validation personnalisées
- **Monitoring/** : Intégration Sentry et métriques

## Exemples

```php
// Support/Helpers/PriceHelper.php
class PriceHelper
{
    public static function formatCFA(int $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' CFA';
    }
}

// Support/Traits/HasEncryptedAttributes.php
trait HasEncryptedAttributes
{
    // Chiffrement transparent des attributs sensibles
}
```