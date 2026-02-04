<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue"

const props = defineProps({
    logout: Function,
    user: Object,
    url: String,
    formData: Object,
    toFormData: Function
})

const data = ref({});
const loader = ref(1);

const header = ref(null);
const copy = ref(null);
const news = ref(null)

function get(){
    let fd = props.toFormData(props.formData)
    fd.append('uid', props.user.id);
    fd.append('type', 'user');
    loader.value = 1;
    axios.post(props.url + "/site/getBanners?auth=" + props.user.auth, fd).then(function(response){
        loader.value = 0;
        data.value = response.data;
        console.log(data.value)
    }).catch(function(error){
        console.log(error);
    })
}

async function copyText(text){
    if(navigator && navigator.clipboard){
        await navigator.clipboard.writeText(text);
        header.value.msg.successFun("Successfully copied!");
        copy.value.active = 0;
        props.formData.value = {};
    } else {
        header.value.msg.alertFun("Use https!");
    }
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    get();
})

</script>

<template>
    <div class="inside-content">
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div></div>
                <div></div>
                <div>
                    <h1>Ads</h1>
                </div>
            </div>
            <Popup ref="copy" :title="'Copy banner'">
                <div class="form">
                    <form v-if="formData">
                        <div class="row">
                            <label>Code</label>
                            <textarea v-model="props.formData.value.copy"></textarea>
                        </div>
                        <div class="row">
                            <button class="btn" @click.prevent="copyText(props.formData.value.copy)">Copy code</button>
                        </div>
                    </form>
                </div>
            </Popup>
            <div class="table" v-if="data.items!=''">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Link</th>
                            <th class="image">Campaign</th>
                            <th class="image"></th>
                            <th class="id">#</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.items" :key="item.id">
                                <td>
                                    <a href="#" @click.prevent="props.formData.value = item; copy.active = 1;">
                                        <i class="fas fa-copy"></i>
                                    </a>
                                </td>
                                <td>
                                    <a href="#" @click.prevent="props.formData.value = item; news.active = 1;">
                                        {{ item.link }}
                                    </a>
                                </td>
                                <td>
                                    <a href="#" @click.prevent="props.formData.value = item; news.active = 1;">
                                        {{ item.campaign_title }}
                                    </a>
                                </td>
                                <td>
                                    <a href="#" @click.prevent="props.formData.value = item; news.active = 1;">
                                        <img :src="url+'/'+item.img" />
                                    </a>
                                </td>
                                <td>
                                    {{ item.id }}
                                </td>
                            </tr>
                    </tbody>
                </table>
            </div>
            <div class="empty" v-else>
                No ads
            </div>
        </div>
    </div>
</template>