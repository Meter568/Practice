<script setup>
import { ref, watch } from "vue";
import "../css/toogle.css";

const props = defineProps({
    modelValue: {
        type: String,
        required: true
    }
});

const emit = defineEmits(["update:modelValue"]);

const value = ref(false);


watch(
    () => props.modelValue,
    (newVal) => {
        value.value = newVal === "true";
    },
    { immediate: true }
);

function change() {
    emit("update:modelValue", value.value ? "true" : "false");
}


</script>

<template>
    <label class="switch">
        <input
            type="checkbox"
            v-model="value"
            @change="change"
        />
        <span class="slider"></span>
</label>
</template>