<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import Msg from "./Msg.vue";
import "../css/header.css"

const props = defineProps({
    url: String,
    user: Object,
    logout: Function
})

const route = useRoute();

const active = ref(0);
const menu = ref(false);

const msg = ref(null);

function toogleActive(){
    if(active.value == 1){
        active.value = 0;
    } else {
        active.value = 1;
    }
}

defineExpose({
    msg
})

</script>

<template>
    <header class="header">
        <div class="wrapper-header">
            <div class="user-top" id="user-top" v-if="props.user && props.user.user">
                <i @click="toogleActive()" class="fas fa-caret-down icon"></i>
                <div id="user-circle" @click="toogleActive()">{{ props.user.user[0] }}</div>
                <div id="user-info" :class="{active:active==1}">
                    <a href="#" @click.prevent="props.logout();">{{ props.user.user }} Log out <i class="fas fa-sign-out-alt"></i></a>
                </div>
            </div>
            <div id="menu">
                <i id="mobile-menu" class="fas fa-bars" @click="menu = true"></i>
                <ul class="mobile-nav" :class="{ active: menu }">
                    <!-- ADMIN -->
                    <template v-if="props.user?.type === 'admin'">
                        <li class="close">
                            <i class="fas fa-times" @click="menu = false"></i>
                        </li>
                        <li>
                            <router-link
                                to="/campaings"
                                @click="menu = false"
                                :class="{ 'router-link-active': route.path.includes('campaing') }"
                            >
                                Campaings <i class="fas fa-bullhorn"></i>
                            </router-link>
                        </li>
                        <li>
                            <router-link
                                to="/users"
                                @click="menu = false"
                                :class="{ 'router-link-active': route.path.includes('user') }"
                            >
                                Users <i class="fas fa-users"></i>
                            </router-link>
                        </li>
                    </template>
                    <!-- USER -->
                    <template v-else>
                        <li class="close">
                            <i class="fas fa-times" @click="menu = false"></i>
                        </li>
                        <li>
                            <router-link to="/statistics" @click="menu=false">
                                Statistics <i class="fas fa-chart-area"></i>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/ads" @click="menu=false">
                                Ads <i class="fas fa-image"></i>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/sites" @click="menu=false">
                                Sites <i class="fab fa-chrome"></i>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/payments" @click="menu=false">
                                Payments <i class="fas fa-credit-card"></i>
                            </router-link>
                        </li>
                    </template>
                    </ul>
                </div>
            <div class="logo">
                <img :src="props.url+'/app/views/images/logo.svg'" alt="Logo">
            </div>
        </div>
        <Msg ref="msg" />
    </header>
</template>