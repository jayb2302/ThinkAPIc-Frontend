import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { storeToRefs } from "pinia";
import { useModalStore } from "../stores/modalStore";

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

import ManageTopics from "../components/admin/ManageTopics.vue";
import ManageQuizzes from "../components/admin/ManageQuizzes.vue";
import ManageCourses from "../components/admin/ManageCourses.vue";
import ManageUsers from "../components/admin/ManageUsers.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "/", name: "Home",  component: Home },
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
  const modalStore = useModalStore();
  const { isAuthenticated, isAdmin } = storeToRefs(authStore);


  // Attempt to restore user from token if needed
  if (localStorage.getItem('token') && !isAuthenticated.value) {
    try {
      await authStore.fetchCurrentUser();
    } catch (e) {
      console.error('❌ Failed to fetch user during navigation:', e);
      modalStore.showLoginModal = true;
      return next({ name: 'Home' });
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    console.warn("⛔ Needs auth, opening login dialog");
    modalStore.showLoginModal = true;
    return next({ name: 'Home' }); // stay on home
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    console.warn("⛔ Needs admin, redirecting to home page");
    return next({ name: "Home" });
  }

  next();
});

export default router;
