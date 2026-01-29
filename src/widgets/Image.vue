<script setup>
import { onMounted, ref, watch } from "vue";
import "../css/image.css"

const props = defineProps({
    modelValue: {
        type: String,
        required: false,
        default: ""
    },
    url: String
});

const emit = defineEmits(["update:modelValue"]);
const value = ref("");
const input = ref(null);

function change(event){
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        value.value = reader.result;
    };
    reader.readAsDataURL(file);

    emit('update:modelValue', file);
}

onMounted(() => {
    if (props.modelValue && props.modelValue.trim() !== "") {
        value.value = props.url + '/' + props.modelValue;
    } else {
        value.value = "";
    }
});

watch(() => props.modelValue, (newVal) => {
    if (typeof newVal === "string" && newVal.trim() !== "") {
        value.value = props.url + '/' + newVal;
    } else if (newVal instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
            value.value = reader.result;
        };
        reader.readAsDataURL(newVal);
    } else {
        value.value = "";
    }
});
</script>

<template>
    <div class="image-preview-area">
        <a href="#" class="select_img" @click.prevent="input.click()">
            <span v-if="value">
                <img :src="value" class="im" />
            </span>
            <span v-else>
                <img :src="url + '/app/views/images/placeholder.png'" />
            </span>
        </a>
    </div>
    <input
        type="file"
        ref="input"
        accept="image/jpeg, image/gif, image/webp, image/svg+xml, image/png"
        @change="change"
        class="input-image"
    />
</template>
