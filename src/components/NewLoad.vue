<template>
  <div class="upload-container">
    <header class="upload-header">
      <div class="left">
        <i></i>
      </div>
      <div class="center">编辑</div>
      <div class="right">草稿箱</div>
    </header>
    <div class="upload-title">
      <input type="text" placeholder="请输入标题" />
    </div>
    <div class="upload-duanluo">
      <div class="upload-duanluo-title">
        <input type="text" placeholder="请输入段落标题" v-model="duanluo.title" />
      </div>
      <div class="upload-duanluo-content">
        <textarea name id cols="30" rows="10" placeholder="请输入正文" v-model="duanluo.content"></textarea>
        <div class="upload-action">
          <div class="left">
            <div class="btn-box">
              <button class="up-btn" @click="uploadImg">
                <input
                  type="file"
                  accept="image/*"
                  name="imgContent"
                  ref="uploadinput"
                  @change="onFileChangeImg"
                  multiple
                />
              </button>
            </div>
            <div class="btn-box save">
              <button class="up-btn video-btn">
                <input type="file" accept="video/*" name="videoContent" ref="uploadinputVideo" />
              </button>
            </div>
            <button class="btn-draft">
              <i class="save"></i>
            </button>
          </div>
          <div class="right">
            <h1 @click="jumpDrag">段落排序</h1>
            <span></span>
            <h1 @click="saveModule">存为段落</h1>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h1 class="tip">点击模块编辑内容</h1>
      <div class="upload-module" ref="moduleContainer">
        <div class="module-container">
          <div class="cover" @click="upLoadCover">
            <h1 v-if="cover==''">添加封面</h1>
            <img :src="`${cover}?x-oss-process=image/resize,w_200,h_200,m_fill`" v-else />
            <input type="file" ref="uploadcover" @change="onFileChange" />
          </div>
        </div>
        <div class="module-container" v-for="(v,i) in moduleList" :key="i">
          <div v-if="v.type==1" class="text-info" @click="jumpEdit">
            <span>{{v.content}}</span>
          </div>
          <img :src="v.content" alt v-if="v.type==2" @click="ImgChange(i)" />
          <div class="index">{{i>=100?`${i+1}`:`${i+1}&nbsp;`}}</div>
        </div>
      </div>
    </div>
    <input type="file" class="changeImg" ref="allImgChange" @change="onImgChange" />
    <footer>
      <span class="scan">预览</span>
      <span class="send">发布</span>
    </footer>
  </div>
</template>

<script>
import configuration from "../utils/utils";
const {
  NODE_ENV,
  VUE_APP_CLOSE,
  VUE_APP_BASEURL,
  VUE_APP_OSSADDRESS,
  VUE_APP_VIDEO,
  VUE_APP_CDN,
  VUE_APP_ENDPOINT,
  VUE_APP_BUCKET1,
  VUE_APP_BUCKET2,
  VUE_APP_DIR_IMG,
  VUE_APP_DIR_VIDEO
} = configuration;
import { upload } from "../../static/lib/upload";
export default {
  name: "NewLoad",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      cover: "",
      articleTitle: "",
      duanluo: {
        type: 1,
        title: "",
        content: ""
      },
      moduleList: [],
      currentIndex: 0
    };
  },
  mounted() {},
  methods: {
    uploadImg(e) {
      this.$refs.uploadinput.click();
    },
    upLoadCover(e) {
      this.$refs.uploadcover.click();
    },
    //封面上传
    async onFileChange(e) {
      console.log(e);
      if (e.target.files.length == 0) {
        return;
      }
      //单张上传
      let result = await upload(e.target.files[0], this.getBucket);
      let {
        res: { requestUrls }
      } = result;
      let url = requestUrls[0];
      this.cover = url;
    },
    ImgChange(i) {
      console.log(i);
      this.currentIndex = i;
      this.$refs.allImgChange.click();
    },
    async onImgChange(e) {
      if (e.target.files.length == 0) {
        return;
      }
      //单张上传
      let result = await upload(e.target.files[0], this.getBucket);
      let {
        res: { requestUrls }
      } = result;
      let url = requestUrls[0];
      this.moduleList[this.currentIndex].content = url;
    },
    //图片上传
    async onFileChangeImg(e) {
      if (e.target.files.length == 0) {
        return;
      }
      //单张上传
      let result = await upload(e.target.files[0], this.getBucket);
      let {
        res: { requestUrls }
      } = result;
      let url = requestUrls[0];
      this.insertPic(url);
    },
    getBucket() {
      return {
        VUE_APP_ENDPOINT: VUE_APP_ENDPOINT,
        VUE_APP_BUCKET: VUE_APP_BUCKET2
      };
    },
    jumpDrag() {
      this.$router.push("/moduledrag");
    },
    jumpEdit() {
      this.$router.push("/edit");
    },
    saveModule() {
      let that = this;
      const currentObj = { ...that.duanluo };
      this.moduleList.push(currentObj);
      this.duanluo.title = "";
      this.duanluo.content = "";
      this.$refs.moduleContainer.scrollTop = this.$refs.moduleContainer.scrollHeight;
    },
    insertPic(val) {
      this.moduleList.push({
        type: 2,
        content: val
      });
      //添加元素时使滚动跳滚动到底部
      this.$refs.moduleContainer.scrollTop = this.$refs.moduleContainer.scrollHeight;
    },
    insertVideo() {
      this.moduleList.push({
        type: 3,
        content: ""
      });
      this.$refs.moduleContainer.scrollTop = this.$refs.moduleContainer.scrollHeight;
    }
  },
  watch: {
    'moduleList': {
      handler: function(newValue, oldValue) {
        console.log(newValue);
        window.localStorage.setItem('moduleList',JSON.stringify(newValue));
      },
      deep: true
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upload-container .tip {
  margin-left: 58px;
  margin-top: 40px;
  margin-bottom: 40px;
  font-size: 38px;
  color: rgba(184, 184, 184, 1);
  line-height: 53px;
  letter-spacing: 2px;
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
  width: 156px;
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
.upload-title {
  box-sizing: border-box;
  padding: 0 58px;
  display: flex;
  align-items: center;
  height: 183px;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
}
.upload-title input {
  width: 100%;
  font-size: 52px;
  font-weight: 600;
  border: none;
}
.upload-duanluo {
  width: 100%;
}
.changeImg{
  display: none;
  overflow: hidden;
}
.upload-duanluo .upload-duanluo-title {
  box-sizing: border-box;
  padding: 0 58px;
  display: flex;
  align-items: center;
  height: 155px;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
}
.upload-duanluo .upload-duanluo-title input {
  font-size: 42px;
  border: none;
}
::-webkit-input-placeholder {
  color: #bbb;
  padding-top: 0.16rem;
}
:-moz-placeholder {
  color: #bbb;
  padding-top: 0.16rem;
}
/* Firefox版本19+ */
::-moz-placeholder {
  color: #bbb;
  padding-top: 0.16rem;
}
/* IE浏览器 */
:-ms-input-placeholder {
  color: #bbb;
  padding-top: 0.16rem;
}
.upload-duanluo .upload-duanluo-content {
  box-sizing: border-box;
  padding: 48px 58px 54px 58px;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
  font-size: 42px;
  line-height: 59px;
}
.upload-duanluo .upload-duanluo-content textarea {
  width: 100%;
  box-sizing: border-box;
  border: none;
}
.upload-duanluo .upload-duanluo-content .upload-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.upload-duanluo .upload-duanluo-content .upload-action > div {
  display: flex;
  align-items: center;
}
.upload-duanluo .upload-duanluo-content .upload-action .right {
  font-size: 42px;
  color: rgba(198, 198, 198, 1);
}
.upload-duanluo .upload-duanluo-content .upload-action .right h1 {
  padding: 0 22px;
  box-sizing: border-box;
}
.upload-duanluo .upload-duanluo-content .upload-action .right span {
  display: block;
  width: 4px;
  height: 37px;
  background: rgba(216, 216, 216, 1);
}
.upload-module {
  height: 660px;
  box-sizing: border-box;
  padding: 0 55px 40px 55px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  align-content: flex-start;
}
.upload-module .module-container {
  width: 200px;
  height: 200px;
  background: rgba(242, 242, 242, 1);
  border-radius: 10px;
  margin-bottom: 34px;
  margin-right: 33px;
  position: relative;
}
.upload-module .module-container .index {
  width: 123px;
  height: 123px;
  border-radius: 10px;
  background: url("../../static/index.png") no-repeat;
  font-size: 12px;
  text-align: right;
  padding-right: 10px;
  padding-top: 10px;
  box-sizing: border-box;
  color: #fff;
  position: absolute;
  top: 0;
  right: 0;
  /* text-align: center */
}
.upload-module .module-container input {
  display: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
.upload-module .module-container .text-info {
  width: 100%;
  height: 200px;
  padding: 28px 15px;
  font-size: 34px;
  line-height: 50px;
  box-sizing: border-box;
}
.upload-module .module-container .text-info span {
  width: 100%;
  height: 100%;
  text-overflow: ellipsis; /* 文本溢出时显示省略号来代表被修剪的文本 */
  overflow: hidden;
  text-overflow: -o-ellipsis-lastline;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
.upload-module .module-container .cover {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.upload-module .module-container h1 {
  width: 93px;
  height: 106px;
  display: block;
  font-size: 38px;
  font-weight: 500;
  color: rgba(203, 203, 203, 1);
  line-height: 53px;
}
.upload-module .module-container img {
  width: 200px;
  height: 200px;
}
.upload-module .module-container:nth-child(5n) {
  margin-right: 0;
}
.upload-action .btn-box {
  display: flex;
  /* width:100%; */
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  position: relative;
}
.upload-action .btn-box .up-btn {
  cursor: pointer;
  margin-top: 9px;
  background: none;
  border: none;
  text-align: center;
  font-size: 28px;
  font-family: PingFang-SC-Medium;
  font-weight: 500;
  color: rgba(61, 61, 61, 1);
  line-height: 40px;
}
.upload-action .btn-box .up-btn::after {
  margin-left: 4px;
  content: " ";
  display: block;
  width: 68px;
  /* margin-top: 9px; */
  height: 63px;
  background: url("https://f-bd.imuguang.com/wh/static/img/send_icon.png")
    no-repeat;
  /* background: url("https://aiyu-out.oss-cn-hongkong.aliyuncs.com/wh/static/img/send_icon.png") no-repeat; 艾鱼 */
  background-size: 100%;
}
.upload-action .btn-box .video-btn::after {
  background: url("https://f-bd.imuguang.com/wh/static/img/send_video_icon.png")
    no-repeat;
  /* background: url("https://aiyu-out.oss-cn-hongkong.aliyuncs.com/wh/static/img/send_icon.png") no-repeat; 艾鱼 */
  background-size: 100%;
}
.upload-action .btn-box input {
  display: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 144px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px -4px 64px -8px rgba(160, 160, 160, 0.5);
}
footer .scan {
  font-size: 42px;
  font-weight: 400;
  color: rgba(162, 162, 162, 1);
  line-height: 59px;
  margin-right: 67px;
}
footer .send {
  font-size: 52px;
  font-weight: 600;
  color: rgba(59, 135, 230, 1);
  line-height: 73px;
  justify-content: flex-end;
  margin-right: 78px;
}
</style>
