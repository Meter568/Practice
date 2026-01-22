import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '../pages/LoginPage.vue'
import CampaingsPage from '../pages/CampaingsPage.vue'

const routes = [
    {
        path: '/',
        name: 'Sign in',
        component: LoginPage
    },
    {
        path: '/campaings',
        name: 'Campaings',
        component: CampaingsPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router