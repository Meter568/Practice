import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '../pages/LoginPage.vue'
import CampaingsPage from '../pages/CampaingsPage.vue'
import CampaignPage from '../pages/CampaignPage.vue'
import UsersPage from "../pages/UsersPage.vue"
import UserPage from "../pages/UserPage.vue"
import StatisticsPage from "../pages/StatisticsPage.vue"
import AdsPage from "../pages/AdsPage.vue"
import SitesPage from "../pages/SitesPage.vue"
import PaymentsPage from "../pages/PaymentsPage.vue"

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
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: StatisticsPage
    },
    {
        path: '/ads',
        name: 'Ads',
        component: AdsPage
    },
    {
        path: '/sites',
        name: 'Sites',
        component: SitesPage
    },
    {
        path: '/payments',
        name: 'Payments',
        component: PaymentsPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router