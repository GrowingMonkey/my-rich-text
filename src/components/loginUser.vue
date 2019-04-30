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
      <button @click="returnPage">返回</button>
      <button @click="tokenGet">获取token</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "loginUser",
  props: ["pro"],
  data() {
    return {
      phonenumber: "",
      code: ""
    };
  },
  methods: {
    tokenGet(){
       let u = navigator.userAgent;
      let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if (isAndroid) {
       let data= window.dove.getToken();
       alert(data);
      }else{
         alert(window.localStorage.getItem("b"));
      }
    },

    returnPage() {
       alert("comming");
      let u = navigator.userAgent;
      let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
      let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if (isAndroid) {
        window.dove.closePage();
      }else{
        //   window.webkit.messageHandlers.方法名(与注册的一致(message.name) ).postMessage(JS传下来的数据(message.body))
        // data 可以是数组 字典 json字符串.....
        //   window.webkit.messageHandlers.testAction.postMessage(data)
        window.webkit.messageHandlers.closePage.postMessage("这是前端传值");
      }
    },
    logined() {
      let that = this;
      let data = {
        code: that.code
      };
      this.$post("/system/login", data).then(Response => {
        console.log(Response);
        if (Response.code == 0) {
          that.$emit("success", true);
        }
        window.localStorage.setItem("userinfo", JSON.stringify(Response.data));
      });
    },
    sendCode() {
      let data = {
        phone: this.phonenumber,
        registerAgent: "h5"
      };
      this.$post(
        "http://www.imuguang.com/api/user/system/getPhoneCode",
        data
      ).then(Response => {
        console.log(Response);
      });
    }
  },
  mounted() {
    //本地没有token之前需要提前获取token
    if (!window.localStorage.getItem("token")) {
      this.$fetch("/system/getToken").then(res => {
        console.log(res);
        if (res.code == 0) {
          window.localStorage.setItem("token", res.data.token);
        }
      });
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


