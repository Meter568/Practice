<script setup>
import axios from "axios";
import { onMounted, ref, toRaw } from "vue"
import Header from "../widgets/Header.vue"
import "../css/campaings.css"

const props = defineProps({
    url: String,
    logout: Function,
    user: Object,
    formData: Object,
    toFormData: Function,
})

const data = ref({});
const date = ref("");
const date2 = ref("");
const q = ref("");
const sorts = ref("");
const loader = ref(1);
const id = ref(0);
const type = ref(0);
const all = ref(true);

const news = ref(null);
const header = ref(null);

function GetFirstAdnLastDate(){
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let firstDayOfMonth = new Date(year, month, 2);
    let lastDayOfMonth = new Date(year, month + 1, 1);

    date.value = firstDayOfMonth.toISOString().substring(0, 10);
    date2.value = lastDayOfMonth.toISOString().substring(0, 10);
}

function get(){
    const fd = props.toFormData(props.formData);
    if(date.value != "") fd.append("date", date.value);
    if(date2.value != "") fd.append("date2", date2.value);
    loader.value = 1;
    axios.post(props.url+"/site/getCampaigns?auth="+props.user.auth, fd).then(function(response){
        data.value = response.data;
        loader.value = 0;
        console.log("response.data =", response.data);
    console.log("data.value =", data.value);
    }).catch(function(error){
        console.log(error);
    })
}


function action(){
    props.formData.copy = "";
    let data = props.toFormData(props.formData);

    axios.post(props.url+"/site/actionCampaing?auth="+props.user.auth, data).then(function(response){
        news.value.active = 0;
        if(props.formData.id){
            header.value.msg.value.successFun("Successfully updated campaing!");
        } else {
            header.value.msg.value.successFun("Successfully added new campaing!");
        }
        get();
    }).catch(function(error){
        console.log(error);
    })
}

async function del(){
    if(await header.value.msg.confirmFun("Please confirm next action", "Do you want to delete this campaing?")){
        let data = props.toFormData(props.formData);

        axios.post(props.url+"/site/deleteCampaing?auth="+props.user.auth, data).then(function(response){
            header.value.msg.value.successFun("Successfully deleted campaing!");
            get();
        }).catch(function(error){
            console.log(error);
        })
    }
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    GetFirstAdnLastDate();
    get();
})

</script>

<template>
    <div class="campaings">
        <Header ref="header" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div>
                    <button class="btn">New</button>
                </div>
                <div>
                    <input type="date" v-model="date2" @change="get()" /> - <input type="date" v-model="date" @change="get()" />
                </div>
                <div class="">
                    <h1>Campaings</h1>
                </div>
            </div>
            <div class="table" v-if="data.items == '' || data.items == undefined">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Fraud clicks</th>
                            <th>Leads</th>
                            <th>Clicks</th>
                            <th>Views</th>
                            <th class="title-col">Title</th>
                            <th></th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.items" :key="item.id">
                            <td class="icon-btn">
                                <a href="#" @click.prevent="formData = item;del()">
                                    <i class="fas fa-trash-alt"></i>
                                </a>
                            </td>
                            <td>
                                <a href="#" @click.prevent="details.active=1;getDetails(item.id, 4)">
                                    <template v-if="item.fclicks">{{ item.fclicks }}</template>
                                    <template v-if="!item.fclicks">0</template>
                                </a>
                            </td>
                            <td>
                                <a href="#" @click.prevent="details.active=1;getDetails(item.id, 3)">
                                    <template v-if="item.leads">{{ item.leads }}</template>
                                    <template v-if="!item.leads">0</template>
                                </a>
                            </td>
                            <td>
                                <a href="#" @click.prevent="details.active=1;getDetails(item.id, 2)">
                                    <template v-if="item.clicks">{{ item.clicks }}</template>
                                    <template v-if="!item.clicks">0</template>
                                </a>
                            </td>
                            <td>
                                <a href="#" @click.prevent="details.active=1;getDetails(item.id, 1)">
                                    {{ item.views }}
                                </a>
                            </td>
                            <td class="title-col"><router-link :to="'/campaings/'+item.id"></router-link></td>
                            <td></td>
                            <td>{{ item.id }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="empty" v-if="data.items == '' || data.items == undefined">
                No items
            </div>
        </div>
    </div>
</template>