# SoFix Budget

Application web de gestion du budget mensuel d'un foyer : revenus, dépenses, répartition
des virements entre les comptes et suivi des enveloppes d'épargne.
Elle remplace le classeur Excel « Budget » utilisé jusqu'ici, avec les mêmes calculs.

**Version actuelle : 1.0**

## Fonctionnalités

- **Gestion des données** : chargement et enregistrement du budget dans un fichier JSON
  (`AAAAMMJJ - SoFixBudget.json`). Aucune donnée n'est envoyée sur internet : le fichier
  reste sur l'appareil qui l'ouvre.
- **Utilisateurs et comptes** : création, renommage, suppression. Chaque compte appartient
  à un utilisateur ou à « Joint » (dès deux utilisateurs) ; un compte principal (étoile)
  par propriétaire.
- **Revenus** : une ligne par utilisateur (et Joint), prorata calculé automatiquement.
- **Dépenses** : par catégorie (création, renommage, suppression, tri alphabétique), avec
  le compte qui paie, la personne à qui la dépense est à charge, l'enveloppe éventuelle à
  alimenter et une case « ponctuelle ».
- **Répartition** : liste des virements mensuels à faire. Tous les revenus arrivent sur le
  compte principal Joint, les dépenses communes sont réparties au prorata des revenus, puis
  chaque compte principal alimente les autres comptes de son propriétaire. Les virements
  peuvent être cochés comme faits.
- **Enveloppes** : sommes mises de côté sur un compte, avec leurs mouvements datés
  (provisions et dépenses) et leur solde.
- **Clôture du budget** : ajoute aux enveloppes les provisions issues des dépenses, verrouille
  le budget, télécharge une sauvegarde complète, puis permet de générer le fichier du mois
  suivant (dépenses ponctuelles retirées, virements décochés).
- **Affichage adapté au téléphone**.

## Lancer le site

Le site est fait de fichiers HTML, CSS et JavaScript, sans installation. Il faut seulement
un petit serveur local (Python 3, déjà présent sur macOS) :

```sh
python3 outils/serveur.py
```

Les adresses à ouvrir s'affichent au démarrage :
- sur l'ordinateur : http://127.0.0.1:8000
- sur un téléphone connecté au même Wi-Fi : `http://<adresse-IP-de-l'ordinateur>:8000`

Arrêt du serveur : Ctrl + C.

## Organisation du code

```
index.html              page unique, une section par partie du budget
style/                  feuilles de style (style.css, icon.css)
scripts/backend/        données et calculs (aucun accès à la page)
scripts/frontend/       affichage et gestion des clics / saisies
outils/serveur.py       serveur local de développement
```

La structure complète du fichier de sauvegarde est décrite en tête de
`scripts/backend/donnees.js`. Un fichier qui ne la respecte pas est refusé au chargement.

## Historique des versions

### 1.0 — novembre 2026

Première version complète, au niveau du classeur Excel : utilisateurs, comptes, revenus,
dépenses par catégorie, répartition des virements (calcul vérifié au centime près contre la
feuille Résumé de l'Excel), enveloppes, clôture mensuelle du budget et affichage mobile.
