# 🎭 EventMaster - Plateforme de Gestion d'Événements

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Une plateforme moderne et complète pour la gestion d'événements, la vente de billets et l'administration.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Déploiement](#-déploiement)
- [API Documentation](#-api-documentation)
- [Structure du Projet](#-structure-du-projet)
- [Contribution](#-contribution)
- [License](#-license)

## ✨ Fonctionnalités

### 🎫 Gestion des Événements
- ✅ Créer, modifier et supprimer des événements
- ✅ Upload d'images
- ✅ Catégorisation et tags
- ✅ Géolocalisation des lieux
- ✅ Gestion de la capacité et des places disponibles
- ✅ Validation par les administrateurs

### 🎟️ Système de Billetterie
- ✅ Achat de tickets en ligne
- ✅ Génération automatique de QR codes
- ✅ Codes de validation uniques
- ✅ Gestion des statuts (actif, utilisé, annulé)
- ✅ Historique des achats

### 👤 Gestion des Utilisateurs
- ✅ Inscription et connexion sécurisées (JWT)
- ✅ Profils utilisateurs personnalisables
- ✅ Dashboard personnel
- ✅ Gestion des préférences
- ✅ Rôles (Utilisateur, Administrateur)

### 🛡️ Administration
- ✅ Dashboard administrateur complet
- ✅ Gestion des utilisateurs (activation, désactivation, suppression)
- ✅ Gestion des événements (validation, suppression)
- ✅ Statistiques en temps réel
- ✅ Contrôle d'accès basé sur les rôles

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Animations fluides (Framer Motion)
- ✅ Dark theme élégant
- ✅ Navigation intuitive
- ✅ Notifications en temps réel (Toast)

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe
- **Express Validator** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Multer** - Upload de fichiers
- **Cloudinary** - Stockage d'images (optionnel)

### Frontend
- **React 18** - Bibliothèque UI
- **React Router v6** - Routing
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animations
- **Axios** - Client HTTP
- **React Hot Toast** - Notifications
- **Heroicons** - Icônes
- **Date-fns** - Manipulation de dates

## 📦 Installation

### Prérequis
- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm ou yarn

### 1. Cloner le repository
```bash
git clone https://github.com/rafouanta/eventmaster.git
cd eventmaster
```

### 2. Installation Backend
```bash
cd backend
npm install
```

### 3. Installation Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend (.env)
Créez un fichier `.env` dans le dossier `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eventmaster

# JWT Configuration
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (optionnel)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
Créez un fichier `.env` dans le dossier `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Utilisation

### Démarrer MongoDB
```bash
# Windows
net start MongoDB



### Démarrer le Backend
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

### Démarrer le Frontend
```bash
cd frontend
npm start
```
L'application démarre sur `http://localhost:3000`

### Créer un compte administrateur
```bash
# Dans MongoDB shell ou Compass
db.users.updateOne(
  { email: "admin@eventmaster.com" },
  { $set: { role: "admin" } }
)
```

## 🚀 Déploiement

### Déploiement sur Vercel

Votre application est prête pour le déploiement sur Vercel !

#### Guide Rapide (5 minutes)
Consultez **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** pour déployer rapidement votre application.

#### Guide Complet
Consultez **[DEPLOYMENT.md](DEPLOYMENT.md)** pour un guide détaillé avec :
- Configuration MongoDB Atlas
- Déploiement Backend et Frontend
- Configuration des variables d'environnement
- Dépannage et optimisations

#### Fichiers de Configuration
- ✅ `vercel.json` - Configuration de déploiement
- ✅ `backend/.env.example` - Variables d'environnement backend
- ✅ `frontend/.env.example` - Variables d'environnement frontend

## 📚 API Documentation

### Authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### POST /api/auth/login
Connexion
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Événements

#### GET /api/events
Liste tous les événements (publics)

#### POST /api/events
Créer un événement (authentifié)
```json
{
  "title": "Conférence Tech 2024",
  "description": "Une conférence sur les nouvelles technologies",
  "theme": "Innovation",
  "category": "conference",
  "startDate": "2024-06-15T09:00:00Z",
  "endDate": "2024-06-15T18:00:00Z",
  "venue": {
    "name": "Centre de Conférences",
    "address": {
      "street": "123 Rue de la Tech",
      "city": "Paris",
      "country": "France",
      "postalCode": "75001"
    }
  },
  "ticketPrice": 50,
  "totalCapacity": 200
}
```

#### PUT /api/events/:id
Modifier un événement (propriétaire ou admin)

#### DELETE /api/events/:id
Supprimer un événement (propriétaire ou admin)

### Tickets

#### POST /api/tickets/purchase
Acheter des tickets
```json
{
  "eventId": "event_id_here",
  "quantity": 2,
  "customerInfo": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+33612345678"
  }
}
```

#### GET /api/tickets/my-tickets
Récupérer mes tickets (authentifié)

### Administration

#### GET /api/admin/users
Liste tous les utilisateurs (admin uniquement)

#### DELETE /api/admin/users/:id
Supprimer un utilisateur (admin uniquement)

#### GET /api/admin/stats
Statistiques de la plateforme (admin uniquement)

## 📁 Structure du Projet

```
eventmaster/
├── backend/
│   ├── controllers/          # Logique métier
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/           # Middlewares
│   │   ├── auth.js          # JWT, protect, authorize
│   │   └── validation.js    # Validation des données
│   ├── models/              # Modèles Mongoose
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Ticket.js
│   ├── routes/              # Routes API
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── tickets.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── .env.example
│   ├── package.json
│   └── server.js            # Point d'entrée
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   │   ├── Common/
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   └── TicketPurchaseModal.js
│   │   │   └── Layout/
│   │   │       ├── Navbar.js
│   │   │       └── Footer.js
│   │   ├── contexts/        # Context API
│   │   │   ├── AuthContext.js
│   │   │   └── NotificationContext.js
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── pages/           # Pages de l'application
│   │   │   ├── Home.js
│   │   │   ├── Events.js
│   │   │   ├── EventDetails.js
│   │   │   ├── CreateEvent.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── MyEvents.js
│   │   │   ├── MyTickets.js
│   │   │   ├── Profile.js
│   │   │   ├── Contact.js
│   │   │   ├── About.js
│   │   │   ├── NotFound.js
│   │   │   └── Auth/
│   │   │       ├── Login.js
│   │   │       └── Register.js
│   │   ├── services/        # Services API
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md                # Ce fichier
```


## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Hash des mots de passe (Bcrypt, cost 12)
- ✅ Validation des données (Express Validator)
- ✅ Protection CSRF
- ✅ Headers sécurisés (Helmet)
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configuré
- ✅ Sanitization des inputs

## 🧪 Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Performance

- ✅ Index MongoDB optimisés
- ✅ Pagination des résultats
- ✅ Lazy loading des images
- ✅ Code splitting (React)
- ✅ Compression des assets
- ✅ Cache HTTP




## 📝 Roadmap

- [ ] Tests unitaires et d'intégration
- [ ] Système de notifications email
- [ ] Paiement en ligne (Stripe)
- [ ] Export PDF des tickets
- [ ] Multi-langue (i18n)
- [ ] Application mobile (React Native)
- [ ] Système de reviews
- [ ] Chat support en direct
- [ ] Analytics avancés

## 👥 Auteurs

- **Rafouanta Mhadji** - *Développeur Principal* - [GitHub](https://github.com/rafouanta)

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Heroicons](https://heroicons.com/)

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@eventmaster.com
- 🐛 Issues: [GitHub Issues](https://github.com/rafouanta/eventmaster/issues)
- 💬 Discord: [Rejoindre notre serveur](https://discord.gg/eventmaster)




