# Back-office de démonstration

Lancer `npm run dev`, puis ouvrir `/backoffice` directement pour l’espace administrateur / gestionnaire.
Le parcours client est accessible séparément à `/`. Il n’existe pas de lien de bascule entre les deux interfaces.
Les portails ont des composants et des styles chargés séparément : `src/client/ClientApp.tsx` et `src/backoffice/BackOffice.tsx`.
Cette séparation d’interface n’est pas une authentification : le back-office reste une maquette publique accessible par son URL.

## Ce qui est inclus

- 12 dossiers fictifs, 3 analystes et 84 emplacements documentaires.
- Recherche, filtres de statut/analyste/priorité, tri, pagination et export CSV.
- CIN recto/verso, ICE et justificatifs sous forme de maquettes SVG, avec aperçu et téléchargement.
- Affectation, vérification des pièces, priorité, rejet motivé, validation, archivage et réouverture.
- Retour client ciblé sur la simulation ou des documents, aperçu client et renvoi simulé avec version v2.
- Notes internes, historique et charge des analystes mis à jour au fil des actions.

## Scénarios à essayer

1. **Atlas Équipements** : transférer à Salma, vérifier les pièces, puis valider.
2. **Cabinet Nadia Santé** : demander le bilan manquant, consulter l’aperçu client et simuler le renvoi.
3. **Studio Architecture 04** : ouvrir le retour client déjà créé, modifier le montant et simuler le renvoi.
4. **Oriental Services** : consulter le motif du rejet, archiver, puis rouvrir.

## Limites intentionnelles

Tout est en mémoire dans l’onglet. Un rechargement ou une réinitialisation restaure les exemples.
Aucun login, base de données, e-mail, stockage de documents, OCR ou serveur de gestion n’est connecté.
Le formulaire client existant n’alimente pas cette maquette. Aucune soumission réelle n’est stockée ici.
Les documents ne sont pas officiels ; les décisions et capacités ne sont pas réelles.
La validation du dossier exige un analyste affecté, le statut « En analyse » et toutes les pièces vérifiées.

Le backend Python et les appels OCR existants ne sont pas modifiés.
