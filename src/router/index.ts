import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Quizzes from "../pages/Quizzes.vue";
import Topics from "../pages/Topics.vue";
import Login from "../pages/Login.vue";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import { useUserStore } from "../stores/userStore";
import AdminLayout from "../layouts/AdminLayout.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: Home },
      { path: "quizzes", component: Quizzes },
      { path: "topics", component: Topics },
      //   { path: 'topics/:topicId', component: TopicDetails, props: true }
    ],
  },
  { path: "/login", component: Login },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.token) {
    console.warn("⛔ Redirecting to Login (Not Authenticated)");
    next("/login");
  } else if (to.meta.requiresAdmin && userStore.role !== "admin") {
    console.warn("⛔ Redirecting to Home (Not Admin)");
    next("/");
  } else {
    next();
  }
});

export default router;
