<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Header from "../widgets/Header.vue";
import Popup from "../widgets/Popup.vue";
import Toogle from "../widgets/Toogle.vue"
import Image from "../widgets/Image.vue"
import axios from "axios";
import "../css/campaings.css"

import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    scales
} from 'chart.js'

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
)

const props = defineProps({
    url: String,
    user: Object,
    logout: Function,
    formData: Object,
    toFormData: Function
})

const route = useRoute();

const data = ref({});
const details = ref({});
const date = ref("");
const date2 = ref("");
const q = ref("");
const sort = ref("");
const loader = ref(0);
const iChart = ref(-1);
const id = ref(0);
const type = ref(0);
const all = ref("true");

const header = ref(null);
const news = ref(null);
const ad = ref(null);
const chart = ref(null);

const chartCanvas = ref(null);
const chartInstance = ref(null);

function GetFirstAdnLastDate(){
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    let firstDayOfMonth = new Date(year, month, 2);
    let lastDayOfMonth = new Date(year, month + 1, 1);

    date.value = firstDayOfMonth.toISOString().substring(0, 10);
    date2.value = lastDayOfMonth.toISOString().substring(0, 10);
}

function get() {
    const fd = new FormData();
    fd.append("id", route.params.id);
    if(date.value) fd.append("date", date.value);
    if(date2.value) fd.append("date2", date2.value);
    loader.value = 1;
    axios.post(props.url + "/site/getBanners?auth=" + props.user.auth, fd)
        .then(response => {
            loader.value = 0;
            data.value = response.data;
            document.title = data.value.info?.title || "Campaign";
            if(iChart.value !== -1 && data.value.items[iChart.value]) {
                line(data.value.items[iChart.value]);
            }
            console.log("Loaded banners:", data.value);
        })
        .catch(error => {
            loader.value = 0;
            console.error(error);
        });
}

function calcTotalsFromLine(line) {
    let views = 0;
    let clicks = 0;
    let leads = 0;

    if (!line) return { views: 0, clicks: 0, leads: 0 };

    Object.values(line).forEach(d => {
        views += Number(d.views) || 0;
        clicks += Number(d.clicks) || 0;
        leads += Number(d.leads) || 0;
    });

    return { views, clicks, leads };
}

function getCampaignBannersChart() {
    const fd = props.toFormData(props.formData.value);
    if (date.value)  fd.append('date', date.value);
    if (date2.value) fd.append('date2', date2.value);
    if (q.value)     fd.append('q', q.value);
    if (sort.value)  fd.append('sort', sort.value);
    loader.value = 1;
    axios
        .post(props.url + "/site/getCampaignBannersChart?auth=" + props.user.auth, fd)
        .then(res => {
            const item = res.data.items;
            const totals = calcTotalsFromLine(item.line)
            props.formData.value.views  = totals.views;
            props.formData.value.clicks = totals.clicks;
            props.formData.value.leads  = totals.leads;

            props.formData.value.line  = item.line;
            props.formData.value.sites = item.sites;
            console.log("SEND", props.formData.value.sites);

            line(item)
        })
        .finally(() => loader.value = 0)
        .catch(console.error);
}

function getDetails(bid = null, type = null) {
    details.value = {};

    const fd = props.toFormData(props.formData.value);

    if (date.value) fd.append("date", date.value);
    if (date2.value) fd.append("date2", date2.value);
    if (q.value) fd.append("q", q.value);
    if (sort.value) fd.append("sort", sort.value);
    if (bid) fd.append("bid", bid);
    if (type) fd.append("type", type);

    loader.value = 1;

    axios.post(
        props.url + "/site/getBannerDetails?auth=" + props.user.auth,
        fd
    ).then(res => {
        loader.value = 0;
        details.value = res.data;
    }).catch(console.error);
}

function action(dataItem = props.formData.value) {
    let data = props.toFormData(dataItem);
    console.log("ACTION DATA:", [...data.entries()]);
    axios.post(
        props.url + "/site/actionCampaign?auth=" + props.user.auth,
        data
    ).then((response) => {
        news.value.active = 0;
        if(response.data.error){
            header.value.msg.alertFun(response.data.error);
        } else if (dataItem.id){  // <-- проверяем правильное поле
            header.value.msg.successFun("Successfully updated campaign!");
        } else {
            header.value.msg.successFun("Successfully added new campaign!");
        }
        get();
    }).catch(console.error);
}

function actionAd(dataItem = props.formData.value) {
    let fd = props.toFormData(dataItem);
    fd.append('campaign', route.params.id); // прикрепляем кампанию
    console.log("ACTION DATA:", [...fd.entries()]);

    axios.post(props.url+"/site/actionBanner?auth="+props.user.auth, fd)
        .then(response => {
            ad.value.active = 0;
            if(response.data.error){
                header.value.msg.alertFun(response.data.error);
            } else {
                header.value.msg.successFun(
                    dataItem.id ? "Successfully updated banner!" : "Successfully added new banner!"
                );
                get(); // обновляем список баннеров
            }
        })
        .catch(console.error);
}

async function delAd(item){
    if(await header.value.msg.confirmFun("Please confirm next action", "Do you want to delete this banner?")){
        props.formData.value = item;
        let data = props.toFormData(props.formData.value);
        console.log("DELETE DATA:", [...data.entries()]);
        axios.post(
            props.url + "/site/deleteBanner?auth=" + props.user.auth, 
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

function checkAll(val) {
    const item = data.value.items?.[iChart.value];
    if (!item || !item.sites) return;

    item.sites.forEach(s => {
        s.include = val;
    });

    all.value = val;
}

function onSiteToggle() {
    const item = data.value.items?.[iChart.value];
    if (!item || !item.sites) return;

    all.value = getAllValue(item);
}

function getAllValue(item) {
    return item.sites.every(s => s.include === "true") ? "true" : "false";
}

function openChart(item, index) { 
    props.formData.value = item;
    iChart.value = index;

    if (!item.sites) item.sites = [];

    all.value = item.sites.length > 0 ? getAllValue(item) : "true";

    chart.value.active = 1;

    nextTick(() => {
        setTimeout(() => line(item), 100);
    });
}

function editCampaign(info) {
    props.formData.value = info;
    news.value.active = 1;
}

function newBanner() {
    props.formData.value = {
        link: "",
        description: "",
        type: 0,
        img: ""
    };
    ad.value.active = 1;
}

function editBanner(item) {
    props.formData.value = { ...item };
    ad.value.active = 1;
}

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    get();
})

watch([date, date2], async () => {
    if (!chart.value || chart.value.active !== 1) return;

    await nextTick();
    getCampaignBannersChart();
});

watch(() => chart.value?.active, (active) => {
    if (!active && chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
        date.value = "";
        date2.value = "";
        get()
    }
});

</script>

<template>
    <div class="inside-content">
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="panelTop">
            <div class="wrapper">
                <div class="panelAnother">
                    <div class="edit">
                        <a class="btnS" href="#" @click.prevent="editCampaign(data.info)">Edit campaign <i class="fas fa-edit"></i></a>
                    </div>
                    <div></div>
                    <div>
                        <h1 v-if="data && data.info">{{ data.info.title }}</h1>
                    </div>
                </div>
            </div>
        </div>
        <Popup ref="chart" fullscreen="true" title="Chart">
                <div class="chart_panel">
                    <div class="chart_al">
                        <div class="cubes">
                            <div class="ctr">
                                <div>CTR</div>
                                <div class="number">% {{ (Number(data.items[iChart].clicks)*100/Number(data.items[iChart].views)).toFixed(2) }}</div>
                            </div>
                            <div class="leads">
                                <div>Leads</div>
                                <div class="number">{{ data.items[iChart].leads }}</div>
                            </div>
                            <div class="views">
                                <div>Views</div>
                                <div class="number">{{ data.items[iChart].views }}</div>
                            </div>
                            <div class="clicks">
                                <div>Clicks</div>
                                <div class="number">{{ data.items[iChart].clicks }}</div>
                            </div>
                        </div>
                    </div>
                    <div><input type="date" v-model="date2" /> - <input type="date" v-model="date" /></div>
                </div>
                <div class="chart_body">
                    <div id="chartOuter">
                        <div id="chartHints">
                            <div class="chartHintsViews">Views</div>
                            <div class="chartHintsClicks">Clicks</div>
                        </div>
                            <canvas ref="chartCanvas"></canvas>
                    </div>
                    <div class="filchart">
                        <div class="itemchart" v-show="data.items[iChart]?.sites?.length">
                            All
                            <Toogle v-model="all" @update:modelValue="checkAll" />
                        </div>
                        <div v-if="data.items[iChart]?.sites?.length">
                            <div 
                                class="itemchart" 
                                v-for="s in data.items[iChart].sites.filter(s => s.site !== null && s.site !== '')" 
                                :key="s.id"
                            >
                                <div>
                                {{ s.site }}
                                </div>
                                <Toogle
                                v-model="s.include"
                                @update:modelValue="onSiteToggle"
                                />
                            </div>
                        </div>
                    </div>
                </div>
        </Popup>
        <Popup ref="news" :title="(props.formData.value && props.formData.value.id != null) ? 'Edit campaign' : 'New campaign'">
            <div class="form">
                <form @submit.prevent="action()" v-if="props.formData.value">
                    <div class="row">
                        <label>Name</label>
                        <input type="text" v-model="props.formData.value.title" required />
                    </div>
                    <div class="row">
                        <button class="btn" v-if="props.formData.value && props.formData.value.id != null">Edit</button>
                        <button class="btn" v-else>Add</button>
                    </div>
                </form>
            </div>
        </Popup>
    </div>
    <div class="wrapper">
        <div class="panel">
            <div class="btn">
                <a class="btnS" href="#" @click.prevent="newBanner()">
                    New <i class="fas fa-plus"></i>
                </a>
            </div>
            <div>
                <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
            </div>
            <div class="">
                <h1>Ads</h1>
            </div>
        </div>
        <Popup ref="ad" :title="(props.formData.value && props.formData.value.id != null) ? 'Edit banner' : 'New banner'">
            <div class="form">
                <form @submit.prevent="actionAd()" v-if="props.formData.value">
                    <div class="row">
                        <label>Link</label>
                        <input type="text" v-model="props.formData.value.link" required />
                    </div>
                    <div class="row">
                        <label>Description</label>
                        <input type="text" v-model="props.formData.value.description" />
                    </div>
                    <div class="row">
                        <label>Type</label>
                        <select v-model="props.formData.value.type" v-if="data.types" required>
                            <option value="0">---</option>
                            <option v-for="c in data.types" :key="c.id" :value="c.id">{{ c.title }}</option>
                        </select>
                    </div>
                    <div class="row">
                        <label>Image</label>
                        <Image v-model="props.formData.value.img" @update:modelValue="props.formData.value.img = $event;" :url="url" />
                    </div>
                    <div class="row">
                        <button class="btnS" v-if="props.formData.value && props.formData.value.id">Edit</button>
                        <button class="btnS" v-else>Add</button>
                    </div>
                </form>
            </div>
        </Popup>
        <div class="table" v-if="data.items!=''">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>Fraud clicks</th>
                        <th>Leads</th>
                        <th>Clicks</th>
                        <th>Views</th>
                        <th>Link</th>
                        <th>Size</th>
                        <th></th>
                        <th></th>
                        <th>#</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, i) in data.items" :key="item.id">
                        <td class="icons-btn">
                            <a class="icon-btn" href="#" @click.prevent="delAd(item)">
                                <i class="fas fa-trash-alt"></i>
                            </a>
                            <a class="icon-btn" href="#" @click.prevent="openChart(item, i)">
                                <i class="fas fa-chart-bar"></i>
                            </a>
                            <a class="icon-btn" href="#" @click.prevent="editBanner(item)">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td>
                            <a href="#" @click.prevent="details.active=1; getDetails(item.id, 4)">
                                <template v-if="item.fclicks">{{ item.fclicks }}</template>
                                <template v-if="!item.fclicks">0</template>
                            </a>
                        </td>
                        <td>
                            <a href="#" @click.prevent="details.active=1; getDetails(item.id, 3)">
                                <template v-if="item.leads">{{ item.leads }}</template>
                                <template v-if="!item.leads">0</template>
                            </a>
                        </td>
                        <td>
                            <a href="#" @click.prevent="details.active=1; getDetails(item.id, 2)">
                                <template v-if="item.clicks">{{ item.clicks }}</template>
                                <template v-if="!item.clicks">0</template>
                            </a>
                        </td>
                        <td>
                            <a href="#" @click.prevent="details.active=1; getDetails(item.id, 1)">
                                {{ item.views }}
                            </a>
                        </td>
                        <td>
                            <a href="#" @click.prevent="formData = item; ad.active=1;">
                                {{ item.link }}
                            </a>
                        </td>
                        <td class="image">
                            <a href="#" @click.prevent="formData = item; ad.active=1;">
                                {{ item.size }}
                            </a>
                        </td>
                        <td class="image">
                            <a href="#" @click.prevent="formData = item; ad.active=1;">
                                <img :src="url+'/'+item.img" />
                            </a>
                        </td>
                        <td class="image">
                            <Toogle
                                v-model="item.published"
                                @update:modelValue="actionAd(item)"
                            />
                        </td>
                        <td>
                            {{ item.id }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="empty" v-if="data.items==''">
            No items
        </div>
    </div>
</template>