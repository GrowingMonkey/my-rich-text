<template>
  <div id="app">
    <!-- <img src="./assets/logo.png">
    <router-view/>-->
    <!-- <login-user v-if="!pro" v-bind:pro="pro" v-on:success="success"></login-user> -->
    <!-- <login-user v-bind:pro="pro" v-on:success="success"></login-user>  -->
    <app-load></app-load>
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
    // console.log(window.localStorage.getItem('userInfo'));
    // if(window.localStorage.getItem('userinfo')!==null){
    //   this.pro=true;
    // }else{
    //   this.pro=false;
    // }
  }
};
</script>

<style>
#app{
  overflow: hidden;
  height: 100vh;
  overflow-y: hidden;
}
</style>
