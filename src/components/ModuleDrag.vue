<template>
  <div class="drag-container">
    <header class="upload-header">
      <div class="left" @click="returnPage">
        <i></i>
      </div>
      <div class="center">排序</div>
      <div class="right"></div>
    </header>
    <!-- <div id="drag">
      <div v-for="(item,index) in copyList" :key="index" class="drag-item">
        <div class="left" v-if="item.type==1">
          <span>{{item.content}}</span>
        </div>
        <div v-if="item.type==2">
          <img :src="item.content" alt />
        </div>
        <div class="action">
          <h1 @click.stop.prevent="btnUp(index)">置顶</h1>
          <h1>查看</h1>
          <h1 @click.stop.prevent="deleteItem(index)">删除</h1>
        </div>
      </div>
    </div> -->
    <draggable v-model="copyList" group="people" @start="drag=true" @end="drag=false" id="drag">
      <div v-for="(item,index) in copyList" :key="index" class="drag-item">
        <div class="left" v-if="item.type==1">
          <span>{{item.content}}</span>
        </div>
        <div v-if="item.type==2">
          <img :src="item.content" alt />
        </div>
        <div class="action">
          <h1 @click.stop.prevent="btnUp(index)">置顶</h1>
          <h1>查看</h1>
          <h1 @click.stop.prevent="deleteItem(index)">删除</h1>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import Sortable from "sortablejs";
import draggable from 'vuedraggable'
export default {
  name: "ModuleDrag",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      sortList: {},
      htmlStr: "",
      copyList: [],
      htmlArray: []
    };
  },
  components:{
    draggable
  },
  mounted() {

    // this.copyList=JSON.parse(window.localStorage.getItem("moduleList"));
    //添加测试案例
    // let htmlArray=['<h3>朋友列表</h3>','<h3>家人列表</h3>','<h3>亲戚列表</h3>','<h3>同事列表</h3>']
    window.localStorage.setItem(
      "moduleList",
      '[{"type":1,"title":"1","content":"h喝洒是的爱上打算的阿斯顿爱上的阿斯顿 是的阿斯顿爱上的爱上打算的爱上打算的阿斯顿爱上的爱上打算的阿斯顿爱上大说的啊的爱上的1"},{"type":1,"title":"2","content":"2"},{"type":1,"title":"3","content":"3"},{"type":2,"content":"http://imuguang-file.oss-cn-shenzhen.aliyuncs.com/index.png"}]'
    );
    this.copyList = JSON.parse(window.localStorage.getItem("moduleList"));
    let that = this;
    // this.getModule();
    // let $ul = this.$el.querySelector("#drag");
    // this.sortList = Sortable.create($ul, {
    //   // animation: 150,
    //   // delay: 1000,
    //   // ghostClass: "blue-background-class",
    //   onUpdate: event => {
    //     console.log("event值为：", event, event.newIndex, event.oldIndex);
    //     that.htmlStr = event.path[0].innerHTML;
    //     // console.log(event.path[0].innerHTML, event.path[0].innerText);
    //     let centerParams=that.copyList[event.newIndex];
    //     that.copyList[event.newIndex]=that.copyList[event.oldIndex];
    //     that.copyList[event.oldIndex]=centerParams;
    //   }
    // });
  },
  methods: {
    getModule() {
      let arraysStr = window.localStorage.getItem("moduleArrays");
      let arrays = JSON.parse(arraysStr);
      this.htmlStr = arrays.join().replace(/,/g, "");
      console.log(this.htmlStr);
    },
    btnUp(index) {
      let item = this.copyList[index];
      this.copyList.splice(index, 1);
      this.copyList.unshift(item);
    },
    deleteItem(index){
      this.copyList.splice(index,1);
    },
    returnPage(){
      window.localStorage.setItem('moduleList',JSON.stringify(this.copyList));
      this.$router.go(-1);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.drag-container{
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
}
#drag {
  padding: 0 33px;
  box-sizing: border-box;
  margin-top: 33px;
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
}
.drag-item {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 0px 32px 0px rgba(197, 197, 197, 0.5);
  border-radius: 19px;
  margin-bottom: 50px;
  padding: 24px 40px;
  font-size: 42px;
  line-height: 59px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drag-item img {
  width: 150px;
  height: 92px;
  line-height: 4.7504vw;
}
.drag-item span {
  display: block;
  box-sizing: border-box;
  background: #fff;
}
.drag-item .left {
  margin: 25px 0;
  max-width: 692px;
  line-height: 4.7504vw;
  text-overflow: -o-ellipsis-lastline;
  /* white-space: nowrap; */
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
.drag-item .action {
  display: flex;
  font-size: 36px;
  color: rgba(182, 182, 182, 1);
}
.drag-item .action h1 {
  padding: 32px 0;
  margin-left: 32px;
}
.drag-item .action h1:hover{
  opacity: .8;
}
.upload-header {
  width: 100%;
  box-sizing: border-box;
  padding: 43px 58px 31px 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.upload-header div {
  width: 208px;
  font-size: 52px;
}
.upload-header .center{
  text-align: center;
}
.upload-header .right{
  text-align: right;
}
.upload-header i {
  width: 37px;
  height: 69px;
  display: block;
  background: url("../../static/fanhui.svg") no-repeat;
  background-size: 100%;
}
</style>
