# Bon Goût du Grand Kloto

Plateforme Next.js pour deux activités : Restaurant Bon Goût et vente d'huile rouge.

## Installation
1. Installer Node.js 20 ou supérieur.
2. Décompresser le ZIP puis ouvrir le dossier dans VS Code.
3. Dans un terminal, exécuter `npm install`.
4. Copier `.env.example` vers `.env.local` et renseigner les accès.
5. Exécuter `npm run dev`, puis ouvrir http://localhost:3000.

## Services à configurer
- MongoDB Atlas : créer une base et renseigner `MONGODB_URI` et `MONGODB_DB`.
- Cloudinary : renseigner les trois clés. Les photos sont ajoutées depuis l'administration.
- Admin : renseigner `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `AUTH_SECRET`.
- USSD : renseigner les modèles exacts validés auprès de TMoney/Flooz. Ne pas deviner les codes opérateurs. Le site prépare un lien `tel:` à partir de la variable configurée. La disponibilité du préremplissage dépend du téléphone et de l'opérateur.
- OneSignal : variables prévues, intégration push à finaliser avec les identifiants du compte.

## Déploiement Vercel
Importer le dépôt GitHub dans Vercel, ajouter les variables de `.env.example` dans Project Settings > Environment Variables, puis déployer.

## Fonctionnement
- `/` : accueil avec deux univers.
- `/restaurant` : menu et panier.
- `/huile-rouge` : catalogue d'huile rouge.
- `/commande/[id]` : confirmation et instructions de paiement.
- `/admin/login` : connexion administration.
- `/admin` : gestion des produits, commandes et notifications.

## Sécurité et limites à traiter avant ouverture au public
- Changer impérativement les secrets par défaut.
- Les paiements USSD ne sont pas automatiquement vérifiés par l'opérateur : l'administration doit confirmer le paiement après contrôle.
- La géolocalisation nécessite l'autorisation du client et un contexte HTTPS. Une saisie d'adresse reste disponible en cas de refus.
- Configurer les conditions de livraison, frais, numéros de réception et codes USSD exacts avant la mise en production.
