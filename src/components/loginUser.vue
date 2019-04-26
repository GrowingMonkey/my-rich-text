<template>
  <div class="login-box">
    <div class="user">
      <label for>用户</label>
      <input type="text" v-model="phonenumber">
    </div>
    <div class="password">
      <label for>验证码</label>
      <input type="text" v-model="code">
      <button @click="sendCode">发送验证码</button>
    </div>
    <div>
      <button @click="logined">登录</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "loginUser",
  props:['pro'],
  data() {
    return {
      phonenumber: "",
      code: ""
    };
  },
  methods: {
    logined(){
      let that=this;
      let data={
        code:that.code,
      }
      this.$post('/system/login',data).then(Response => {
          console.log(Response);
          if(Response.code==0){
            that.$emit('success',true);
          }
          window.localStorage.setItem('userinfo',JSON.stringify(Response.data));
      });
    },
    sendCode() {
        let data={
            phone: this.phonenumber,
            registerAgent: "h5" 
        }
      this.$post("http://www.imuguang.com/api/user/system/getPhoneCode",data).then(Response => {
          console.log(Response);
      });
    }
  },
  mounted(){
      //本地没有token之前需要提前获取token
      if(!window.localStorage.getItem('token')){
          this.$fetch('/system/getToken').then(res=>{
              console.log(res);
              if(res.code==0){
                window.localStorage.setItem('token',res.data.token);
              }
          })
      }
  }
};
</script>
<style  scoped>
.login-box {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
input {
  border: 1px solid red;
}
.login-box div {
  margin-bottom: 20px;
}
button {
  background: #f7f7;
}
</style>


