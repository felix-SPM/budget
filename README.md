# SoFix Budget

Application web de gestion du budget mensuel d'un foyer : revenus, dépenses, répartition
des virements entre les comptes et suivi des enveloppes d'épargne.
Elle remplace le classeur Excel « Budget » utilisé jusqu'ici, avec les mêmes calculs.

**Version actuelle : 1.1**

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

### Avec Docker

Le site peut aussi tourner dans un conteneur Docker (serveur nginx), sur toute machine
disposant de Docker et de Docker Compose (processeur Intel ou ARM) :

```sh
docker compose up -d            # construit l'image et démarre le conteneur
docker compose up -d --build    # après une modification du site
docker compose down             # arrêt
```

Ou directement avec l'image publiée sur GitHub Container Registry (sans récupérer le code) :

```sh
docker run -d -p 8080:8080 --restart unless-stopped --name sofix-budget ghcr.io/felix-spm/budget:latest
```

L'image est construite, testée et publiée automatiquement par GitHub Actions à chaque
étiquette de version (`vX.Y`), pour les processeurs Intel et ARM
(voir `.github/workflows/docker.yml`).

Tags disponibles :
- `latest`, `1`, `1.1`… : versions officielles (`latest` = la plus récente) ;
- `docker` : version **de test**, reconstruite à chaque envoi sur la branche `docker`.
  Pour essayer une modification avant sa fusion : `image: ghcr.io/felix-spm/budget:docker`.

Le site est alors accessible sur http://127.0.0.1:8080, et depuis le réseau local sur
`http://<adresse-IP-de-la-machine>:8080`. Le conteneur redémarre automatiquement avec
Docker. Il ne contient que le site : les fichiers de sauvegarde restent sur l'appareil
qui les ouvre.

### Écrire son propre fichier compose.yaml

Pour lancer l'image publiée sans récupérer le code, créer un dossier contenant un fichier
`compose.yaml`, puis lancer `docker compose up -d` dans ce dossier.

**Fichier minimal :**

```yaml
services:
  sofix-budget:
    image: ghcr.io/felix-spm/budget:latest
    container_name: sofix-budget
    ports:
      - "8080:8080"
    restart: unless-stopped
```

**Fichier complet commenté :**

```yaml
services:
  sofix-budget:                       # nom du service (libre)

    # Image à utiliser : "latest" = dernière version publiée.
    # Pour figer une version : ghcr.io/felix-spm/budget:1.1 (ou :1 = dernière 1.x)
    image: ghcr.io/felix-spm/budget:latest

    container_name: sofix-budget      # nom affiché par "docker ps"

    # Ports : "port de la machine:port du conteneur".
    # Le conteneur écoute toujours sur 8080 ; seul le premier nombre se change.
    ports:
      - "8080:8080"                   # site sur http://<machine>:8080
      # - "80:8080"                   # site sur http://<machine> (port 80, s'il est libre)
      # - "127.0.0.1:8080:8080"       # accessible uniquement depuis la machine elle-même

    # Redémarrage automatique (après un plantage ou un redémarrage de la machine),
    # sauf si le conteneur a été arrêté volontairement
    restart: unless-stopped

    # Variables d'environnement (facultatif, voir ci-dessous)
    environment:
      NGINX_ENTRYPOINT_QUIET_LOGS: "1"   # masque les messages de démarrage de nginx

    # Dossiers montés (facultatif, voir ci-dessous) : "dossier de la machine:dossier du conteneur"
    # ":ro" = lecture seule pour le conteneur
    # volumes:
    #   - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro

    # Sécurité (recommandé) : le conteneur ne fait que servir des fichiers
    read_only: true                   # système de fichiers en lecture seule...
    tmpfs:                            # ...sauf les dossiers temporaires de nginx
      - /tmp
      - /var/cache/nginx
    security_opt:
      - no-new-privileges:true
```

**Règles d'écriture du YAML :**
- l'indentation se fait **uniquement avec des espaces** (jamais de tabulation), et elle a un
  sens : tout ce qui est décalé sous `sofix-budget:` concerne ce service ;
- une liste s'écrit avec un tiret par élément (`- "8080:8080"`) ;
- tout ce qui suit un `#` est un commentaire ;
- mettre les valeurs du type `"8080:8080"` ou `"1"` entre guillemets évite que YAML les
  interprète comme des nombres.

**Dossiers à monter (`volumes`) :** aucun n'est nécessaire. Le conteneur ne stocke aucune
donnée : les fichiers de budget sont ouverts et enregistrés par le navigateur, sur
l'appareil de l'utilisateur. Deux montages peuvent toutefois servir :
- remplacer la configuration nginx :
  `./nginx.conf:/etc/nginx/conf.d/default.conf:ro` (partir de `docker/nginx.conf` du dépôt,
  et garder `listen 8080;`) ;
- tester une version modifiée du site sans reconstruire l'image, en montant le dossier du
  projet : `./:/usr/share/nginx/html:ro` (à lancer depuis le dossier du projet ; attention,
  tous les fichiers du dossier deviennent alors accessibles, sauf les fichiers cachés).

**Variables d'environnement (`environment`) :** l'application elle-même n'en utilise aucune
(pas de mot de passe, pas de base de données). Seule une variable de l'image nginx est utile :
`NGINX_ENTRYPOINT_QUIET_LOGS: "1"`, qui masque les messages de démarrage dans
`docker logs`.

**Commandes utiles :**

```sh
docker compose up -d        # démarrer (télécharge l'image la première fois)
docker compose pull         # télécharger la dernière version de l'image...
docker compose up -d        # ...puis redémarrer avec elle
docker compose logs -f      # suivre le journal (Ctrl + C pour quitter)
docker compose ps           # état du conteneur (dont "healthy" si le site répond)
docker compose down         # arrêter et supprimer le conteneur
```

## Organisation du code

```
index.html              page unique, une section par partie du budget
style/                  feuilles de style (style.css, icon.css)
scripts/backend/        données et calculs (aucun accès à la page)
scripts/frontend/       affichage et gestion des clics / saisies
outils/serveur.py       serveur local de développement
Dockerfile, compose.yaml, docker/   image Docker (nginx) du site
```

La structure complète du fichier de sauvegarde est décrite en tête de
`scripts/backend/donnees.js`. Un fichier qui ne la respecte pas est refusé au chargement.

## Historique des versions

### 1.1 — novembre 2026

Dockerisation : le site peut tourner dans un conteneur Docker (nginx), lancé avec
`docker compose` ou directement depuis l'image publiée `ghcr.io/felix-spm/budget`
(processeurs Intel et ARM). L'image est construite, testée et publiée automatiquement
par GitHub Actions à chaque version. Aucune modification du fonctionnement du site.

### 1.0 — novembre 2026

Première version complète, au niveau du classeur Excel : utilisateurs, comptes, revenus,
dépenses par catégorie, répartition des virements (calcul vérifié au centime près contre la
feuille Résumé de l'Excel), enveloppes, clôture mensuelle du budget et affichage mobile.
