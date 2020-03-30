<template>
  <div class="preview">
    <header class="upload-header">
      <div class="left" @click="returnPage">
        <i></i>
      </div>
      <div class="center">预览</div>
      <div class="right"></div>
    </header>
    <div class="preview-title">
       {{title}}
    </div>
    <div class="preview-content">
        <p v-html="htmlStr"></p>
    </div>
    <footer> 发布</footer>
  </div>
</template>
<script>
export default {
  name: "PreView",
  data(){
    return {
      copyList:[],
      htmlStr:'',
      title:''
    }
  },
  mounted(){
    this.title=window.localStorage.getItem("title")||"hahhaha";
    let historyModuleList=window.localStorage.getItem("moduleList");
    if(historyModuleList!=''&&historyModuleList!=undefined&&historyModuleList!='undefined'&&historyModuleList!=null){
      this.copyList=JSON.parse(historyModuleList);
      this.formatHtml(this.copyList);
    }
  },
  methods:{
    formatHtml(){
      let domStr=''
      for(let i=0;i<this.copyList.length;i++){
        console.log(this.copyList[i])
        for(let key  in this.copyList[i]){
          console.log(key + '---' + this.copyList[i][key])
          if(key=='title'&&this.copyList[i][key]!=''){
            domStr+=`<p class="title">${this.copyList[i][key]}</p>`
          }else if(key=='content'&&this.copyList[i][key]!=''){
            domStr+=`<p class="content">${this.copyList[i][key]}</p>`
          }
        }
      }
      this.htmlStr=domStr;
    },
    returnPage(){
      window.localStorage.setItem('moduleList',JSON.stringify(this.copyList));
      this.$router.go(-1);
    }
  }
};
</script>
<style>
.upload-header {
  width: 100%;
  box-sizing: border-box;
  padding: 43px 58px 31px 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.upload-header div {
  width: 156px;
  font-size: 52px;
}
.upload-header i {
  width: 37px;
  height: 69px;
  display: block;
  background: url("../../static/fanhui.svg") no-repeat;
  background-size: 100%;
}
.preview-title,.preview-content{
    padding: 50px 54px;
    box-sizing: border-box;
}
.preview-title{
    font-size:82px;
    font-weight:600;
    color:rgba(41,41,41,1);
    line-height:115px;
}
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  color:#fff;
  background:rgba(59,135,230,1);
  box-shadow: 0px -4px 64px -8px rgba(160, 160, 160, 0.5);
}
</style>