#!/usr/bin/env python3
"""Serveur local de développement pour SoFix Budget.

Utilisation (depuis n'importe quel dossier) :
    python3 outils/serveur.py            -> port 8000
    python3 outils/serveur.py 8080       -> autre port

- Sert le dossier du projet (le dossier parent de "outils").
- Accessible depuis ce Mac ET depuis les appareils du même réseau local
  (téléphone en Wi-Fi par exemple) : les adresses à ouvrir sont affichées au démarrage.
- Désactive le cache du navigateur : un simple rechargement suffit après une modification.
- Refuse les fichiers et dossiers cachés (.git, .DS_Store...) : ils n'ont rien à faire sur le réseau.

Les fichiers de sauvegarde (.json) ne passent jamais par ce serveur : ils sont lus et
enregistrés directement par le navigateur, sur l'appareil qui les ouvre.
Arrêt : Ctrl + C.
"""
import functools
import http.server
import socket
import sys
import urllib.parse
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Pas de cache : le navigateur redemande toujours la dernière version des fichiers
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        # Aucun élément de chemin ne doit commencer par un point (.git, .DS_Store, ...).
        # Le chemin est décodé avant la vérification ("%2Egit" = ".git"), comme le fait le
        # serveur pour trouver le fichier ; les "\" sont aussi traités comme des séparateurs.
        chemin = urllib.parse.unquote(self.path.split("?", 1)[0].split("#", 1)[0])
        if any(partie.startswith(".") for partie in chemin.replace("\\", "/").split("/") if partie):
            self.send_error(404, "Fichier introuvable")
            return None
        return super().send_head()


def adresse_locale():
    """Adresse IP du Mac sur le réseau local (aucune donnée n'est envoyée)."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        try:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
        except OSError:
            return None


if __name__ == "__main__":
    gestionnaire = functools.partial(Gestionnaire, directory=str(RACINE))
    serveur = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), gestionnaire)
    ip = adresse_locale()
    print(f"SoFix Budget servi depuis {RACINE}")
    print(f"  Sur ce Mac           : http://127.0.0.1:{PORT}")
    if ip:
        print(f"  Sur le réseau local  : http://{ip}:{PORT}   (téléphone sur le même Wi-Fi)")
    print("Arrêt : Ctrl + C", flush=True)
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté.")
