<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import Header from "../widgets/Header.vue";

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
const payment = ref(null);

function get(){
    let fd = props.toFormData(props.formData.value);
    fd.append('id', props.user.id);
    loader.value = 1;
    axios.post(props.url + "/site/getPayments?auth=" + props.user.auth, fd).then(function(response){
        loader.value = 0;
        data.value = response.data;
        console.log(response.data);
    }).catch(function (error){
        console.log(error);
    })
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    get()
})

</script>

<template>
    <div class="inside-content">
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div>
                
                </div>
                <div>
                    
                </div>
                <div>
                    <h1>Payments</h1>
                </div>
            </div>
            <div class="table" v-if="data.items!=''">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Date</th>
                            <th class="id">Value</th>
                            <th class="id">#</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.items" :key="item.id">
                            <td>
                                {{ item.description }}
                            </td>
                            <td>
                                <a href="#" @click.prevent="formData = item; payment.active=1;">
                                    {{ item.date_title }}
                                </a>
                            </td>
                            <td>
                                <a href="#" @click.prevent="formData = item; payment.active=1;">
                                    {{ item.value }}
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
                No payments
            </div>
        </div>
    </div>
</template>