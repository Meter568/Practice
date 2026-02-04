<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue";
import Toogle from "../widgets/Toogle.vue";

const props = defineProps({
    logout: Function,
    user: Object,
    url: String,
    toFormData: Function,
    formData: Object
})

const data = ref({});
const date = ref("");
const date2 = ref("");
const loader = ref(1);

const header = ref(null);

function get(){
    let fd = props.toFormData(props.formData.value);
    fd.append('id', props.user.id);
    fd.append('uid', props.user.id);
    if(date.value != "") fd.append('date', date.value);
    if(date2.value != "") fd.append('date2', date2.value);
    console.log([...fd.entries()]);
    loader.value = 1;
    axios.post(props.url + "/site/getUser?auth=" + props.user.auth, fd).then(function(response){
        loader.value = 0;
        data.value = response.data;
        if(data.value.info) props.user.value = data.value.info;
        document.title = data.value.info.user;
    }).catch(function(error){
        console.log("Error get one user: ", error)
    })
}

function action(){
    let fd = props.toFormData(props.formData);
    axios.post(props.url + "/site/actionSite?auth=" + props.user.auth, fd).then(function(response){
        if(props.formData.value.id){
            header.value.msg.successFun("Successfully updated site!");
        } else {
            header.value.msg.successFun("Successfully added new site!");
        }
        get()
    }).catch(function(error){
        console.log(error);
    })
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    date.value = "";
    date2.value = "";
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
                    <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
                </div>
                <div>
                    <h1>Sites</h1>
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
            <div class="table" v-if="data.sites!=''">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fraud clicks</th>
                            <th>Leads</th>
                            <th>Clicks</th>
                            <th>Views</th>
                            <th class="image">Site</th>
                            <th class="id"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.sites" :key="item.id">
                            <td>
                                <a href="#">
                                    <template v-if="item.fclicks">{{ item.fclicks }}</template>
                                    <template v-if="!item.fclicks">0</template>
                                </a>
                            </td>
                            <td>
                                <template v-if="item.leads">{{ item.leads }}</template>
                                <template v-if="!item.leads">0</template>
                            </td>
                            <td>
                                <template v-if="item.clicks">{{ item.clicks }}</template>
                                <template v-if="!item.clicks">0</template>
                            </td>
                            <td>
                                {{ item.views }}
                            </td>
                            <td>
                                {{ item.site }}
                            </td>
                            <td>
                                <Toogle
                                    v-model="item.published"
                                    @update:modelValue="val => {
                                        item.published = val
                                        props.formData.value = { ...item }
                                        action()
                                    }"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="empty" v-else>
                No sites
            </div>
        </div>
    </div>
</template>