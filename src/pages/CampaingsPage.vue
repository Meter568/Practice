<script setup>
import { onMounted } from "vue"

const props = defineProps({
    logout: Function
})

onMounted(() => {
    setTimeout(() => {
        props.logout();
    }, 10000)
})

</script>

<template>
    <div class="campaings">
        <h1>Campaings Page</h1>
    </div>
</template>