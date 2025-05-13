# 🎨 ThinkAPIc Frontend

### 🚀 Admin Panel for Managing Quizzes, Topics, and Courses

This is the **frontend** for ThinkAPIc, a platform designed to help web development students prepare for exams. It provides an **admin panel** where admin/teacher can manage **course topics, quizzes, and study materials**. Built with **Vue 3 and Vite**, it integrates with the ThinkAPIc REST API.

## 🌟 Features
- 📌 **Quiz Management** – Create, update, and delete quizzes.
- 📚 **Topic Management** – Organize course topics for structured learning.
- 🔒 **Authentication** – Secure login system with token-based authentication.
- 📊 **Admin Dashboard** – Centralized control panel for managing study content.
- ⚡ **Fast & Optimized** – Powered by Vue 3, Vite, and Pinia.

## 🛠️ Tech Stack
- **Frontend:** Vue 3 + Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **UI Framework:** PrimeVue 
- **API Requests:** Axios

## 🔗 API

This frontend connects to the [ThinkAPIc REST API](https://github.com/jayb2302/ThinkAPIc).

## 🚀 Getting Started
### 1. Clone the Repository
```sh
git clone https://github.com/jayb2302/ThinkAPIc-Frontend.git
cd thinkapic-frontend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure API Endpoint
Create a `.env` file and set the API URL:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

This variable is used to configure where the frontend sends requests. During development, you can use:

```
VITE_API_BASE_URL=http://localhost:4000/api
```


### 4. Run the Development Server
```sh
npm run dev
```

### 🧩 PrimeVue Setup

PrimeVue is used as the UI framework. You need to install the core library and the default theme:

```bash
npm install primevue primeicons
```

Also import the theme and base styles in `main.ts`:

```ts
import 'primevue/resources/themes/lara-light-teal/theme.css'; // or another theme
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
```

And register PrimeVue components globally:

```ts
import PrimeVue from 'primevue/config';
app.use(PrimeVue);
```

> ✅ Note: Some components like `Toast`, `Dialog`, and `ConfirmPopup` require additional setup in the component tree.

## 📁 Project Structure
```
/public                # Public assets
/src
  /assets              # Static assets
  /components
    /admin             # Admin panel components (Course, Quiz, User, Topic forms)
    /courses           # Course-related UI (cards, lists)
    /quizzes           # Quiz components
    /topics            # Topic UI components (cards, list, challenges)
    /ui                # Shared UI (login, toast, navigation)
    /users             # User-specific views (e.g., progress log)
  /helpers             # Utility functions (e.g., topic helpers)
  /layouts             # Layout wrappers (Admin, Default)
  /pages
    /admin             # Admin view pages (dashboard, management)
    /                  # Main views (Home, Courses, Topics, etc.)
  /router              # Vue Router setup
  /services            # Axios API services
  /stores              # Pinia state stores (auth, quiz, topic, etc.)
  /types               # TypeScript interfaces and types
  /utils               # Global composables and utility functions
```


