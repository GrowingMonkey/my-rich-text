<template>
  <div style="width:100%;height:100%">
    <div
      id="edit-div"
      class="edit-div"
      :contenteditable="canEdit"
      ref="edit"
      @click="point"
      @blur="blurE"
      @input="changeText"
    >
      <p>
        <br />
      </p>
    </div>
    <div style="clear:both"></div>
    <div class="dove-footer">
      <div class="action-box">
        <div class="btn-box">
          <button class="up-btn" @click="uploadImg">
            <input
              type="file"
              accept="image/*"
              @change="onFileChange2"
              name="imgContent"
              ref="uploadinput"
              multiple
            />
          </button>
        </div>
        <div class="btn-box save">
          <button class="up-btn video-btn" @click="uploadVideo">
            <input type="file" accept="video/*" @change="onFileChange2" name="videoContent" ref="uploadinputVideo" />
          </button>
        </div>
        <button class="btn-draft" @click.stop.prevent="clearCaogao">
          <i class="save"></i>
        </button>
        <button class="btn-draft">
          <i class="caogao" @click.stop.prevent="jumpDraft"></i>
        </button>
      </div>
      <button class="submit-load" @click.stop.prevent="_submitForm">
        <p>发表</p>
      </button>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import axios from "axios";
import OSS from "ali-oss";
import configuration from "../utils/utils";
const {
  NODE_ENV,
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

import { Toast, Dialog } from "vant";
export default {
  name: "editDiv",
  props: {
    value: {
      type: String,
      default: ""
    },
    canEdit: {
      type: Boolean,
      default: true
    },
    onOk: {
      //定义onOK属性
      type: Function
    },
    isdisable: {
      type: Boolean
    }
  },
  data() {
    return {
      originUrl: VUE_APP_BASEURL,
      //originUrl: "http://www.aiyu2019.com/api",//艾鱼
      innerText: this.value,
      isLocked: false,
      lastpoint: 0,
      editorRange: null,
      editorNode: null,
      selection: "",
      range: "",
      clientOss: {},
      clientOssV: {},
      newFileNameArrays: [],
      fileStatus: [], //文件响应状态
      fileSuccStatus: [],
      currentFileIndex: 0,
      videoUrl: "",
      allToast: ""
    };
  },
  watch: {
    value() {
      if (!this.isLocked || !this.innerText) {
        this.innerText = this.value;
      }
    }
  },
  methods: {
    async getSTStoken() {
      let that = this;
      return await this.$post(
        `${that.originUrl}/${NODE_ENV=='aiyu'?'api':'api'}/upload/pic/getSTSToken`
      ).then(res => {
        if (res && res.code != 0) {
          Toast(res.message);
        } else {
          return res;
        }
      });
    },
    removeHtmlStyle(html) {
      let reg = /style="[^=>]*"([(\s+\w+=)|>])/g;
      let newHtml = "";
      if (html) {
        newHtml = html.replace(reg, "$1");
      }
      return newHtml;
    },
    jumpDraft() {
      this.$router.push({ path: "/draftbox" });
    },
    saveCaogao() {
      console.log(111);
      if (this.isdisable) {
        return;
      }
      if (this.onOk) {
        this.onOk(true, 2);
      }
    },
    clearCaogao() {
      if (this.onOk) {
        this.onOk(true, "clear");
        this.$nextTick(() => {
          document.getElementById("edit-div").innerHTML = "<p><br></p>";
          // this.value.length>10&&setInterval(function(){
          //   // that.onOk(true,3);
          // },5000)
        });
      }
    },
    _submitForm() {
      if (this.isdisable) {
        return;
      }
      if (this.onOk) {
        this.onOk(true, 1);
      }
    },

    removeAEvent() {
      this.$nextTick(() => {
        document.querySelector(".edit-div").addEventListener("click", e => {
          // 阻止默认事件
          e.preventDefault();
          // 定义a标签跳转规则
          if (e.target.nodeName === "A") {
            this.$fn.openWindow(e.target.href);
          }
        });
      });
    },
    point(e) {
      let that = this;
      if (window.getSelection) {
        //ie11 10 9 ff safari
        this.$refs.edit.focus(); //解决ff不获取焦点无法定位问题
        // let range = window.getSelection(); //创建range
        // let offset=range.focusOffset;
      }
      if (
        navigator.userAgent.indexOf("Android") == -1 &&
        navigator.userAgent.indexOf("Adr") == -1
      ) {
        let selection = getSelection();
        this.range = selection.getRangeAt(0);
        console.log(this.range);
      }
      console.log(e.target.getAttribute("class"));
      if (e.target.getAttribute("class") == "video-btn") {
        that.$nextTick(() => {
          if (
            e.target.previousSibling !== null &&
            e.target.previousSibling.childNodes[0].getAttribute("class") ==
              "edit-video"
          ) {
            e.target.previousSibling.childNodes[0].src = e.target.previousSibling.childNodes[0].getAttribute(
              "src"
            );
            that.getResult(
              e.target.previousSibling.childNodes[0].getAttribute("src")
            );
          } else {
            e.target.parentNode.previousElementSibling.childNodes[0].src = e.target.parentNode.previousElementSibling.childNodes[0].getAttribute(
              "src"
            );
            that.getResult(
              e.target.parentNode.previousElementSibling.childNodes[0].getAttribute(
                "src"
              )
            );
          }
        });
      }
    },
    uuid() {
      let s = [];
      let hexDigits = "56789abcdefghijk";
      for (let i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      let uuid = s.join("");
      uuid = uuid.replace(/[-]/g, "");
      return uuid;
    },
    getpublishId() {
      let that = this;
      return new Promise((reject, resolve) => {
        if (!window.localStorage.getItem("publishId")) {
          this.$post(that.originUrl + `/${NODE_ENV=='aiyu'?'api':'api'}/upload/art/publish`).then(res => {
            if (res && res.code == 0) {
              window.localStorage.setItem("publishId", res.data.id);
              reject(res);
            } else {
              reject({ code: -2, message: "服务端错误" });
            }
          });
        } else {
          reject({ code: 0 });
        }
      });
    },
    uploadImg() {
      this.$refs.uploadinput.click();
    },
    uploadVideo() {
      this.$refs.uploadinputVideo.click();
    },
    getOssKey() {
      let that = this;
      return that.$post(`${that.originUrl}/${NODE_ENV=='aiyu'?'api':'api'}/upload/pic/getSTSToken`);
    },
    convertToBlob(base64Str, fileType) {
      var base64 = window.atob(base64Str);
      var len = base64.length;
      var buff = new ArrayBuffer(len);
      var uarr = new Uint8Array(buff);

      for (var i = 0; i < len; i++) {
        uarr[i] = base64.charCodeAt(i);
      }

      var blob = null;

      try {
        blob = new Blob([buff], { type: fileType });
      } catch (e) {
        var BlobBuilder = (window.BlobBuilder =
          window.BlobBuilder ||
          window.WebKitBlobBuilder ||
          window.MozBlobBuilder ||
          window.MSBlobBuilder);

        if (e.name === "TypeError" && BlobBuilder) {
          var builder = new BlobBuilder();
          builder.append(buff);
          blob = builder.getBlob(fileType);
        }
      }

      return blob;
    },
    //v4上传
    onFileChange2(e) {
      if (e.target.files.length == 0) {
        return;
      }
      this.allToast = Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: false,
        message: "上传中"
      });
      //设置光标
      this.selection = window.getSelection();
      if (this.selection && this.selection.rangeCount <= 0) {
        // this.$refs.edit.focus();
        if (
          navigator.userAgent.indexOf("Android") == -1 &&
          navigator.userAgent.indexOf("Adr") == -1
        ) {
          this.$refs.edit.focus();
          let selection = window.getSelection();
          console.log(selection);
          if (this.range) {
            selection.removeAllRanges();
            selection.addRange(this.range);
          }
        } else {
          this.$refs.edit.focus();
          this.$refs.edit.scrollTop = this.$refs.edit.scrollHeight;
        }
        // this.range.selectAllChildren(textDom);
        // this.range.collapseToEnd()
      }
      //上传
      let that = this;
      that.currentFileIndex = 0; //初始化下标
      this.positionImg = e.target.getAttribute("name"); //拿到点击的按钮,判定是图片上传还是视频上传
      let fileArrays = e.target.files; //拿到当前file数组
      that.fileStatus = new Array(fileArrays.length).fill(false);
      that.fileSuccStatus = new Array(fileArrays.length).fill(false);
      that.newFileNameArrays = []; //清空数组
      console.log(that.fileStatus);
      for (let i = 0; i < fileArrays.length; i++) {
        let currentFile = fileArrays[i];
        that.currentFileIndex = i; //当前file下标
        let picType = currentFile.type.split("/")[1];
        let url = URL.createObjectURL(currentFile);
        //限制当前上传的文件类型

        //截取文件后缀名
        let temporary = currentFile.name.lastIndexOf(".");
        let fileNameLength = currentFile.name.length;
        let fileFormat = currentFile.name.substring(
          temporary + 1,
          fileNameLength
        ); //png
         if (that.positionImg == "videoContent") {
          if(fileFormat!='mp4'||fileFormat!='mov'||fileFormat!='m4v'||fileFormat!='m4a'){
            Dialog.alert({
            title: "上传错误",
            message:'只能上传视频格式'
          });
            this.allToast.clear();
            return;
          }
        }
        //上传的文件名
        let newFileName = `${that.uuid()}.${fileFormat}`;
        if (that.positionImg == "imgContent") {
          that.newFileNameArrays.push(`${VUE_APP_DIR_IMG}${newFileName}`);
        } else {
          that.newFileNameArrays.push(`${VUE_APP_DIR_VIDEO}${newFileName}`);
        }
        // console.log(that.newFileNameArrays);
        that.multipartUploadWithSts(
          `${that.newFileNameArrays[i]}`,
          currentFile
        );
      }
    },
    getTimeStatus() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ timeStatus: true });
        }, 2000);
      });
    },
    async getResult(url) {
      let that = this;
      let res = await that.getSourceStatus(url);
      let time = await that.getTimeStatus();
      if (res.source) {
        Dialog.alert({
            title: "提示",
            message:'转码成功'
          });
      } else {
         Dialog.alert({
            title: "提示",
            message:'正在转码中，请稍后重试'
          });
        if (time.timeStatus) {
          that.getResult(url);
        }
        // setTimeout(getResult(url),20000);
      }
    },
    getSourceStatus(url) {
      return new Promise((resolve, reject) => {
        let request = {};
        if (window.XMLHttpRequest) {
          // code for IE7+, Firefox, Chrome, Opera, Safari
          request = new XMLHttpRequest();
        } else {
          // code for IE6, IE5
          request = new ActiveXObject("Microsoft.XMLHTTP");
        }
        request.open("GEt", url), true;
        request.send();
        request.onreadystatechange = function() {
          console.log(request.status,request.readyState);
          if (request.status == 404) {
            resolve({ source: false });
          } else {
           resolve({ source: true });
          }
        };
      });
    },
    multipartUploadWithSts(storeAs, file, cpt) {
      let that = this;
      if (that.positionImg == "imgContent") {
        that.multitest(that.clientOss, storeAs, file, cpt);
      } else {
        that.multitest(that.clientOssV, storeAs, file, cpt);
      }
    },
    multitest(ossClient, storeAs, file, cpt) {
      let that = this;
      let currentIndex = that.currentFileIndex;
      //console.log(file.name + ' => ' + storeAs);
      var checkpoint_temp;
      if (cpt) {
        ossClient
          .multipartUpload(storeAs, file, {
            parallel: 2,
            checkpoint: cpt,
            progress: function*(percent, cpt) {
              console.log("Progress: " + percent);
              checkpoint_temp = cpt;
            }
          })
          .then(function(result) {
            console.log(result);
            if (result) {
              console.log(result);
              //上传图片成功
              for (let j = 0; j < that.newFileNameArrays.length; j++) {
                if (that.newFileNameArrays[j] === result.name) {
                  that.fileStatus[j] = true;
                }
              }
              //that.execCommand('insertimage',`http://file-t.imuguang.com/${newFileName}`);
              console.log(that.fileStatus);
            }
          })
          .catch(function(err) {
            that.errAction();
             Dialog.alert({
            title: "提示",
            message:'网络有点延迟,请稍后重试'
          });
            console.log(err);
          });
      } else {
        console.log("multitest without cpt");
        ossClient
          .multipartUpload(storeAs, file, {
            parallel: 2,
            progress: function*(percent, cpt) {
              console.log("Progress: " + percent);
              that.progress = Math.floor(percent * 100);
              checkpoint_temp = cpt;
            }
          })
          .then(function(result) {
            //当前文件变为true;
            //改变当前文件上传的响应成功状态,
            that.changeFileStatus(currentIndex);
            //改变当前文件上传成功状态,
            that.changeSuccFileStatus(result);
            if (that.fileStatus.every(that.arraysAllTrue)) {
              if (that.positionImg == "imgContent") {
                that.allToast.message = "上传完成";
                that.allToast.clear();
              }
              //所有文件响应完成
              that.fileSuccStatus.map((v, i) => {
                //插入成功上传的文件
                if (v && that.positionImg == "imgContent") {
                  that.execCommand(
                    "insertHTML",
                    that.imgHtml(`${VUE_APP_CDN}/${that.newFileNameArrays[i]}`)
                  );
                } else {
                  console.log(that.newFileNameArrays[i]);
                  that.execCommand(
                    "insertHTML",
                    that.videoHtml(that.newFileNameArrays[i])
                  );
                }
              });
            }
          })
          .catch(function(err) {
             Dialog.alert({
            title: "提示",
            message:'网络有点延迟,请稍后重试'
          });
            that.errAction();
            console.log(err);
            that.multipartUploadWithSts(storeAs, file, checkpoint_temp);
          });
      }
    },
    errAction() {
      console.log(1111111111);
      // this.allToast&&this.allToast.clear();
    },
    imgHtml(val){
      return `<img src="${val}" name="oneupload" />`;
    },
    videoHtml(val) {
      this.allToast.message = "上传完成";
      this.allToast.clear();
      this.videoUrl = `${VUE_APP_CDN}/${val.replace(
        "input",
        "output"
      )}`;
      return `<p><video class="edit-video" src="${VUE_APP_CDN}/${val.replace(
        "input",
        "output"
      )}" controls="controls" style="width:100%" poster="${VUE_APP_CDN}/${val.replace(
        "input",
        "output"
      )}"></video></p><input class="video-btn" disabled value="点击查看视频转码"/><p>&nbsp;</p>`;
    },
    arraysAllTrue(item) {
      return item === true;
    },
    //改变上传成功文件的状态
    changeSuccFileStatus(result) {
      let that = this;
      for (let j = 0; j < that.newFileNameArrays.length; j++) {
        if (result && that.newFileNameArrays[j] === result.name) {
          that.fileSuccStatus[j] = true;
        }
      }
    },
    //改变文件状态;
    changeFileStatus(index) {
      let that = this;
      for (let j = 0; j < that.fileStatus.length; j++) {
        that.fileStatus[index] = true;
      }
    },

    onFileChange(e) {
      //保存光标的位置
      // let startNode=document.getElementsByClassName('edit-div')[0];
      // let startOffset=window.getSelection().focusOffset;
      // window.getSelection().getRangeAt(0).setStart(startNode,startOffset);
      let that = this;
      let file = e.target.files;
      that.toast = Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "上传中2"
      });
      that
        .getpublishId()
        .then(res => {
          console.log(res);
          if (res && res.code != 0) {
            return { code: -2, message: "服务端错误" };
          } else {
            return that.getOssKey();
          }
        })
        .then(ress => {
          console.log(ress);
          if (ress && ress.code == 0) {
            let store = JSON.parse(ress.data);
            for (let i = 0; i < file.length; i++) {
              let reader = new FileReader();
              console.log(file.length);
              let curfile = file[i];
              let filesType = curfile.type;
              reader.onload = e => {
                let imgStr = /\.(jpg|jpeg|png|bmp|gif|BMP|JPG|PNG|JPEG|GIF)$/;
                if (!imgStr.test(curfile.name)) {
                  alert("文件不是图片类型");
                  return false;
                }
                console.log(file.length);
                let base64Img = e.target.result;
                let arr = base64Img.split(",");
                let fileOssName = "." + curfile.name.split(".")[1];
                that.get_signature(store, curfile, fileOssName);
              };
              reader.readAsDataURL(file[i]);
            }
          }
        });
      // for (let i = 0; i < file.length; i++) {
      //   let reader = new FileReader();
      //   let curfile = e.target.files[i];
      //   reader.onload = e => {
      //     let base64Img = e.target.result;
      //     let arr = base64Img.split(",");
      //     let currentFile = arr[1];
      //     this.imageUrl = e.target.result;
      //     //图片转blob
      //     let blobFile =
      //       typeof currentFile === "string"
      //         ? that.convertToBlob(currentFile, that.filesType)
      //         : currentFile;
      //     that.execCommand("insertImage", base64Img);
      //     document.querySelector(".up-btn input").value = ""; // 解决同一张图片上传无效的问题
      //   };
      //   reader.readAsDataURL(curfile);
      // }
    },
    changeText(e) {
      // this.selection.selectAllChildren(this.$refs.edit);

      console.log(this.selection);
      this.$emit("input", this.$refs.edit.innerHTML);
      if (this.$refs.edit.innerHTML == "") {
        let newP = document.createElement("p");
        let newB = document.createElement("br");
        newP.appendChild(newB);
        this.$refs.edit.appendChild(newP);
      }
      if (
        navigator.userAgent.indexOf("Android") == -1 &&
        navigator.userAgent.indexOf("Adr") == -1
      ) {
        this.range = window.getSelection().getRangeAt(0);
        console.log(this.range);
      }
      //保存草稿
      this.onOk(true, 3);
    },
    execCommand(name, args = null) {
      document.execCommand(name, false, args);
    },
    focusE() {
      // alert(2);
      // window.scrollTo(0, 0);
      // this.isLocked = true;
      // console.log(this.$refs.edit);
      // this.keepLastIndex(this.$refs.edit);
      // this.$refs.edit.scrollTop = this.$refs.edit.scrollHeight;
      this.selection = window.getSelection();
      console.log(this.selection.rangeCount);
    },
    blurE() {
      window.scrollTo(0, 0);
      this.isLocked = false;
    },
    keepLastIndex(obj) {
      // console.log(obj.value.length);
      if (window.getSelection) {
        //ie11 10 9 ff safari
        // obj.focus(); //解决ff不获取焦点无法定位问题
        this.selection = window.getSelection(); //创建range
        selection.selectAllChildren(obj); //range 选择obj下所有子内容
        console.log(selection);
        // if(this.$refs.edit.innerHTML==''||this.$refs.edit.innerHTML=='<p><br/></p>'){
        //光标移到最后
        // selection.collapseToEnd();
        // }else{
        // selection.removeAllRanges();
        // }
        //光标移至最后
      } else if (document.selection) {
        //ie10 9 8 7 6 5
        let range = document.selection.createRange(); //创建选择对象
        //var range = document.body.createTextRange();
        range.moveToElementText(obj); //range定位到obj
        range.collapse(false); //光标移至最后
        range.select();
        console.log(22);
      }
    }
  },
  mounted() {
    this.innerText = this.value;
    let that = this;
    this.originUrl =VUE_APP_BASEURL;
    //    this.originUrl =
    // window.location.origin.indexOf("www") > -1
    //   ? "http://www.aiyu2019.com/api"
    //   : "http://www.aiyu2019.com/api";//艾鱼
    this.$nextTick(() => {
      document.getElementById("edit-div").innerHTML = this.value;
      // this.value.length>10&&setInterval(function(){
      //   // that.onOk(true,3);
      // },5000)
    });
    this.getSTStoken().then(res => {
      let store = JSON.parse(res.data);
      that.clientOss = new OSS({
        accessKeyId: store.accessKeyId,
        accessKeySecret: store.accessKeySecret,
        stsToken: store.securityToken,
        endpoint: VUE_APP_ENDPOINT,
        bucket:VUE_APP_BUCKET2
      });
    });
    this.getSTStoken().then(res => {
      let store = JSON.parse(res.data);
      that.clientOssV = new OSS({
        accessKeyId: store.accessKeyId,
        accessKeySecret: store.accessKeySecret,
        stsToken: store.securityToken,
        endpoint: VUE_APP_ENDPOINT,
        bucket: VUE_APP_BUCKET1
      });
    });
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.btn-draft {
  border: none;
  background: none;
}
.action-box {
  display: flex;
  align-items: center;
}
.edit-video {
  width: 100%;
}
.save {
  margin-left: 100px;
  display: block;
  width: 67px;
  height: 67px;
  background: url("https://f-bd.imuguang.com/wh/static/img/save_icon.png")
    no-repeat;
  // background: url('https://aiyu-out.oss-cn-hongkong.aliyuncs.com/wh/static/img/save_icon.png') no-repeat;艾鱼
  background-size: 100%;
}
.caogao {
  margin-left: 100px;
  display: block;
  width: 78px;
  height: 72px;
  background: url("https://f-bd.imuguang.com/wh/static/img/caogao_icon.png")
    no-repeat;
  // background: url('https://aiyu-out.oss-cn-hongkong.aliyuncs.com/wh/static/img/caogao_icon.png') no-repeat;//艾鱼
  background-size: 100%;
}
.edit-div {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  overflow: auto !important;
  word-break: break-all !important;
  font-size: 52px !important;
  outline: none !important;
  line-height: 1.5 !important;
  user-select: text !important;
  white-space: pre-wrap !important;
  // text-align: left;
  &[contenteditable="true"] {
    user-modify: read-write-plaintext-only;
    &:empty:before {
      content: attr(placeholder);
      display: block !important;
      color: #ccc !important;
    }
  }
}
.edit-div img {
  width: 90% !important;
  text-align: center !important;
  padding: 55px 0 !important;
}
.edit-div .img-box img {
  padding: 55px 0 !important;
  width: 100% !important;
  color: #000 !important;
}
.edit-div > p {
  font-size: 52px !important;
  line-height: 1.5 !important;
  letter-spacing: 0.5px !important;
}
.edit-div .video-btn {
  width: 99% !important;
  height: 79px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  border-radius: 5px !important;
  border: 1px dashed rgba(151, 151, 151, 1) !important;
  color: #b7b7b7 !important;
  box-sizing: border-box !important;
  font-size: 22px !important;
  text-align: center;
  background: #fff;
}
.edit-div > p video {
  width: 100%;
  height: 620px;
}
.edit-div span {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
.edit-div p img {
  display: block !important;
  margin: 0 auto !important;
}
.edit-div h1 {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
.edit-div h1 {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
.edit-div h3 {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
.edit-div h4 {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
.edit-div div {
  font-size: 52px !important;
  line-height: 1.5 !important;
  color: #000 !important;
}
</style>