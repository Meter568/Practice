<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import Msg from "../widgets/Msg.vue";
import "../css/login.css"

const props = defineProps({
    url: String,
    setUser: Function,
    formData: Object,
    page: Function,
    toFormData: Function
})

const img = ref(1);

const msg = ref(null);

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function login() {
    let data = props.toFormData(props.formData);

    axios.post(props.url+"/site/login", data).then(function(response){
        if(response.data.error){
            msg.value.alertFun(response.data.error);
        }
        if(response.data.user){
            props.user = response.data.user;
            props.page('/campaings');
            window.localStorage.setItem('user', JSON.stringify(response.data.user));
        }
    }).catch(function(error){
        console.log(error);
    })
}

onMounted(() => {
    img.value = randomIntFromInterval(1,7);
})

</script>

<template>
    <div class="login">
        <Msg ref="msg" />
        <div class="right-area">
            <img :src="url+'/app/views/images/Cover_'+img+'.jpg'" alt="Login Image">
        </div>
        <div class="left-area">
            <div class="header">
                <div class="wrapper">
                    <div class="ar">
                        <h1>Affiliate Sign in</h1>
                    </div>
                    <div class="logo">
                        <img :src="url+'/app/views/images/logo.svg'" alt="Logo">
                    </div>
                </div>
            </div>
            <div class="form">
                <form @submit.prevent="login()" v-if="formData" class="form-login">
                    <div class="row">
                        <label>Email</label>
                        <input type="email" v-model="formData.email" required />
                    </div>
                    <div class="row">
                        <label>Password</label>
                        <input type="password" v-model="formData.password" required autocomplete="on" />
                    </div>
                    <div class="row">
                        <button class="btn">Sign in</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>