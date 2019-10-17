<template>
  <div>
    <div style="position: relative;top:0;">
      <div class="tab-load">
        <i @click="returnPage"></i>
        <span>草稿箱</span>
        <button class="submit-load"  style="visibility:hidden">
          <p>发表</p>
        </button>
      </div>
    </div>
    <div class="scroll-container">
    <ul class="draft_container">
      <li v-for="(v,k) in draft_list" :key="k" @click="jumpEditor(v)">
          <div class="draft_title">
              {{v.title}}
          </div>
          <div class="draft_time">
              {{v.createDate?v.createDate:'08-19 04:45'}}
          </div>
          <div class="draft_detail">
              {{v.detail?v.detail:'暂无介绍'}}
          </div>
          <div class="draft_action">
              <span @click.stop.prevent="jumpEditor(v)">编辑</span>
              <span class="draft_remove" @click.stop.prevent="removeDraft(v)">删除</span>
          </div>
      </li>
    </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: "DraftBox",
  data() {
    return {
      // originUrl: "http://www.imuguang.com/api",
      originUrl: "http://www.aiyu2019.com/api",//艾鱼
      draft_list: []
    };
  },
  mounted() {
    let that = this;
    // this.originUrl =
    //   window.location.origin.indexOf("www") > -1
    //     ? "http://www.imuguang.com/api"
    //     : "http://test.imuguang.com/api";
         this.originUrl =
      window.location.origin.indexOf("www") > -1
        ? "http://www.aiyu2019.com/api"
        : "http://www.aiyu2019.com/api";//艾鱼
    // this.originUrl ="http://192.168.1.107:9090"
    this.$fetch(that.originUrl + "/upload/art/draft/list").then(res => {
      if (res && res.code == 0) {
        that.draft_list = res.data.list;
      } else {
        that.draft_list = [];
      }
    });
  },
  methods: {
    jumpEditor(val) {
      window.localStorage.setItem("draft", JSON.stringify(val));
      window.localStorage.setItem("draft_id",val.id);
      this.$router.push({
        path: "/appload",
        query: {
          //路由传参时push和query搭配使用 ，作用时传递参数
          caogao_id: val.id
        }
      });
    },
    returnPage(){
        this.$router.back();
    },
    removeDraft(val){
        console.log(val);
        let that=this;
        let data={ids:val.id};
        this.$post(that.originUrl + "/upload/art/draft/del",data).then(res=>{
            console.log(res);
            if(res&&res.code==0){
                that.getList();
            }
        })
    },
    getList(){
        let that=this;
        this.$fetch(that.originUrl + "/upload/art/draft/list").then(res => {
      if (res && res.code == 0) {
        that.draft_list = res.data.list;
      } else {
        that.draft_list = [];
      }
    });
    }
  }
};
</script>
<style>
.draft_container li{
    padding:52px 56px;
    box-sizing: border-box; 
    border-bottom: 1px solid rgba(216,216,216,1);
}
.draft_title{
    width: 100%;
    font-weight: 600;
    font-size:52px;
    color:rgba(69,69,69,1);
    line-height:73px;
    word-break:keep-all;
    white-space:nowrap; 
    overflow:hidden; 
    text-overflow:ellipsis; 
}
.draft_time{
    margin-top: 8px;
    width:280px;
    height:67px;
    font-size:48px;
    color:rgba(175,175,175,1);
    line-height:67px;

}
.draft_detail{
    margin-top: 56px;
    width: 100%;
    height:134px;
    font-size:48px;
    color:rgba(69,69,69,1);
    line-height:67px;
    overflow:hidden; 
    text-overflow:ellipsis; 
    display:-webkit-box; 
    -webkit-box-orient:vertical;
    -webkit-line-clamp: 2;  
}
.draft_action{
    margin-top: 52px;
   display: flex;
   justify-content: flex-end;
   font-size:38px;
   color:rgba(168,168,168,1);
   line-height:53px;
}
.draft_remove{
    margin-left: 72px;
}
.tab-load {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 29px 52px;
  background:rgba(246,246,246,1);
}
.tab-load > span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* 50%为自身尺寸的一半 */
  -webkit-transform: translate(-50%, -50%);
  margin: 0 auto;
  font-size: 52px;
  color: rgba(73, 73, 73, 1);
  line-height: 73px;
}
.tab-load > i {
  width: 37px;
  height: 69px;
  display: block;
  background: url("../../static/fanhui.svg") no-repeat;
  background-size: 100%;
}
.submit-load {
  margin-right: -2.12721vw;
  display: flex;
  align-items: center;
  border: none;
  background: #fff;
}
.submit-load p {
  display: flex;
  align-items: center;
  font-size: 46px;
  font-weight: 600;
  color: rgba(58, 135, 230, 1);
  line-height: 65px;
}
.scroll-container{
  height: calc(100vh - 70px - 58px);
  overflow-y: scroll;
}
.submit-load p:before {
  content: " ";
  display: inline-block;
  visibility: hidden;
  width: 40px;
  height: 38px;
  margin-right: 14px;
  background: url("../../static/fasong.svg");
  background-size: 100%;
}
</style>