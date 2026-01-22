<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const url = ref('http://affiliate.yanbasok.com')
const user = ref({
  name: "",
  phone: "",
  email: "",
  date: "",
  auth: ""
})
const formData = reactive({})
const title = ref("")
const date = ref("")
const time = ref("")

const route = useRoute()
const router = useRouter()

function page(path=""){
  if(path) {
    router.push(path);
  }
  title.value = route.name;
  document.title = title.value;
}

function logout(){
  user.value = {
    name: "",
    phone: "",
    email: "",
    date: "",
    auth: ""
  };
  page("/")
  window.localStorage.removeItem('user');
}

function toFormData(obj) {
  let fd = new FormData();
  for(let x in obj){
    if(typeof obj[x] === 'object' && x != 'img' && x != 'copy'){
      for(let y in obj[x]){
        if(typeof obj[x] === 'object'){
          for(let z in obj[x][y]){
            fd.append(x+'['+y+']['+z+']', obj[x][y][z]);
          }
        } else {
          fd.append(x+'['+y+']', obj[x][y]);
        }
      }
    } else if(x != 'copy'){
      fd.append(x, obj[x]);
    }
  }
  return fd;
}

function init() {
  if(window.localStorage.getItem('user')){
    user.value = JSON.parse(window.localStorage.getItem('user'));
  }

  router.isReady().then(() => {
    if(window.localStorage.getItem("user")){
      user.value = JSON.parse(window.localStorage.getItem("user"));
      if(route.path == '/' && user.value.type=='admin'){
        page('/campaings');
      }
    } else {
      page('/')
    }
  })
}

onMounted(() => {
  init();
})

watch(
  () => route.fullPath,
  () => {
    init();
  }
)
</script>

<template>
  <router-view 
    :url="url" 
    :user="user"
    :formData="formData"
    :title="title" 
    :date="date" 
    :time="time"
    :page="page"
    :logout="logout"
    :toFormData="toFormData"
  />
</template>
