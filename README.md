# Frontend — Extraction CIN & ICE

Interface web qui permet d’**uploader une CIN et un certificat ICE**, de les envoyer au **backend** pour extraction, puis d’utiliser les informations renvoyées (nom, prénom, CIN, RC, ville RC, etc.).

---

## Use case

1. L’utilisateur sélectionne / dépose les fichiers **CIN** et **ICE**
2. Au passage à l’étape suivante, le frontend envoie ces fichiers au **backend**
3. Le backend extrait les champs via **GLM-4.6V-Flash** (Ollama)
4. Le frontend reçoit le JSON et **préremplit** les champs d’identité

| Document uploadé | Champs préremplis |
|------------------|-------------------|
| CIN | `nom`, `prenom`, `cin` |
| ICE | `registreCommerce`, `villeRc`, `ice`, `raisonSociale` |

---

## Stack technologique

| Élément | Technologie |
|---------|-------------|
| UI | React 19, TypeScript, Vite 8 |
| Appels API | `fetch` + `FormData` (multipart) |
| Backend OCR | API FastAPI (extraction CIN / ICE) |
| LLM (côté backend) | GLM-4.6V-Flash via Ollama |

Le frontend **n’exécute pas** de modèle : toute l’extraction se fait sur le backend.

---

## Processus de traitement (upload → extraction)

```text
1. Upload
   - L’utilisateur choisit un fichier CIN (image ou PDF)
   - et/ou un fichier attestation ICE (image ou PDF)
   - Les fichiers restent en mémoire (objets File React)

2. Déclenchement
   - Au clic pour continuer, le frontend cherche :
     · le fichier CIN
     · le fichier ICE
   - S’il n’y a aucun des deux → navigation sans appel API

3. Envoi au backend (en parallèle si les deux fichiers sont présents)
   A) CIN
      POST /api/cin/extract
      multipart : champ « recto » = fichier CIN

   B) ICE
      POST /api/v1/extract-ice
      multipart : champ « file » = fichier ICE

4. Réponse backend
   - JSON avec data (champs extraits), model, processing_time_ms
   - En cas d’erreur HTTP → message affiché, on ne continue pas

5. Préremplissage
   - CIN  → nom, prenom, cin
   - ICE  → registreCommerce (RC_Numero), villeRc (RC_Ville),
            ice (ICE), raisonSociale (Denomination)

6. Suite du parcours
   - Les champs d’identification sont déjà remplis
```

### Communication réseau (local)

```env
VITE_API_BASE_URL=
```

- URL vide → appels relatifs `/api/...`
- Vite proxy → backend `http://127.0.0.1:8000`
- Avantage : **pas de CORS** en développement

Appel direct possible :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

(nécessite CORS configuré côté backend)

---

## Gestion des erreurs

| Cas | Comportement |
|-----|--------------|
| Backend arrêté / réseau | Message d’échec ; navigation bloquée |
| Erreur HTTP (4xx / 5xx) | Affiche le `detail` renvoyé par le backend |
| Une extraction échoue (CIN ou ICE) | Message d’erreur ; on ne passe pas à la suite |
| Aucun fichier CIN/ICE | Pas d’appel API ; navigation normale |
| Pendant l’extraction | Indicateur « Extraction… » / message de statut |

---

## Schémas JSON (réponses backend)

### CIN — `POST /api/cin/extract`

**Input** : `recto` (fichier), `verso` optionnel.

```json
{
  "success": true,
  "data": {
    "nom": "BENALI",
    "prenom": "Sara",
    "cin": "BE123456",
    "date_naissance": "15/03/1990",
    "lieu_naissance": "Casablanca",
    "date_expiration": "15/03/2030",
    "adresse": "12 Rue Example"
  },
  "model": "hf.co/unsloth/GLM-4.6V-Flash-GGUF:Q4_K_M",
  "processing_time_ms": 8420,
  "warning": null
}
```

### ICE — `POST /api/v1/extract-ice`

**Input** : `file` (fichier).

```json
{
  "success": true,
  "data": {
    "ICE": "001234567890123",
    "Denomination": "SOCIETE EXEMPLE SARL",
    "Identifiant_Fiscal": "12345678",
    "RC_Numero": "123456",
    "RC_Ville": "Casablanca",
    "CNSS": "1234567890"
  },
  "model": "hf.co/unsloth/GLM-4.6V-Flash-GGUF:Q4_K_M",
  "ocr_method": "vision",
  "processing_time_ms": 12100,
  "warning": null
}
```

### Erreur

```json
{ "detail": "message d’erreur" }
```

---

## Installation & lancement

**Backend** (terminal 1) — port 8000, Ollama + modèle GLM disponibles.

**Frontend** (terminal 2) :

```bash
npm install
copy .env.example .env
npm run dev
```

Ouvrir l’URL Vite affichée (ex. http://localhost:5173/).

---

## Structure (parties extraction)

```text
src/
├── services/api/ocrApi.ts              # Client HTTP CIN / ICE
└── components/steps/DocumentationStep.tsx  # Upload + envoi extraction
```

- `ocrApi.ts` : `extractCin()`, `extractIce()`, `OcrApiError`
- Étape d’upload : détection des fichiers, `Promise.all` des appels, patch des champs

---

## Lien avec le backend

| Rôle | Responsabilité |
|------|----------------|
| **Frontend** | Upload, envoi multipart, affichage erreurs, préremplissage |
| **Backend** | Validation, préparation image/PDF, appel GLM, JSON structuré |

Le détail du pipeline LLM et des codes d’erreur HTTP est décrit dans le README du **backend**.
