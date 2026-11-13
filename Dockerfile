# Image Docker de SoFix Budget : le site (HTML, CSS, JavaScript) servi par nginx.
# Aucune donnée n'est stockée dans le conteneur : les fichiers de sauvegarde (.json)
# sont lus et enregistrés par le navigateur, sur l'appareil de l'utilisateur.
#
# Construction : docker build -t sofix-budget .
# Lancement    : docker run -d -p 8080:8080 --name sofix-budget sofix-budget
#                (ou : docker compose up -d)

# Image officielle nginx, variante "unprivileged" : nginx ne tourne pas en root
# et écoute sur le port 8080. Disponible pour les processeurs Intel et ARM.
FROM nginxinc/nginx-unprivileged:1.28-alpine

# Configuration du site (remplace la configuration par défaut)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers du site uniquement (voir aussi .dockerignore)
COPY index.html /usr/share/nginx/html/
COPY style/     /usr/share/nginx/html/style/
COPY scripts/   /usr/share/nginx/html/scripts/
COPY img/       /usr/share/nginx/html/img/

EXPOSE 8080

# Docker vérifie toutes les 30 s que le site répond
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
