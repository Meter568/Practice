import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '../pages/LoginPage.vue'


const routes = [
    {
        path: '/',
        name: 'Sign in',
        component: LoginPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router