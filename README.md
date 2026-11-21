# Bon Goût du Grand Kloto — plateforme restaurant + production locale

Version 2.0 (phase 1 : fondations + administration). Next.js 15 · React 19 · TypeScript · MongoDB Atlas · Cloudinary.

## Installation
```bash
npm install
cp .env.example .env.local     # puis renseigner les valeurs
npm run dev                    # http://localhost:3000
npm run build                  # compilation de production
```
Node.js 20 ou supérieur.

## Configuration
1. **MongoDB Atlas** : créer un cluster, un utilisateur de base, autoriser l'accès réseau (0.0.0.0/0 pour Vercel), copier l'URI dans `MONGODB_URI`. Les collections sont créées automatiquement : `users, products, categories, orders, notifications, media, settings`.
2. **AUTH_SECRET** : chaîne aléatoire d'au moins 32 caractères.
3. **Cloudinary** : renseigner les 3 variables. Les fichiers partent directement du navigateur vers Cloudinary avec une signature générée par le serveur (la clé secrète ne quitte jamais le serveur).
4. **USSD** : renseigner `USSD_TMoney_TEMPLATE` et `USSD_Flooz_TEMPLATE` avec les codes validés par les opérateurs. Aucun code n'est inventé dans le projet.

## Créer le compte administrateur
1. Sur le site, créer un compte via **/inscription** (tout nouveau compte est « client »).
2. Dans MongoDB Atlas > collection `users` : modifier le champ `role` de ce compte en `admin`.
3. Se reconnecter : le rôle est relu en base à chaque requête et **/admin** s'ouvre. Rôles : `customer`, `staff` (commandes, catalogue, galerie), `admin` (tout, y compris utilisateurs et paramètres).

## Premiers pas dans l'administration
Catégories (par rubrique) → Restaurant (plats) → Production locale (produits, conditionnements, stock) → Galerie (emplacements : bannière d'accueil, restaurant, production locale) → Paramètres (coordonnées, horaires, frais de livraison, modes de paiement).

## Ce qui est implémenté (phase 1)
- Site public : accueil, restaurant, menu (catégories, recherche), fiches plats/produits, production locale, boutique locale, à propos, contact, pages légales (textes de base à faire relire).
- Panier mixte (restaurant + production locale), commande, géolocalisation optionnelle (autorisation explicite du navigateur), page de confirmation.
- Montants calculés côté serveur (prix en base, promotions, frais de livraison, stock vérifié).
- Comptes clients : inscription, connexion (œil afficher/masquer), espace client (profil, commandes, notifications).
- Paiement : mobile USSD (statut « en attente de vérification » tant que l'admin n'a pas confirmé) ou à la livraison.
- Administration : dashboard + graphique, commandes (filtres, statuts, GPS), restaurant, catégories, production locale, clients, livraisons (carte OpenStreetMap + itinéraire), paiements (confirmer/refuser + historique), galerie photos/vidéos, notifications, utilisateurs et rôles, paramètres.
- PWA : manifest et icônes (installation possible ; pas de mode hors-ligne / service worker).

## Restant pour la phase 2 / à configurer
- OneSignal (notifications push) : variables prévues, non branché.
- Réinitialisation du mot de passe **par e-mail** : non activée (aucun service e-mail). Un administrateur peut définir un mot de passe temporaire dans « Utilisateurs & rôles ».
- Vérification automatique des paiements par les opérateurs : non incluse (confirmation manuelle par l'admin).
- Les fichiers supprimés dans l'admin ne sont pas supprimés de Cloudinary.
- La limitation des tentatives de connexion est en mémoire (par instance serveur) : à renforcer en production si nécessaire.

## Déploiement Vercel
Importer le dépôt, ajouter les variables d'environnement ci-dessus (ne pas écraser celles déjà en production), déployer. Si le déploiement précédent utilisait `ADMIN_EMAIL` / `ADMIN_PASSWORD`, ces variables ne sont plus utilisées.

## Compatibilité avec la première version
Collections conservées : `products` (sections `restaurant` / `huile`, ancien champ `imageUrl` toujours lu), `orders`, `notifications`. Les anciennes notifications (sans champ `audience`) restent visibles côté admin.
