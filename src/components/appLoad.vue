<template>
  <div>
    <div class="tab-load">
      <i @click="window.dove.closePage()"></i>
      <span>编辑</span>
      <div class="submit-load" @click="submitForm">
        <p>发表</p>
      </div>
    </div>
    <div class="dove-cover">
      <img :src="coverUrl" v-if="coverUrl">
      <label class="cover-btn button is-danger" :class="{'active':!firstUp}">
        选择封面
        <input type="file" @change="onFileChange" accept="image/*" name="cover">
      </label>
    </div>
    <p class="dove-title">
      <input type="text" placeholder="请输入标题" v-model="title">
    </p>
    <div class="dove-content">
      <v-edit-div v-model="text"></v-edit-div>
    </div>
    <div class="dove-footer">
      <div class="btn-box">
        <label class="up-btn">
          图文
          <input type="file" accept="image/*" @change="onFileChange" name="imgContent">
        </label>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { Toast } from "vant";
import vEditDiv from "./vEditDiv";
export default {
  name: "appLoad",
  data() {
    return {
      filesType: "",
      firstUp: true,
      imageUrl: "",
      coverUrl: "",
      title: "",
      positionImg: "",
      htmlContent: '<p style="color:rgba(175,175,175,1);">请输入正文</p>',
      text: "<p> </p>"
    };
  },
  components: {
    vEditDiv
  },
  methods: {
    scanContent(e) {
      let cursorPosition = this.getCursortPosition(this.$refs.framework);
      this.htmlContent = this.$refs.framework.innerHTML;
      this.setCaretPosition(this.$refs.framework, 2);
    },
    getClear() {
      if (
        this.htmlContent ===
        '<p style="color:rgba(175,175,175,1);">请输入正文</p>'
      ) {
        this.htmlContent = "";
      }
    },
    validateImageFile(fileList = {}) {
      if (!fileList.length) {
        this.error = "Invalid File";
        return;
      }
      const [file] = fileList;
      if (!file["type"].includes("image/")) {
        this.error = "Invalid Image File";
        return;
      }
      this.createImage(file);
    },
    onFileChange(e) {
      console.log(e.target);
      console.log(e.target.files[0].type);
      this.filesType = e.target.files[0].type;
      this.positionImg = e.target.getAttribute("name");
      this.validateImageFile(e.target.files);
    },
    createImage(file) {
      let that = this;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        let base64Img = e.target.result;
        let arr = base64Img.split(",");
        let currentFile = arr[1];
        console.log(arr[1]);
        this.imageUrl = e.target.result;
        let blobFile =
          typeof currentFile === "string"
            ? that.convertToBlob(currentFile, that.filesType)
            : currentFile;
        console.log(blobFile);
        let formData = new FormData();
        formData.append("file", blobFile);
        formData.append("type", 0);
        console.log(formData);
        that
          .upImage("你的图片上传地址", formData)
          .then(res => {
            console.log(res);
            if (res.code == 0) {
              if (that.positionImg !== "cover") {
                that.text += `<p class="img-box"><img src="${
                  res.data.displayUrl
                    ? "http://www.imuguang.com/img/" + res.data.displayUrl
                    : that.imageUrl
                }" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
              } else {
                that.firstUp = false;
                that.coverUrl = `${
                  res.data.displayUrl
                    ? "http://www.imuguang.com/img/" + res.data.displayUrl
                    : that.imageUrl
                }`;
              }
              Toast(res);
            }
          });
      };
    },
    upImage(url, data) {
      let appHeaders = JSON.parse(window.localStorage.getItem("header"));
      let otherHeader = {
        "Content-Type": "multipart/form-data",
        "publish-id": window.localStorage.getItem("publishId")
      };
      let currentHearder=Object.assign(appHeaders,otherHeader);
      return new Promise((resolve, reject) => {
        axios({
          url: url,
          method: "post",
          data: data,
          headers:currentHearder 
        }).then(
          response => {
            resolve(response.data);
          },
          err => {
            reject(err);
          }
        );
      });
    },
    // createImage(file) {
    //   return new Promise(function(resolve, reject) {
    //     let that = this;
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = e => {
    //       let fileType = e.target.result;
    //       console.log(fileType.type);
    //       this.imageUrl = e.target.result;
    //       typeof fileType === "string"
    //         ? that.convertToBlob(fileType, file.type)
    //         : fileType;
    //       console.log(fileType.type);
    //       // let formData = new FormData();
    //       // formData.append('photo', $('#input_file')[0].files[0]);
    //       // that.$post()
    //       if (this.positionImg !== "cover") {
    //         this.text += `<p class="img-box"><img src="${
    //           this.imageUrl
    //         }" style="margin:0 auto;margin-top:20px;"/></p><p class="edit-clear"> </p>`;
    //         this.submitForm();
    //       } else {
    //         that.firstUp = false;
    //         this.coverUrl = this.imageUrl;
    //       }
    //     };
    //   });
    // },
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

    //获取光标的位置
    getCursortPosition(textDom) {
      let cursorPos = 0;
      if (document.selection) {
        // IE Support
        textDom.focus();
        var selectRange = document.selection.createRange();
        selectRange.moveStart("character", -textDom.value.length);
        cursorPos = selectRange.text.length;
      } else if (textDom.selectionStart || textDom.selectionStart == "0") {
        // Firefox support
        cursorPos = textDom.selectionStart;
      }
      return cursorPos;
    },
    //设置光标的位置
    setCaretPosition(textDom, pos) {
      if (textDom.setSelectionRange) {
        // IE Support
        textDom.focus();
        textDom.setSelectionRange(pos, pos);
      } else if (textDom.createTextRange) {
        // Firefox support
        var range = textDom.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select();
      }
    },
    //定义app调用的方法
    submitForm() {
      console.log(this.coverImg);
      console.log(this.title);
      console.log(this.text);
      let data = {
        title: this.title,
        content: this.text,
        detail: this.getDetail(this.text)
      };
      this.$post("发布地址", data).then(
        Response => {
          Toast(Response.message);
          if(Response.code==0){
             window.localStorage.setItem("publishId", "");
            window.dove.closePage();
          }
        }
      );
    },
    getDetail(html) {
      let re = new RegExp("<[^<>]+>", "g");
      let text = html.replace(re, "");
      //或
      //var text = html_str.replace(/<[^<>]+>/g,"");
      return text;
    }
  },
  mounted() {
    if (!window.localStorage.getItem("publishId")) {
      this.$post("发布id地址").then(res => {
        console.log(res);
        if (res.code == 0) {
          window.localStorage.setItem("publishId", res.data.id);
        }
      });
    }
  }
};
</script>
<style>
#app {
  width: 100vw;
  overflow-x: hidden;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /* margin-top: 60px; */
}
.tab-load {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 29px 52px;
}
.tab-load > span {
  font-size: 52px;
  color: rgba(73, 73, 73, 1);
  line-height: 73px;
}
.tab-load > i {
  width: 37px;
  height: 69px;
  display: block;
  background: #ddd;
}
.submit-load {
  display: flex;
  align-items: center;
}
.submit-load p {
  display: flex;
  align-items: center;
  font-size: 46px;
  font-weight: 600;
  color: rgba(58, 135, 230, 1);
  line-height: 65px;
}
.submit-load p:before {
  content: " ";
  display: inline-block;
  width: 40px;
  height: 38px;
  background: #ddd;
}
.dove-cover {
  position: relative;
  width: 1242px;
  height: 300px;
  overflow: hidden;
  background: rgba(246, 247, 249, 1);
}
.dove-cover .active {
  /* top: 90%;
  right: 10%; */
  top: 80%;
  left: 80%;
  transform: translate(-20%, -50%);
  padding: 10px;
  box-sizing: border-box;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  color: #fff;
}
.dove-cover img {
  width: 100%;
  height: auto;
}
.cover-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  color: rgba(201, 201, 201, 1);
  cursor: pointer;
}
.cover-btn:hover {
  color: rgba(175, 175, 175, 1);
}
.cover-btn input {
  display: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
.dove-title {
  width: 1242px;
  height: 190px;
  font-size: 52px;
  font-family: PingFangSC-Semibold;
  font-weight: 600;
  background: #ffffff;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
  padding: 62px 58px 55px 58px;
  box-sizing: border-box;
}
.dove-title input {
  border: none;
  width: 100%;
  font-size: 52px;
  font-family: PingFangSC-Semibold;
  font-weight: 600;
  color: rgba(175, 175, 175, 1);
  line-height: 73px;
  outline: none;
}
.dove-title input:focus {
  color: #000;
}
.dove-content {
  width: 1242px;
  height: 1580px;
  padding: 55px 70px;
  padding-bottom: 214px;
  box-sizing: border-box;
  outline: none;
}
.dove-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 1242px;
  height: 144px;
  display: flex;
  align-items: center;
  padding-left: 80px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px -4px 64px -8px rgba(160, 160, 160, 0.5);
  box-sizing: border-box;
}
.dove-footer .btn-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.dove-footer .btn-box .up-btn {
  cursor: pointer;
  margin-top: 9px;
  text-align: center;
  font-size: 28px;
  font-family: PingFang-SC-Medium;
  font-weight: 500;
  color: rgba(61, 61, 61, 1);
  line-height: 40px;
}
.dove-footer .btn-box .up-btn::after {
  margin-left: 4px;
  content: " ";
  display: block;
  width: 62px;
  margin-top: 9px;
  height: 58px;
  background: url("../../static/up_img.png") no-repeat;
  background-size: 100%;
}
.dove-footer .btn-box input {
  display: none;
  overflow: visible;
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}
</style>

