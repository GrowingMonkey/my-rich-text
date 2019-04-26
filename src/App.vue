<template>
  <div id="app">
    <!-- <img src="./assets/logo.png">
    <router-view/>-->
    <login-user v-if="!pro" v-bind:pro="pro" v-on:success="success"></login-user>
    <app-load v-else></app-load>
  </div>
</template>

<script>
import loginUser from './components/loginUser';
import appLoad from './components/appLoad';
import vEditDiv from "./components/vEditDiv";
export default {
  name: "App",
  data() {
    return {
      pro:false
    };
  },
  components: {
    vEditDiv,loginUser,appLoad
  },
  methods:{
    success(data){
      console.log(data);
        this.pro = data;
     }
  },
  mounted(){
    if(window.localStorage.getItem('userInfo')&&!pro){
      this.pro=false;
    }else{
      this.pro=true;
    }
  }
};
</script>

<style>
</style>
