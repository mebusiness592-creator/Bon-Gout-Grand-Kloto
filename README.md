# Bon Goût du Grand Kloto — plateforme restaurant + production locale

Version finale 3.1. Next.js 15 · React 19 · TypeScript · MongoDB Atlas · Cloudinary.

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
Spécialités / catégories (avec image) → Restaurant (plats, galerie, associations) → Produits locaux (produits, conditionnements, stock) → Galerie (emplacements : bannière d'accueil, restaurant, production locale) → Paramètres (coordonnées, horaires, frais de livraison, modes de paiement).

## Ce qui est implémenté (phase 1)
- Position GPS : le bouton remplit l'adresse automatiquement (service OpenStreetMap Nominatim, usage modéré ; si l'adresse n'est pas trouvée, le client complète à la main).
- Site public : accueil, restaurant, menu par **spécialités** (catégories avec image) → page des plats de la spécialité → fiche du plat avec **associations à choisir** (ex. foufou + sauce d'arachide / sauce tomate, chacune avec sa photo), boutique de produits locaux organisée de la même façon (catégories avec image), à propos, contact, pages légales (textes de base à faire relire).
- **Prix libre** : un prix (`1500`) ou une fourchette (`500-5000`) ; pour une fourchette, le client choisit son montant dans l'intervalle, vérifié côté serveur.
- **Bannières** du restaurant et des produits locaux : diaporama automatique (4,5 s) alimenté par plusieurs images envoyées dans Admin > Galerie (emplacements « Bannière du restaurant » et « Bannière des produits locaux »).
- **Image du plat** (et de l'association choisie) dans la confirmation, l'historique client et les commandes de l'admin.
- Navigation : barre d'onglets en bas sur téléphone (Accueil, Menu, Produits, Panier, Compte), panier et compte toujours accessibles.
- Panier mixte (restaurant + production locale), commande, géolocalisation optionnelle (autorisation explicite du navigateur), page de confirmation.
- Montants calculés côté serveur (prix en base, promotions, frais de livraison, stock vérifié).
- Comptes clients : inscription, connexion (œil afficher/masquer), espace client (profil, commandes, notifications).
- Paiement : mobile USSD (statut « en attente de vérification » tant que l'admin n'a pas confirmé) ou à la livraison.
- Administration : dashboard + graphique, commandes (filtres, statuts, GPS), restaurant, catégories, production locale, clients, livraisons (carte OpenStreetMap + itinéraire), paiements (confirmer/refuser + historique), galerie photos/vidéos, notifications, utilisateurs et rôles, paramètres.
- PWA : manifest et icônes (installation possible ; pas de mode hors-ligne / service worker).

## Aperçu mobile dans Chrome
F12 (ou Ctrl+Maj+I) → icône « appareil mobile » (Ctrl+Maj+M) → choisir un Pixel / iPhone. Pour tester sur un vrai téléphone : `npm run dev -- -H 0.0.0.0` puis ouvrir `http://IP-DE-VOTRE-PC:3000` (même Wi-Fi), ou utiliser l'URL de prévisualisation Vercel (HTTPS, nécessaire pour la géolocalisation).

## Notifications, paiement, configuration
- **Notifications dans l'application** : l'admin est prévenu d'une nouvelle commande, d'une inscription, d'un paiement annoncé par le client et d'un stock faible (≤ 3). Le client est prévenu à la réception de sa commande et à chaque changement de statut (commande, paiement, livraison).
- **Push OneSignal** : variables `NEXT_PUBLIC_ONESIGNAL_APP_ID` + `ONESIGNAL_REST_API_KEY` (clé de l'**application**, `os_v2_app_…`). Dans OneSignal, déclarer le site en « Web » (URL en https) ; le fichier `public/OneSignalSDKWorker.js` est fourni. Le bouton « Activer les notifications » est dans Mon compte. Sur iPhone, le site doit d'abord être ajouté à l'écran d'accueil. Les appareils sont reliés aux comptes (external id = id utilisateur).
- **USSD** : `npm run check:env` contrôle le format des codes (début `*`, fin `#`, variables `{amount}` / `{phone}`) et affiche un exemple ; seul un test réel avec un petit montant confirme que le code est le bon.
- **Envoi des photos/vidéos** : direct navigateur → Cloudinary (signature du serveur) : Vercel ne reçoit jamais le fichier, donc pas de limite de 10 s ni de 4,5 Mo. Limites du site : images 10 Mo, vidéos 80 Mo (vérifiez la limite de votre offre Cloudinary).
- **Statuts colorés** : commande, paiement et livraison ont chacun une couleur distincte.

## Compte, notifications, suppressions (3.1)
- Mon compte : menus Commandes / Profil (photo envoyée vers Cloudinary) / Mot de passe / Notifications ; cloche avec historique en haut du site.
- Les notifications (admin et clients) sont supprimées automatiquement après 2 jours ; chacun peut aussi supprimer ses messages.
- Suppression de commande : l'administrateur supprime définitivement ; le client retire une commande livrée ou annulée de son historique (elle reste visible pour le restaurant).
- Un compte administrateur garde l'accès à son espace client (« Mon compte ») ; le rôle ne se change pas soi-même (protection) : modifier le rôle dans Utilisateurs & rôles par un autre admin ou dans MongoDB Atlas.
- Le mot de passe oublié par e-mail n'est pas encore activé (en attente du choix du service d'envoi).

## Restant / à connaître
- OneSignal : intégration prête, à tester avec vos clés d'application.
- Réinitialisation du mot de passe **par e-mail** : non activée (aucun service e-mail). Un administrateur peut définir un mot de passe temporaire dans « Utilisateurs & rôles ».
- Vérification automatique des paiements par les opérateurs : non incluse (confirmation manuelle par l'admin).
- Les fichiers supprimés dans l'admin ne sont pas supprimés de Cloudinary.
- La limitation des tentatives de connexion est en mémoire (par instance serveur) : à renforcer en production si nécessaire.

## Déploiement Vercel
Importer le dépôt, ajouter les variables d'environnement ci-dessus (ne pas écraser celles déjà en production), déployer. Si le déploiement précédent utilisait `ADMIN_EMAIL` / `ADMIN_PASSWORD`, ces variables ne sont plus utilisées.

## Compatibilité avec la première version
Collections conservées : `products` (sections `restaurant` / `huile`, ancien champ `imageUrl` toujours lu ; nouveaux champs `priceMax`, `variants`), `categories` (champ `image` ajouté), `orders`, `notifications`. Les anciennes notifications (sans champ `audience`) restent visibles côté admin.
