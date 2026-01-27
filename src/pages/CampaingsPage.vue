<script setup>
import axios from "axios";
import { onMounted, reactive, ref, toRaw } from "vue"
import Header from "../widgets/Header.vue"
import Toogle from "../widgets/Toogle.vue"
import Popup from "../widgets/Popup.vue"
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
    const fd = props.toFormData(props.formData.value);
    if(date.value != "") fd.append("date", date.value);
    if(date2.value != "") fd.append("date2", date2.value);
    loader.value = 1;
    // axios.post(
    //     props.url + "/site/getCampaigns?auth=" + props.user.auth, 
    //     fd
    // ).then(response => {
    //     data.value = response.data;
    //     loader.value = 0;
    //     console.log(response.data);
    //     console.log(data.value)
    // }).catch(function(error){
    //     console.log(error);
    // })
    axios.get(
        props.url + "/site/getCampaigns",
        {
            params: {
            auth: props.user.auth
            }
        }
    ).then(response => {
        data.value = response.data;
        loader.value = 0;
        console.log(response.data);
        console.log(data.value)
    }).catch(error => {
        console.log(error);
    });
}

function action(dataItem = props.formData) {
    dataItem.copy ??= "";
    let data = props.toFormData(dataItem);
    console.log("ACTION DATA:", [...data.entries()]); // должно показывать все поля
    axios.post(
        props.url + "/site/actionCampaign?auth=" + props.user.auth,
        data
    ).then(() => {
        news.value.active = 0;
        header.value.msg.successFun(
            dataItem.id
                ? "Successfully updated campaign!"
                : "Successfully added new campaign!"
        );
        get();
    }).catch(console.error);
}

async function del(item){
    if(await header.value.msg.confirmFun("Please confirm next action", "Do you want to delete this campaign?")){
        props.formData.value = item;
        let data = props.toFormData(props.formData.value);
        console.log("DELETE DATA:", [...data.entries()]);
        axios.post(
            props.url + "/site/deleteCampaign?auth=" + props.user.auth, 
            data
        ).then(function(response){
            if(response.data.error){
                header.value.msg.alertFun(response.data.error);
            } else {
                header.value.msg.successFun("Successfully deleted campaign!");
                get();
            }
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
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div>
                    <a class="btnS" href="#" @click.prevent="formData = {};news.active=1">New <i class="fas fa-plus"></i></a>
                </div>
                <div>
                    <input type="date" v-model="date2" @change="get()" /> - <input type="date" v-model="date" @change="get()" />
                </div>
                <div class="">
                    <h1>Campaings</h1>
                </div>
            </div>
            <Popup ref="news" :title="(formData && formData.id) ? 'Edit campaign' : 'New campaign'">
                <div class="form">
                    <form @submit.prevent="action()" v-if="formData">
                        <div class="row">
                            <label>Name</label>
                            <input type="text" v-model="formData.title" required />
                        </div>
                        <div class="row">
                            <button class="btn" v-if="formData && formData.id">Edit</button>
                            <button class="btn" v-if="formData && !formData.id">Add</button>
                        </div>
                    </form>
                </div>
            </Popup>
            <div class="table" v-if="data.items && data.items.length">
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
                                <a href="#" @click.prevent="del(item)">
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
                            <td class="title-col"><router-link :to="'/campaign/'+item.id">{{ item.title }}</router-link></td>
                            <td>
                                <Toogle
                                    v-model="item.published"
                                    @update:modelValue="action(item)"
                                />
                            </td>
                            <td>{{ item.id }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="empty" v-else>
                No items
            </div>
        </div>
    </div>
</template>