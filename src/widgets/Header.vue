<script setup>
import { ref } from "vue";
import Msg from "./Msg.vue";

const msg = ref(null);

defineExpose({
    msg
})

</script>

<template>
    <header class="header">
        <Msg ref="msg" />
    </header>
</template>