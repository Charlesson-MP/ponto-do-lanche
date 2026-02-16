import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MenuView from '../pages/MenuView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../pages/HomeView.vue')
    },
    {
        path: '/menu',
        component: MenuView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;