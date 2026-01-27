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
const menu = ref(0);

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
                <!-- <i class="fas fa-bars" @click="menu==1"></i> -->
                <ul :class="{active:menu==1}" v-if="props.user && props.user.type && props.user.type=='admin'">
                    <li v-if="menu==1"><i class="fas fa-times" @click="menu==0"></i></li>
                    <li><router-link :class="{ 'router-link-active': route.path.includes('user') }" to="/users">Users <i class="fas fa-users"></i></router-link></li>
                    <li><router-link :class="{ 'router-link-active': route.path.includes('campaing') }" to="/campaings">Campaings <i class="fas fa-bullhorn"></i></router-link></li>
                </ul>
                <ul :class="{active:menu==1}" v-if="props.user && props.user.type && props.user.type!='admin'">
                    <li v-if="menu==1"><i class="fas fa-times" @click="menu=0"></i></li>
                    <li><router-link to="/statistics">Statistics <i class="fas fa-chart-area"></i></router-link></li>
                    <li><router-link to="/ads">Ads <i class="fas fa-image"></i></router-link></li>
                    <li><router-link to="/sites">Sites <i class="fab fa-chrome"></i></router-link></li>
                    <li><router-link to="/payments">Payments <i class="fas fa-credit-card"></i></router-link></li>
                </ul>
            </div>
            <div class="logo">
                <img :src="props.url+'/app/views/images/logo.svg'" alt="Logo">
            </div>
        </div>
        <Msg ref="msg" />
    </header>
</template>