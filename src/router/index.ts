import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia"; 

import Home from "../pages/Home.vue";
import Quizzes from "../pages/Quizzes.vue";
import Topics from "../pages/Topics.vue";
import Login from "../pages/Login.vue";

import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

import AdminDashboard from "../pages/admin/AdminDashboard.vue";
import AdminQuizzes from "../pages/admin/AdminQuizzes.vue";
import AdminTopics from "../pages/admin/AdminTopics.vue";
import AdminCourses from "../pages/admin/AdminCourses.vue";

import ManageTopics from "../components/admin/ManageTopics.vue";
import ManageQuizzes from "../components/admin/ManageQuizzes.vue";
import ManageCourses from "../components/admin/ManageCourses.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: Home },
      { path: "quizzes", component: Quizzes },
      { path: "topics", component: Topics },
    ],
  },
  { path: "/login", component: Login },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", component: AdminDashboard },
      { path: "quizzes", component: AdminQuizzes },
      { path: "topics", component: AdminTopics },
      { path: "courses", component: AdminCourses },
      { path: "manage-quizzes", component: ManageQuizzes },
      { path: "manage-topics", component: ManageTopics },
      { path: "manage-courses", component: ManageCourses },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Use Pinia safely inside router guards
router.beforeEach((to, _, next) => {
  const userStore = useUserStore();
  const { token, role } = storeToRefs(userStore);

  if (to.meta.requiresAuth && !token.value) {
    console.warn("⛔ Redirecting to Login (Not Authenticated)");
    next("/login");
  } else if (to.meta.requiresAdmin && role.value !== "admin") {
    console.warn("⛔ Redirecting to Home (Not Admin)");
    next("/");
  } else {
    next();
  }
});

export default router;