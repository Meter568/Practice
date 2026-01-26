<script setup>
import { ref, watch, defineExpose } from "vue"
import "../css/popup.css"

const props = defineProps({
    title: String,
    fullscreen: Number
})

const active = ref(0);
const top = ref(0);
const widthVal = ref("300px");
const ml = ref("0px");
const left = ref("50%");
const height = ref("auto");
const popup = ref(null);

watch(active, (newVal) => {
    if(newVal == 1 && !props.fullscreen){
        setTimeout(() => {
            const h = popup.value.clientHeight / 2;
            top.value = `calc(50% - ${h}px)`;
        }, 10);
    }
    if(props.fullscreen){
        top.value = 0;
        widthVal.value = "100%";
        ml.value = 0;
        left.value = 0;
        height.value = "100%";
    }
})

defineExpose({ active });
</script>

<template>
    <template v-if="active==1">
        <div class="popup-back"></div>
        <div class="popup" :style="{top:top, 'max-width':widthVal, 'margin-left':ml, left:left, height:height}" ref="popup">
        <div class="head-popup">
            <div><a href="#" @click.prevent="active=0"><i class="fas fa-window-close"></i></a></div>
            <div class="head-title">{{ title }}</div>
        </div>
        <div class="popup-inner">
            <slot />
        </div>
        </div>
    </template>
</template>
