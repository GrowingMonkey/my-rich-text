<template>
  <div class="drag-container">
    <div id="drag" v-html="htmlStr">
      <h3>朋友列表</h3>
      <h2>22222</h2>
      <h2>11111</h2>
      <h2>0000</h2>
    </div>
  </div>
</template>

<script>
import Sortable from "sortablejs";
export default {
  name: "ModuleDrag",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      sortList: {},
      htmlStr:''
    };
  },
  mounted() {
    //添加测试案例
    let htmlArray=['<h3>朋友列表</h3>','<h3>家人列表</h3>','<h3>亲戚列表</h3>','<h3>同事列表</h3>']
    window.localStorage.setItem('moduleArrays',JSON.stringify(htmlArray));
    let that=this;
    this.getModule();
    let $ul = this.$el.querySelector('#drag')
    this.sortList = Sortable.create($ul, {
      animation: 150,
      ghostClass: 'blue-background-class',
      onUpdate: event => {
        // console.log("event值为：", event, event.newIndex, event.oldIndex);
        that.htmlStr=event.path[0].innerHTML;
        console.log(event.path[0].innerHTML,event.path[0].innerText);
      }
    });
  },
  methods:{
    getModule(){
     let arraysStr=window.localStorage.getItem('moduleArrays');
     let arrays=JSON.parse(arraysStr);
     this.htmlStr=arrays.join().replace(/,/g,'');
     console.log(this.htmlStr);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
