---
title: README
updated: 2024-09-28 20:14:33Z
created: 2024-09-28 19:51:19Z
---

# Projet Back-End : jeu multi-joueur en temps réel

Ce projet a pour but de créer un jeu tournant sur un serveur Node à l’aide d’Express, multi-joueurs et en temps réel avec socket.io, avec sauvegarde des scores sur une base de données MongoDB Atlas.

# Installation du jeu sur votre ordinateur

Pour installer mon jeu en local, il vous faut installer sur votre ordinateur :  
\- un serveur Node  
\- un serveur de base de données mongoDB

Installer la base de données :  
\- la database se nomme : <span style="color: #7e8c8d;">projet_back-end</span>  
\- la collection se nomme : <span style="color: #7e8c8d;">chifoumi</span>  
\- le nom du fichier est : <span style="color: #7e8c8d;">projet_back-end.chifoumi.json</span>  
`mongoimport --db projet_back-end --collection chifoumi --file "nomDuDossier/projet_back-end.chifoumi.json"` sous linux

Installer les modules, depuis le dossier où vous avez cloner mon jeu : `npm install`

A la racine du jeu, créer un fichier nommé `.env` et saisir à l’intérieur :

```txt
PORT=1234  
MONGODB_CONNECTION_STRING="mongodb://localhost:27017/"
```

Remarque : vous pouvez choisir un autre port.

Lancer le serveur NodeJS sur le fichier <span style="color: #ba372a;">/bin</span> : `node www`

# Remerciements

Je remercie Fabian pour son temps et ses précieux conseils.