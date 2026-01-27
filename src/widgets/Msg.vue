<script setup>
import { ref } from "vue";
import Popup from "./Popup.vue";
import "../css/msg.css";

const alert = ref("");
const success = ref("");
const t1 = ref("");
const t2 = ref("");
const confirmTitle = ref("Please confirm next action");
const confirm = ref("");
const popup = ref(null)
const code = ref(0);
const interval = ref("");

function fadeIn(el, timeout, display) {
    el.style.opacity = 0;
    el.style.display = display || "block";
    el.style.transition = `opacity ${timeout}ms`;
    setTimeout(() => {
        el.style.opacity = 1;
    }, 10);
}

function fadeOut(el, timeout) {
    el.style.opacity = 1;
    el.style.transition = `opacity ${timeout}ms`;
    el.style.opacity = 0;
    setTimeout(() => {
        el.style.display = "none";
    }, timeout);
}

function successFun(msg){
    success.value = msg;

    if(document.querySelector('.successMsg')) document.querySelector('.successMsg').style = "";
    clearTimeout(t1.value);
    clearTimeout(t2.value);
    t1.value - setTimeout(function() {
        const block = document.querySelector('.successMsg');

        fadeIn(block, 1000, 'flex');
        t2.value = setTimeout(function(){
            fadeOut(block, 1000);
        }, 3000)
    }, 100)
}

function alertFun(msg){
    alert.value = msg;

    if(document.querySelector('.alertMsg')) document.querySelector('.alertMsg').style = "";
    clearTimeout(t1.value);
    clearTimeout(t2.value);
    t1.value - setTimeout(function() {
        const block = document.querySelector('.alertMsg');

        fadeIn(block, 1000, 'flex');
        t2.value = setTimeout(function(){
            fadeOut(block, 1000);
        }, 3000)
    }, 100)
}

function confirmFun(title, text){
    code.value = 0;
    return new Promise(function(resolve, reject){
        confirmTitle.value = title;
        confirm.value = text;
        popup.value.active = 1;
        interval.value = setInterval(function(){
            if(code.value > 0) resolve();
        }, 100)
    }).then(function(){
        clearInterval(interval.value);
        popup.value.active = 0;
        if(code.value == 1){
            return true;
        }
        if(code.value == 2){
            return false;
        }
    })
}

defineExpose({
    alertFun,
    confirmFun,
    successFun
})

</script>

<template>
    <div class="alertMsg" v-if="alert">
        <div class="message">
            {{ alert }} <i class="fas fa-times-circle"></i>
        </div>
    </div>
    <div class="successMsg" v-if="success">
        <div class="message">
            {{ success }} <i class="fas fa-check-circle"></i>
        </div>
    </div>
    <Popup ref="popup" :title="confirmTitle">
        <div class="al">
            {{ confirm }} <i class="fas fa-info-circle"></i>
            <div class="botBtns">
                <a class="btnS" href="#" @click.prevent="code=2">No</a>
                <a class="btnS" href="#" @click.prevent="code=1">Yes</a>
            </div>
        </div>
    </Popup>
</template>