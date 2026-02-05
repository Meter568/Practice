<script setup>
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue";
import Toogle from "../widgets/Toogle.vue";
import "../css/campaings.css"

const props = defineProps({
    url: String,
    user: Object,
    formData: Object,
    toFormData: Function,
    logout: Function
})

const data = ref({});
const loader = ref(1);
const type = ref(0);
const uid = ref(-1);

const header = ref(null);
const news = ref(null);
const copy = ref(null);

function get() {
  // Создаём FormData из текущего formData
let fd = props.toFormData(props.formData.value);

if (type.value != "") fd.append('type', type.value);

loader.value = 1;

axios.post(`${props.url}/site/getUsers?auth=${props.user.auth}`, fd)
    .then(function(response) {
    loader.value = 0;
    data.value = response.data;

    if (!props.formData.value) {
        props.formData.value = {};
    }

    if (uid.value >= 0 && uid.value < data.value.items.length) {
        props.formData.value.copy = data.value.items[uid.value].multi;
        console.log(props.formData.value.copy);
    } else {
        console.log("uid.value не соответствует индексу items:", uid.value);
    }


    })
    .catch(function(error) {
        console.log("Error get users: ", error);
    });
}

function action(){
    let fd = props.toFormData(props.formData);
    console.log("ACTION DATA:", [...fd.entries()]);
    axios.post(props.url + "/site/actionUser?auth=" + props.user.auth, fd).then(function(response){
        if(response.data.error){
            header.value.msg.alertFun(response.data.error);
            return false;
        } else {
            news.value.active = 0;
        }
        if(props.formData.id){
            header.value.msg.successFun("Successfully updated user!");
        } else {
            header.value.msg.successFun("Successfully added new user!");
        }
        get()
    }).catch(function(error){
        console.log("Error action user: ", error)
    })
}

async function del(item){
    if(await header.value.msg.confirmFun("Please confirm next action", "Do you want to delete this user?")){
        props.formData.value = item;
        let fd = props.toFormData(props.formData.value);
        axios.post(props.url + "/site/deleteUser?auth=" + props.user.auth, fd).then(function(response){
            if(response.data.error){
                header.value.msg.alertFun(response.data.error);
                return false;
            } else {
                header.value.msg.successFun("Successfully deleted user!");
                get()
            }
        }).catch(function(error){
            console.log("Error deleted user: ", error)
        })
    }
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
        props.logout()
    }
    get();
})

watch(
    () => copy.value?.active,
    (newVal) => {
        if (newVal === 0) {
            // Обеспечиваем, что formData существует
            if (!props.formData.value) {
                props.formData.value = {}
            }

            // Сбрасываем текст и select
            props.formData.value.copy = "Choose type";
            type.value = 0;
        }
    }
)


</script>

<template>
    <div class="inside-content">
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div class="btn">
                    <a class="btnS" href="#" @click.prevent="formData = {};news.active=1">New <i class="fas fa-plus"></i></a>
                </div>
                <div><Search /></div>
                <div class="">
                    <h1>Users</h1>
                </div>
            </div>
            <Popup ref="news" :title="(props.formData.value && props.formData.value.id) ? 'Edit user' : 'New user'">
                <div class="form">
                    <form @submit.prevent="action()" v-if="formData">
                        <div class="row">
                            <label>Name</label>
                            <input type="text" v-model="formData.user" required />
                        </div>
                        <div class="row">
                            <label>Phone</label>
                            <input type="text" v-model="formData.phone" required />
                        </div>
                        <div class="row">
                            <label>Email</label>
                            <input type="text" v-model="formData.email" required />
                        </div>
                        <div class="row">
                            <label>Password</label>
                            <input type="text" v-model="formData.password" />
                        </div>
                        <div class="row">
                            <button class="btn" v-if="formData && formData.id">Edit</button>
                            <button class="btn" v-if="formData && !formData.id">Add</button>
                        </div>
                    </form>
                </div>
            </Popup>
            <Popup ref="copy" :title="'Copy banner'">
                <div class="form">
                    <form v-if="props.formData.value">
                        <div class="row">
                            <label>Code</label>
                            <textarea v-model="props.formData.value.copy"></textarea>
                        </div>
                        <div class="row">
                            <label>Type</label>
                            <select v-model="type" @change="get()" required>
                                <option value="0">---</option>
                                <option v-for="c in data.types" :key="c.id" :value="c.id">{{ c.title }}</option>
                            </select>
                        </div>
                        <div class="row">
                            <button class="btn" @click.prevent="copyText(props.formData.value.copy)">Copy code</button>
                        </div>
                    </form>
                </div>
            </Popup>
            <div class="table" v-if="data.items && data.items.length">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Actions</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Name</th>
                            <th></th>
                            <th>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in data.items" :key="item.id">
                            <td class="icons-btn">
                                <a class="icon-btn" href="#" @click.prevent="del(item)">
                                    <i class="fas fa-trash-alt"></i>
                                </a>
                                <a class="icon-btn" href="#" @click.prevent="formData.copy = item.multi; uid=i; copy.active=1;">
                                    <i class="fas fa-images"></i>
                                </a>
                                <router-link class="icon-btn" :to="'/user/'+item.id">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                            </td>
                            <td>{{ item.email }}</td>
                            <td>{{ item.phone }}</td>
                            <td><router-link :to="'/user/'+item.id">{{ item.user }}</router-link></td>
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