import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '../pages/LoginPage.vue'
import CampaingsPage from '../pages/CampaingsPage.vue'
import CampaignPage from '../pages/CampaignPage.vue'

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
    },
    {
        path: '/campaign/:id',
        name: 'Campaign',
        component: CampaignPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router