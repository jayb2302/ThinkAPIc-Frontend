import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { storeToRefs } from "pinia";

import Home from "../pages/Home.vue";
import Quizzes from "../pages/Quizzes.vue";
import Topics from "../pages/Topics.vue";
import Courses from "../pages/Courses.vue";

import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

import AdminDashboard from "../pages/admin/AdminDashboard.vue";
import AdminQuizzes from "../pages/admin/AdminQuizzes.vue";
import AdminTopics from "../pages/admin/AdminTopics.vue";
import AdminCourses from "../pages/admin/AdminCourses.vue";
import AdminUsers from "../pages/admin/AdminUsers.vue";

import Login from "../components/ui/Login.vue";
import ManageTopics from "../components/admin/ManageTopics.vue";
import ManageQuizzes from "../components/admin/ManageQuizzes.vue";
import ManageCourses from "../components/admin/ManageCourses.vue";
import ManageUsers from "../components/admin/ManageUsers.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", component: Home },
      { path: "quizzes", component: Quizzes },
      { path: "topics", component: Topics },
      { path: "courses", component: Courses },
      {
        path: "courses/:id",
        component: () => import("../pages/CourseDetails.vue"),
      },
      {
        path: "topics/:id",
        component: () => import("../pages/TopicDetails.vue"),
      },
      {
        path: '/courses/:courseId/topics/:topicId/quizzes',
        component: () => import('@/components/quizzes/TopicQuizzes.vue'),
        meta: { requiresAuth: true },
      }
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
      { path: "users", component: AdminUsers },
      { path: "manage-quizzes", component: ManageQuizzes },
      { path: "manage-topics", component: ManageTopics },
      { path: "manage-courses", component: ManageCourses },
      { path: "manage-users", component: ManageUsers },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Use Pinia safely inside router guards
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser();
  }

  const { isAuthenticated, isAdmin } = storeToRefs(authStore); 
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    console.warn("⛔ Redirecting to Login (Not Authenticated)");
    next("/");
  } else if (to.meta.requiresAdmin && !isAdmin.value) {
    console.warn("⛔ Redirecting to Home (Not Admin)");
    next("/");
  } else {
    next();
  }
});

export default router;
