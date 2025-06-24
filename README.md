
-----------------------------------------
# Le Combattant de l'Autoroute

**Le Combattant de l'Autoroute** est une application web interactive de type “livre dont vous êtes le héros”, développée en React et construite avec Vite. Vous incarnez un personnage dans une aventure post-apocalyptique où chaque choix modifie l’histoire et les statistiques du héros. Ce projet met l’accent sur la narration interactive, l’immersion et la qualité de l’expérience utilisateur.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique et librairies](#stack-technique-et-librairies)
- [Structure du projet](#structure-du-projet)
- [Installation & développement](#installation--développement)
- [Principes d’architecture](#principes-darchitecture)
- [Contribution](#contribution)
- [Auteur](#auteur)
- [Licence](#licence)

---

## Présentation

Le projet propose une expérience de livre interactif entièrement web, avec :

- Un choix de personnages jouables, chacun doté de sa propre histoire et de statistiques uniques.
- Une navigation fluide entre les chapitres, chaque décision de l’utilisateur influençant la progression et la fin de l’aventure.
- Un système de sauvegarde locale de la progression et des choix, pour pouvoir reprendre la partie à tout moment.

---

## Fonctionnalités

- **Sélection et gestion du personnage** (stockée en localStorage)
- **Avancée narrative dynamique** : chaque chapitre est chargé en fonction des choix du joueur
- **Gestion globale de l’état** via les Context Providers React (chapitre, notifications, inventaire…)
- **Transitions et animations immersives** avec GSAP et React Transition Group
- **Affichage sécurisé de contenu Markdown** (avec DOMPurify et Marked)
- **Interface responsive** (SCSS modulaire, media-queries, flex/grid)
- **Accessibilité** : navigation clavier, focus, modales accessibles, alt text systématique
- **Expérience utilisateur moderne** : composants UI custom, feedback instantané, design immersif

---

## Stack technique et librairies

Le projet est construit autour de **Vite** (build, dev server, HMR) et **React** pour l’UI.

### Outils principaux

- **Vite** (`vite`, `@vitejs/plugin-react-swc`) : outillage de build et développement, HMR instantané, configuration simple.
- **React 19** (`react`, `react-dom`) : bibliothèque d’UI basée sur les composants fonctionnels et hooks.
- **React Router** (`react-router-dom`) : routage dynamique et navigation sans rechargement.
- **SCSS** (`sass`) : préprocesseur CSS pour la gestion des styles avancés et réutilisables.

### Librairies UI et animation

- **GSAP** (`gsap`) : moteur d’animations JS performant pour transitions et effets visuels.
- **React Transition Group** (`react-transition-group`) : transitions d’apparition/disparition de composants React.
- **React Icons** (`react-icons`) : pack d’icônes vectorielles utilisables dans les composants.
- **Modal custom**, **cartes**, **boutons** et autres composants UI réutilisables.

### Sécurité & contenu dynamique

- **DOMPurify** (`dompurify`) : sanitation sécurisée du HTML pour éviter les failles XSS.
- **Marked** (`marked`) : parsing performant du Markdown pour afficher le contenu des chapitres ou descriptions.

### Qualité & expérience développeur

- **ESLint** (`eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) : linting strict et règles personnalisées.
- **TypeScript types** (`@types/react`, `@types/react-dom`) : typage pour l’auto-complétion (même si le projet est majoritairement JS).
- **Globals** (`globals`) : gestion des variables globales pour ESLint.

---

## Structure du projet

```txt
le-combattant-de-l-autoroute/
├── public/                  # Fichiers statiques (index.html, images accessibles public)
├── src/
│   ├── assets/              # Images, polices, sons, icônes
│   ├── components/          # Composants UI réutilisables (App, Modal, Nav…)
│   ├── context/             # Context Providers React (état global : chapitres, stats…)
│   ├── config/              # Fichiers de configuration (routes, constantes)
│   ├── pages/               # Pages principales (Accueil, Chapitres…)
│   ├── styles/              # Styles SCSS globaux, variables, mixins
│   └── main.jsx             # Point d’entrée React
├── package.json
├── vite.config.js           # Configuration Vite + plugin React SWC
├── README.md
└── ...                      # Autres fichiers de config (eslint, etc.)
```

---

## Installation & développement

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x

### Démarrage rapide

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/FoxCodeur/le-combattant-de-l-autoroute.git
   cd le-combattant-de-l-autoroute
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement Vite**
   ```bash
   npm run dev
   ```
   Accédez à [http://localhost:5173](http://localhost:5173).

4. **Build de production**
   ```bash
   npm run build
   ```
   Les fichiers optimisés sont générés dans `/dist`.

5. **Prévisualisation de la build**
   ```bash
   npm run preview
   ```

---

## Principes d’architecture

- **React function components** & hooks pour la gestion de l’état et la réactivité.
- **Context Providers** pour le partage d’état global (progression, stats, notifications…).
- **Découpage modulaire** : chaque composant et page a sa logique, ses styles, sa documentation interne.
- **Persistance** : sauvegarde de la progression, du personnage et de l’inventaire en `localStorage`.
- **Sécurité** : tout contenu HTML dynamique est purifié avec DOMPurify avant rendu.
- **Animations** : GSAP pour les effets, React Transition Group pour les transitions de pages/composants.
- **Qualité** : linting strict, code commenté, conventions de nommage homogènes.
- **Accessibilité** : clés de navigation, gestion des focus, modales accessibles.

---

## Contribution

Les contributions sont les bienvenues !  
Merci de :

1. Forker le dépôt
2. Créer une branche dédiée (`feature/ma-nouvelle-fonction`)
3. Commiter avec des messages clairs
4. Proposer une Pull Request descriptive

Ouvrez une *Issue* pour toute question, bug ou suggestion d’évolution.

---

## Auteur

- [FoxCodeur](https://github.com/FoxCodeur)

---

## Licence

Projet sous licence MIT. Voir le fichier [LICENSE](LICENSE).

---

> Pour toute question technique ou contribution, consultez le code source ou ouvrez une issue sur le dépôt GitHub.

---
