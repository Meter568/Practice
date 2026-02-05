<script setup>
import axios from "axios";
import { nextTick, onMounted, reactive, ref, toRaw, watch } from "vue";
import Header from "../widgets/Header.vue";
import Toogle from "../widgets/Toogle.vue";
import Popup from "../widgets/Popup.vue";
import "../css/campaings.css";

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
    logout: Function,
    user: Object,
    formData: Object,
    toFormData: Function,
})

const data = ref({});
const date = ref("");
const date2 = ref("");
const q = ref("");
const sort = ref("");
const loader = ref(1);
const iChart = ref(-1);
const id = ref(0);
const type = ref(0);
const all = ref(true);

const news = ref(null);
const header = ref(null);
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

function get(){
    const fd = props.toFormData(props.formData.value);
    if(date.value != "") fd.append("date", date.value);
    if(date2.value != "") fd.append("date2", date2.value);
    loader.value = 1;
    axios.post(
        props.url + "/site/getCampaigns?auth=" + props.user.auth, 
        fd
    ).then(response => {
        data.value = response.data;
        loader.value = 0;
        console.log(response.data);
        console.log(data.value)
    }).catch(function(error){
        console.log(error);
    })
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

function getCampaignChart() {
    const fd = props.toFormData(props.formData.value);
    if (date.value)  fd.append('date', date.value);
    if (date2.value) fd.append('date2', date2.value);
    if (q.value)     fd.append('q', q.value);
    if (sort.value)  fd.append('sort', sort.value);
    loader.value = 1;
    axios
        .post(props.url + "/site/getCampaignChart?auth=" + props.user.auth, fd)
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

        if (date2.value) {
            end = new Date(date2.value);
        } else {
            end = new Date();
            end.setDate(end.getDate() - 1);
            date2.value = end.toISOString().slice(0, 10);
        }

        if (date.value) {
            start = new Date(date.value);
        } else {
            start = new Date(end);
            start.setDate(start.getDate() - 7);
            date.value = start.toISOString().slice(0, 10);
        }

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

onMounted(() => {
    if(!props.user){
        props.logout();
    }
    date.value = "";
    date2.value = "";
    q.value = "";
    sort.value ="";
    get();
    getCampaignChart();
});

watch([date, date2], async () => {
    if (!chart.value || chart.value.active !== 1) return;

    await nextTick();
    getCampaignChart();
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
    <div class="campaings">
        <Header ref="header" :url="url" :user="user" :logout="logout" />
        <div id="spinner" v-if="loader"></div>
        <div class="wrapper">
            <div class="panel">
                <div class="btn">
                    <a class="btnS" href="#" @click.prevent="formData = {};news.active=1">New <i class="fas fa-plus"></i></a>
                </div>
                <div>
                    <input type="date" v-model="date2" @change="get();" /> - <input type="date" v-model="date" @change="get();" />
                </div>
                <div class="">
                    <h1>Campaings</h1>
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
                        <tr v-for="(item, i) in data.items" :key="item.id">
                            <td class="icons-btn">
                                <a class="icon-btn" href="#" @click.prevent="del(item)">
                                    <i class="fas fa-trash-alt"></i>
                                </a>
                                <a class="icon-btn" href="#" @click.prevent="openChart(item, i)">
                                    <i class="fas fa-chart-bar"></i>
                                </a>
                                <router-link class="icon-btn" :to="'/campaign/'+item.id">
                                    <i class="fas fa-edit"></i>
                                </router-link>
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