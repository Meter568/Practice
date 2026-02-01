import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '../pages/LoginPage.vue'
import CampaingsPage from '../pages/CampaingsPage.vue'
import CampaignPage from '../pages/CampaignPage.vue'
import UsersPage from "../pages/UsersPage.vue"
import UserPage from "../pages/UserPage.vue"

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
    },
    {
        path: '/users',
        name: 'Users',
        component: UsersPage
    },
    {
        path: '/user/:id',
        name: 'User',
        component: UserPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router