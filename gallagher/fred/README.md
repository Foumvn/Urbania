# Automatisation du Remplissage du Cerfa PDF

Ce projet permet d'automatiser le remplissage d'un formulaire Cerfa PDF via LibreOffice Draw et un script Python utilisant l'API UNO.

## Prérequis

- LibreOffice installé (ou utiliser l'AppImage si non installé)
- Python 3 avec les dépendances UNO
- Fichier `c.pdf` (formulaire Cerfa original)
- Fichier `c.odg` (converti depuis le PDF)

## Installation

### Option 1: LibreOffice installé

Si LibreOffice est installé sur le système :

```bash
# Convertir le PDF en ODG
libreoffice --headless --convert-to odg c.pdf --outdir .

# Installer les dépendances Python si nécessaire
pip install uno  # Si nécessaire
```

### Option 2: Utiliser AppImage (si LibreOffice non installé)

Télécharger l'AppImage depuis : https://appimages.libreitalia.org/LibreOffice-fresh.basic-x86_64.AppImage

```bash
# Rendre exécutable
chmod +x LibreOffice-fresh.basic-x86_64.AppImage

# Créer un alias ou utiliser directement
alias libreoffice="./LibreOffice-fresh.basic-x86_64.AppImage --appimage-extract-and-run"

# Convertir le PDF
libreoffice --headless --convert-to odg c.pdf --outdir .
```

## Configuration du Formulaire

1. Ouvrir `c.odg` dans LibreOffice Draw
2. Nommer les zones de texte et cases à cocher selon `field.txt` (ex: `numero_declaration`, `case_dpt_1`)
3. Pour les cases : nommer `case_nom` et utiliser "true"/"false" pour cocher/décocher
4. Sauvegarder le fichier `.odg`

## Utilisation

### Remplissage simple (exemples)

```bash
# Lancer LibreOffice en arrière-plan
libreoffice --headless --accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager" &

# Attendre que le serveur démarre
sleep 2

# Remplir quelques champs et exporter
python3 fill_odg.py c.odg --set numero_declaration="12345" nom_du_deposeur="Dupont" case_dpt_1="true" --pdf rempli.pdf

# Arrêter LibreOffice
kill %1
```

### Remplissage complet (tous les champs)

1. Générer la commande complète :
```bash
python3 generate_fill_command.py
```

2. Modifier `fill_command.sh` avec vos valeurs (remplacer les "" vides par vos données)

3. Lancer le remplissage :
```bash
chmod +x fill_command.sh
./fill_command.sh
```

## Liste des Champs

Voir `field.txt` pour tous les noms de champs (322 champs au total).

- **Champs texte** : noms comme `numero_declaration`, `nom_particulier`, etc.
- **Cases à cocher** : noms commençant par `case_` (ex: `case_dpt_1`)

## Optimisations

- **Polices préservées** : Le script préserve automatiquement les polices d'origine
- **Taille réduite** : PDF optimisé (résolution 96 DPI, compression maximale)
- **Caractères ajustés** : Taille de police forcée à 10pt pour éviter les caractères trop gros

## Dépannage

### Erreur "Impossible de se connecter à LibreOffice"

- Assurer que LibreOffice headless est lancé avec :
```bash
libreoffice --headless --accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager"
```

### Police qui change

- Vérifier que les shapes sont des "zones de texte" dans Draw (clic droit > Convertir > Zone de texte)

### PDF trop gros

- Les optimisations sont activées par défaut (résolution réduite, compression)

### Caractères trop gros/petits

- Modifier `new_cursor.CharHeight = 10.0` dans `fill_odg.py` (ligne ~87)

## Structure des Fichiers

- `c.pdf` : Formulaire Cerfa original
- `c.odg` : Version éditable LibreOffice Draw
- `field.txt` : Liste de tous les champs à remplir
- `fill_odg.py` : Script principal de remplissage
- `generate_fill_command.py` : Génère la commande complète
- `fill_command.sh` : Script bash pour remplissage total
- `*.pdf` : PDFs générés (remplis)
