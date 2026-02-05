<script setup>
import axios from "axios";
import { nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue";
import Toogle from "../widgets/Toogle.vue"
import "../css/campaings.css"
import "../css/user.css"

const props = defineProps({
    url: String,
    user: Object,
    formData: Object,
    toFormData: Function,
    page: Function,
    logout: Function
})

const route = useRoute();

const data = ref({});
const user = ref([]);
const tab = ref(0);
const tabs = ref(["Statistic", "Sites", "Payments"]);
const date = ref("");
const date2 = ref("");
const iChart = ref(-1);
const loader = ref(1);

const header = ref(null);
const news = ref(null);
const payment = ref(null);
const chart = ref(null);
const img = ref(null);

const chartCanvas = ref(null);
const chartInstance = ref(null);

function get(){
    let fd = props.toFormData(props.formData.value);
    fd.append('id', route.params.id);
    fd.append('uid', route.params.id);
    if(date.value != "") fd.append('date', date.value);
    if(date2.value != "") fd.append('date2', date2.value);
    console.log([...fd.entries()]);
    loader.value = 1;
    axios.post(props.url + "/site/getUser?auth=" + props.user.auth, fd).then(function(response){
        loader.value = 0;
        data.value = response.data;
        if(data.value.info) user.value = data.value.info;
        document.title = data.value.info.user;
    }).catch(function(error){
        console.log("Error get one user: ", error)
    })
}

function action(dataItem = props.formData.value){
    let fd = props.toFormData(dataItem);
    console.log("ACTION DATA:", [...fd.entries()]);
    axios.post(props.url + "/site/actionUser?auth=" + props.user.auth, fd).then(function(response){
        if(response.data.error){
            header.value.msg.alertFun(response.data.error);
            return false;
        } else {
            news.value.active = 0;
        }
        if(dataItem.id){
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

function actionStatistic(item){
    let fd = props.toFormData(item);
    fd.append('uid', route.params.id);
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

function actionPayment(){
    let fd = props.toFormData(props.formData.value);
    fd.append('uid', route.params.id);
    axios.post(props.url + "/site/actionPayment?auth=" + props.user.auth, fd).then(function(response){
        if(response.data.error){
            header.value.msg.alertFun(response.data.error);
            return false;
        } else {
            payment.value.active = 0;
        }
        if(props.formData.value.id){
            header.value.msg.successFun("Successfully updated payment!");
        } else {
            header.value.msg.successFun("Successfully added new payment!");
        }
        get()
    }).catch(function(error){
        console.log("Error action payment: ", error)
    })
}

async function delPayment(){
    if(await header.value.msg.confirmFun("Please confirm next action", "Do you want to delete this payment?")){
        let fd = props.toFormData(props.formData.value);
        axios.post(props.url+"/site/deletePayment?auth="+props.user.auth, fd).then(function(response){
            if(response.data.error){
                header.value.msg.alertFun(response.data.error)
                return false;
            } else {
                header.value.msg.successFun("Successfully deleted payment!");
                get();
            }
        }).catch(function(error){
            console.log("Error delete add: ", error)
        })
    }
}

function actionSite(item) {
    if (!item) return;

    let fd = props.toFormData(item);

    console.log("ACTION DATA:", [...fd.entries()]);

    axios.post(props.url + "/site/actionSite?auth=" + props.user.auth, fd)
        .then(function(response){
            news.value.active = 0

            if(item.id){
                header.value.msg.successFun("Successfully updated site!");
            } else {
                header.value.msg.successFun("Successfully added new site!");
            }

            get();
        })
        .catch(function(error){
            console.log("Error action site: ", error)
        })
}

function line(item) {
    requestAnimationFrame(() => {
        const canvas = chartCanvas.value;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            setTimeout(() => line(item), 50);
            return;
        }

        if (!chartCanvas.value) return;

        if (chartInstance.value) chartInstance.value.destroy();

        const dates = [];
        const clicks = [];
        const views = [];
        const leads = [];

        let start, end;

        // END = вчера
        if (date2.value) {
            end = new Date(date2.value);
        } else {
            end = new Date();
            end.setDate(end.getDate() - 1);
            date2.value = end.toISOString().slice(0, 10);
        }

        // START = 7 дней назад
        if (date.value) {
            start = new Date(date.value);
        } else {
            start = new Date(end);
            start.setDate(start.getDate() - 7);
            date.value = start.toISOString().slice(0, 10);
        }

        // защита
        if (isNaN(start) || isNaN(end) || start > end) return;


        if (!start || !end || isNaN(start) || isNaN(end) || start > end) {
            console.warn("Invalid date range", date.value, date2.value);
            return;
        }

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            const key = `${day}.${month}.${year}`;
            dates.push(key);
                if (item.line?.[key]) {
                    clicks.push(+item.line[key].clicks || 0);
                    views.push(+item.line[key].views || 0);
                    leads.push(+item.line[key].leads || 0);
                } else {
                    clicks.push(0);
                    views.push(0);
                    leads.push(0);
                }
            }
        console.log("DATES:", dates);
        console.log("CLICKS:", clicks);
        console.log("LINE:", item.line);

        const verticalLines = {
            id: 'verticalLines',
            afterDraw(chart) {
                const ctx = chart?.ctx;
                const scales = chart?.scales;

                if (!ctx || !scales?.x || !scales?.y) return;

                const xScale = scales.x;
                const yTop = scales.y.top;
                const yBottom = scales.y.bottom;

                ctx.save();
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);

                chart.data.labels.forEach((_, index) => {
                    const x = xScale.getPixelForValue(index);
                    if (x == null) return;

                    ctx.beginPath();
                    ctx.moveTo(x, yTop);
                    ctx.lineTo(x, yBottom);
                    ctx.stroke();
                });

                ctx.restore();
            }
        };

        chartInstance.value = new Chart(chartCanvas.value.getContext("2d"), {
            type: "line",
            data: {
                labels: dates,
                datasets: [
                    {
                        label: "Clicks",
                        data: clicks,
                        borderColor: "#00599D",
                        backgroundColor: "#00599D",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3
                    },
                    {
                        label: "Views",
                        data: views,
                        borderColor: "#5000B8",
                        backgroundColor: "#5000B8",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 3,
                        yAxisID: "y2"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        bodyFont: { size: 14 },
                        usePointStyle: true,
                        callbacks: {
                            title: (ctx) => ctx[0].dataset.label
                        }
                    },
                    legend: { display: true }
                },
                scales: {
                    x: {
                        type: "category",
                        ticks: {
                            autoSkip: true,
                            maxRotation: 45,
                            minRotation: 45,
                            maxTicksLimit: 7,
                            callback(value) {
                                return this.getLabelForValue(value);
                            }
                        },
                        grid: {
                            drawTicks: false,
                            drawOnChartArea: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawTicks: true,
                            color: ctx => ctx.tick.value === 0 ? "#000" : "#ddd",
                            lineWidth: ctx => ctx.tick.value === 0 ? 2 : 1
                        }
                    },
                    y2: {
                        beginAtZero: true,
                        position: "right",
                        grid: { drawOnChartArea: false }
                    }
                }
            },
            plugins: [verticalLines]
        });
    });
}

function editUser(info) {
    props.formData.value = info;
    news.value.active = 1;
}

function openChart(item, index) { 
    props.formData.value = item;
    iChart.value = index;

    if (!item.sites) item.sites = [];

    chart.value.active = 1;

    nextTick(() => {
        setTimeout(() => line(item), 100);
    });
}

function addPayment() {
    props.formData.value = {};
    payment.value.active = 1;
}

function editPayment(item) {
    props.formData.value = item;
    payment.value.active = 1;
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    if(!route.params.id) props.page('/users');
    date.value = "2024-10-01";
    date2.value = "";
    get()
})

</script>

<template>
    <div class="inside-content">
        <Header ref="header" :url="url" :user="user" :logout="logout"  />
        <div id='spinner' v-if="loader"></div>
        <div class="panelTop">
            <div class="wrapper" style="padding: 1px 0;">
                <div class="panel">
                    <div class="edit">
                        <a class="btnS" href="#" @click.prevent="editUser(data.info)">Edit user <i class="fas fa-edit"></i></a>
                    </div>
                    <div></div>
                    <div>
                        <h1 v-if="data && data.info">{{ data.info.user }}</h1>
                    </div>
                </div>
                <div class="panel" v-if="data && data.info">
                    <div>
                        <p><b>Email:</b> {{ data.info.email }}</p>
                    </div>
                    <div>
                        <p><b>Phone:</b> {{ data.info.phone }}</p>
                    </div>
                </div>
                <div class="tabs">
                    <ul v-if="tabs">
                        <li v-for="(t, i) in tabs" :class="{active:tab==i}" @click="tab=i" :key="t.id">{{ t }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="wrapper">
            <Popup ref="news" :title="(props.formData.value && props.formData.value.id) ? 'Edit user' : 'New user'">
                <div class="form">
                    <form @submit.prevent="action()" v-if="props.formData.value">
                        <div class="row">
                            <label>Name</label>
                            <input type="text" v-model="props.formData.value.user" required />
                        </div>
                        <div class="row">
                            <label>Phone</label>
                            <input type="text" v-model="props.formData.value.phone" required />
                        </div>
                        <div class="row">
                            <label>Email</label>
                            <input type="text" v-model="props.formData.value.email" required />
                        </div>
                        <div class="row">
                            <label>Password</label>
                            <input type="text" v-model="props.formData.value.password" />
                        </div>
                        <div class="row">
                            <button
                                class="btn"
                                v-if="props.formData.value.id != null"
                            >
                                Edit
                            </button>
                            <button class="btn" v-else>
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </Popup>
            <div v-if="tab==0">
                <div class="panel">
                    <div>

                    </div>
                    <div>
                        <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
                    </div>
                    <div class="">
                        <h1>{{ tabs[tab] }}</h1>
                    </div>
                </div>
                <Popup ref="img" title="Banner">
                    <div class="banner" v-if="props.formData.value && props.formData.value.img">
                        <img :src="url + '/' + props.formData.value.img" />
                    </div>
                </Popup>
                <div class="table" v-if="data.statistics!=''">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fraud clicks</th>
                                <th>Leads</th>
                                <th>Clicks</th>
                                <th>Views</th>
                                <th>Link</th>
                                <th>Size</th>
                                <th class="image">Campaign</th>
                                <th class="image"></th>
                                <th class="id"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.statistics" :key="item.id">
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
                                    {{ item.size }}
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
                <div class="empty" v-if="data.statistics==''">
                    No statistics
                </div>
            </div>
            <div v-if="tab==1">
                <div class="panel">
                    <div>
                        
                    </div>
                    <div>
                        <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
                    </div>
                    <div class="">
                        <h1>{{ tabs[tab] }}</h1>
                    </div>
                </div>
                <Popup ref="chart" fullscreen="true" title="Chart">
                    <template v-if="data?.items && iChart >= 0 && data.items[iChart]">
                        <div class="chart_panel">
                            <div class="cubes">
                                <div class="ctr">
                                    <div>CTR</div>
                                    <div class="number">
                                        % {{
                                            data.items[iChart].views
                                                ? ((Number(data.items[iChart].clicks) * 100) / Number(data.items[iChart].views)).toFixed(2)
                                                : 0
                                        }}
                                    </div>
                                </div>

                                <div class="leads">
                                    <div>Leads</div>
                                    <div class="number">{{ data.items[iChart].leads ?? 0 }}</div>
                                </div>

                                <div class="views">
                                    <div>Views</div>
                                    <div class="number">{{ data.items[iChart].views ?? 0 }}</div>
                                </div>

                                <div class="clicks">
                                    <div>Clicks</div>
                                    <div class="number">{{ data.items[iChart].clicks ?? 0 }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="chart_body">
                            <canvas ref="chartCanvas"></canvas>
                        </div>
                    </template>
                    <template v-else>
                        <div class="empty">No data</div>
                    </template>
                </Popup>
                <div class="table" v-if="data.sites!=''">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Fraud clicks</th>
                                <th>Leads</th>
                                <th>Clicks</th>
                                <th>Views</th>
                                <th>Site</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, i) in data.sites" :key="item.id">
                                <td class="icons-btn">
                                    <a class="icon-btn" href="#" @click.prevent="openChart(item, i)">
                                        <i class="fas fa-chart-bar"></i>
                                    </a>
                                </td>
                                <td>
                                    <template v-if="item.fclicks">{{ item.fclicks }}</template>
                                    <template v-if="!item.fclicks">0</template>
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
                                <td class="image">
                                    {{ item.site }}
                                </td>
                                <td class="image">
                                    <Toogle
                                        v-model="item.published"
                                        @update:modelValue="actionSite(item)"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="empty" v-if="data.sites==''">
                    No sites
                </div>
            </div>
            <div v-if="tab==2">
                <div class="panel">
                    <div class="btn">
                        <a class="btnS" href="#" @click.prevent="addPayment()">Add payment <i class="fas fa-plus"></i></a>
                    </div>
                    <div>
                        
                    </div>
                    <div class="">
                        <h1>{{ tabs[tab] }}</h1>
                    </div>
                </div>
                <Popup ref="payment" :title="(props.formData.value && props.formData.value.id != null) ? 'Edit payment' : 'New payment'">
                    <div class="form">
                        <form @submit.prevent="actionPayment()" v-if="props.formData.value !== null || payment.value.active">
                            <div class="row">
                                <label>Value</label>
                                <input type="text" v-model="props.formData.value.value" required />
                            </div>
                            <div class="row">
                                <label>Date</label>
                                <input type="date" v-model="props.formData.value.date" required />
                            </div>
                            <div class="row">
                                <label>Description</label>
                                <input type="text" v-model="props.formData.value.description" required />
                            </div>
                            <div class="row">
                                <button class="btn" v-if="props.formData.value && props.formData.value.id != null">Edit</button>
                                <button class="btn" v-else>Add</button>
                            </div>
                        </form>
                    </div>
                </Popup>
                <div class="table" v-if="data.payments!=''">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Value</th>
                                <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in data.payments" :key="item.id">
                                <td class="icons-btn">
                                    <a class="icon-btn" href="#" @click.prevent="editPayment(item)">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a class="icon-btn" href="#" @click.prevent="props.formData.value = item; delPayment()">
                                        <i class="fas fa-trash-alt"></i>
                                    </a>
                                </td>
                                <td>
                                    {{ item.description }}
                                </td>
                                <td>
                                    <a href="#" @click.prevent="formData = item; payment.active = 1;">
                                        {{ item.date_title }}
                                    </a>
                                </td>
                                <td>
                                    <a href="#" @click.prevent="formData = item; payment.active = 1;">
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
                <div class="empty" v-if="data.payments==''">
                    No payments
                </div>
            </div>
        </div>
    </div>
</template>