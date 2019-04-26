<template>
  <div>
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

import vEditDiv from "./vEditDiv";
export default {
  name: "appLoad",
  data() {
    return {
      filesType:'',
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
      this.filesType=e.target.files[0].type;
      this.positionImg = e.target.getAttribute("name");
      this.validateImageFile(e.target.files);
    },
    createImage(file) {
      let that = this;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        let base64Img = e.target.result;
        let arr=base64Img.split(",");
        let currentFile=arr[1];
        console.log(arr[1]);
        this.imageUrl = e.target.result;
        let blobFile=(typeof currentFile === "string"
          ? that.convertToBlob(currentFile, that.filesType)
          : currentFile);
          console.log(blobFile);
        let formData = new FormData();
        formData.append('file',blobFile);
        formData.append('type',that.filesType);
        console.log(formData);
        that.$post('http://www.imuguang.com/api/upload/art/upload',formData).then(res=>{
            console.log(res);
        })
        if (this.positionImg !== "cover") {
          this.text += `<p class="img-box"><img src="${
            this.imageUrl
          }" style="margin:0 auto;margin-top:20px;"/></p><p class="edit-clear"> </p>`;
          this.submitForm();
        } else {
          that.firstUp = false;
          this.coverUrl = this.imageUrl;
        }
      };
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
    }
  }
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /* margin-top: 60px; */
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
  height: 1373px;
  padding: 55px 70px;
  margin-bottom: 144px;
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

