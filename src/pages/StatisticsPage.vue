<script setup>
import axios from "axios";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue";
import Toogle from "../widgets/Toogle.vue"

const props = defineProps({
    logout: Function,
    user: Object,
    url: String,
    formData: Object,
    toFormData: Function,
})

const route = useRoute();

const data = ref({})
const date = ref("");
const date2 = ref("");
const loader = ref(1);
const type = ref(0);

const header = ref(null);
const copy = ref(null);
const img = ref(null);

function get(){
    let fd = props.toFormData(props.formData.value)
    fd.append('id', props.user.id);
    fd.append('type', 'user');
    if(date.value) fd.append('date', date.value);
    if(date2.value) fd.append('date2', date2.value);
    if(type.value) fd.append('type', type.value);
    loader.value = 1;

    axios.post(`${props.url}/site/getStatistics?auth=${props.user.auth}`, fd)
    .then(function(response){
        loader.value = 0;
        data.value = response.data;
        if(response.data.types && response.data.types[0] && !type.value) type.value = response.data.types[0].id;

        props.formData.value.copy = data.value.multi || '';
        console.log(response.data);
    })
    .catch(function(error){
        console.log(error)
    })
}

function actionStatistic(item){
    let fd = props.toFormData(item);
    fd.append('uid', props.user.id);
    console.log("ACTION DATA:", [...fd.entries()]);
    axios.post(props.url + "/site/actionStatistic?auth=" + props.user.auth, fd).then(function(response){
        if(response.data.error){
            header.value.msg.alertFun(response.data.error);
            return false;
        } else {
            // payment.value.active = 0;
        }
        if(item.id){
            header.value.msg.successFun("Successfully updated banner!");
        } else {
            header.value.msg.successFun("Successfully added new banner!");
        }
        get();
    }).catch(function(error){
        console.log("Error statistic: ", error);
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

function setMulti(item) {
    // Если item есть, берем его данные, иначе сбрасываем на "Choose type" и 0
    if (item) {
        props.formData.value.copy = item.multi || '';
        type.value = item.type || 0; // <-- добавляем type
    } else {
        props.formData.value.copy = "Choose type";
        type.value = 0;
    }

    // Активируем popup
    if (copy.value) copy.value.active = 1;
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    date.value = "";
    date2.value = "";
    get()
})

watch(
    () => copy.value?.active,
    (newVal) => {
        if (newVal === 0) {
            if (!props.formData.value) {
                props.formData.value = {}
            }
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
                    <a class="btnS" href="#" @click.prevent="setMulti(item)">
                        Multi banners
                        <i class="fas fa-images"></i>
                    </a>
                </div>
                <div>
                    <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
                </div>
                <div>
                    <h2>Statistics</h2>
                </div>
            </div>
            <Popup ref="img" title="Banner">
                <div class="banner" v-if="props.formData.value && props.formData.value.img">
                    <img :src="url + '/' + props.formData.value.img" />
                </div>
            </Popup>
            <Popup ref="copy" :title="'Copy banner'">
                <div class="form">
                    <form v-if="props.formData && props.formData.value">
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
            <div class="table" v-if="data.items!=''">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fraud clicks</th>
                            <th>Leads</th>
                            <th>Clicks</th>
                            <th>Views</th>
                            <th>Link</th>
                            <th class="image">Campaign</th>
                            <th class="image"></th>
                            <th class="id"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data.items" :key="item.id">
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
                                    {{ item.link }}
                                </td>
                                <td>
                                    {{ item.campaign_title }}
                                </td>
                                <td>
                                    <a href="#" @click.prevent="props.formData.value = item; img.active = 1;">
                                        <img :src="url+'/'+item.img" />
                                    </a>
                                </td>
                                <td>
                                    <Toogle
                                        v-model="item.published"
                                        @update:modelValue="actionStatistic(item)"
                                    />
                                </td>
                            </tr>
                    </tbody>
                </table>
            </div>
            <div class="empty" v-else>
                No statistics
            </div>
        </div>
    </div>
</template>