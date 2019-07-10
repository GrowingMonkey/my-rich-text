<template>
  <div style="width:100%;height:100%">
    <div
      class="edit-div"
      :contenteditable="canEdit"
      @focus="focusE"
      ref="edit"
      @click="point"
      @blur="blurE"
      @input="changeText"
    ></div>
    <div style="clear:both"></div>
    <div class="dove-footer">
      <div class="btn-box">
        <button class="up-btn" @click="uploadImg">
          <input
            type="file"
            accept="image/*"
            @change="onFileChange"
            name="imgContent"
            ref="uploadinput"
            multiple
          />
        </button>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import axios from "axios";
import { Toast } from "vant";
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
    }
  },
  data() {
    return {
      originUrl: "http://www.imuguang.com",
      innerText: this.value,
      isLocked: false,
      lastpoint: 0,
      editorRange: null,
      editorNode: null
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
    point() {
      if (window.getSelection) {
        //ie11 10 9 ff safari
        this.$refs.edit.focus(); //解决ff不获取焦点无法定位问题
        // let range = window.getSelection(); //创建range
        // let offset=range.focusOffset;
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
          this.$post(that.originUrl + "/api/upload/art/publish").then(res => {
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
    getOssKey() {
      let that = this;
      return that.$post(`${that.originUrl}/api/upload/pic/getSTSToken`);
    },
    get_signature(signatureObj, file, fileType) {
      console.log(file);
      let accessid = signatureObj.accessKeyId;
      let accesskey = signatureObj.accessKeySecret;
      let token = signatureObj.securityToken;
      let time = signatureObj.expiration;
      let that = this;
      let body = signatureObj;
      console.log(body);
      let host = "http://imuguang-file.oss-cn-shenzhen.aliyuncs.com";
      let policyText = {
        expiration: time, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
        conditions: [
          ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
        ]
      };
      // let callbackbody=(res)=>{
      //   console.log(res);
      // }
      let policyBase64 = Base64.encode(JSON.stringify(policyText));
      let message = policyBase64;
      console.log(message);
      console.log(accesskey);
      let bytes = Crypto.HMAC(Crypto.SHA1, message, accesskey, {
        asBytes: true
      });
      console.log(bytes);
      let signature = Crypto.util.bytesToBase64(bytes);
      let newFileName = `img/${that.uuid()}${fileType}`;
      //组装发送数据
      let request = new FormData();
      request.append("name", `${file.name}`);
      request.append("key", newFileName);
      request.append("OSSAccessKeyId", accessid); //Bucket 拥有者的Access Key Id。
      request.append("x-oss-security-token", token); //Bucket 拥有者的Access Key Id。
      request.append("policy", policyBase64); //policy规定了请求的表单域的合法性
      request.append("Signature", signature); //根据Access Key Secret和policy计算的签名信息，OSS验证该签名信息从而验证该Post请求的合法性
      //---以上都是阿里的认证策略
      // request.append("key", 'img/g_object_name'); //文件名字，可设置路径
      request.append("success_action_status", "200"); // 让服务端返回200,不然，默认会返回204
      request.append("file", file); //需要上传的文件 file
      // request.append("callback", callbackbody);
      axios({
        url: host,
        method: "post",
        data: request,
        headers: {
          "content-type": "multipart/form-data"
        }
      })
        .then(res => {
          if (res) {
            var req = null;
            if (window.XMLHttpRequest) {
              req = new XMLHttpRequest();
            } else {
              req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            req.open("GET", `http://file-t.imuguang.com/${newFileName}`, true);
            req.send();
            req.onreadystatechange = function() {
              if (req.readyState == 4 && req.status == 200) {
                // 返回的结果，类型是 string
                that.execCommand('insertimage',`http://file-t.imuguang.com/${newFileName}`);
                Toast.clear();
              } else {
                // Toast("上传失败");
                // Toast({ message: '上传失败', duration: 1000 });
              }
            };
          }
        })
        .catch(err => {
          if (err) {
            var req = null;
            if (window.XMLHttpRequest) {
              req = new XMLHttpRequest();
            } else {
              req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            req.open("GET", `http://file-t.imuguang.com/${newFileName}`, true);
            req.send();
            req.onreadystatechange = function() {
              if (req.readyState == 4 && req.status == 200) {
                // 返回的结果，类型是 string
                if (that.positionImg !== "cover") {
                  that.text += `<p class="img-box"><img src="http://file-t.imuguang.com/${newFileName}" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
                } else {
                  that.firstUp = false;
                  that.coverUrl = newFileName;
                  // that.contentHeight="calc(100vh - 15.29791vw - 64.41224vw);";
                }
                Toast.clear();
              } else {
                // Toast("上传失败");
                Toast.clear();
                //           that.toast=Toast({
                //   duration: 2000, // 持续展示 toast

                //   message: "上传失败"
                // });
              }
            };
          }
        });
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
    onFileChange(e) {
      let that = this;
      let file = e.target.files;
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
              let filesType=curfile.type;
              reader.onload = e => {
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
      this.$emit("input", this.$refs.edit.innerHTML);
      if (this.$refs.edit.innerHTML == "") {
        let newP = document.createElement("p");
        let newB = document.createElement("br");
        newP.appendChild(newB);
        this.$refs.edit.appendChild(newP);
      }
    },
    execCommand(name, args = null) {
      document.execCommand(name, false, args);
    },
    focusE() {
      // alert(2);
      window.scrollTo(0, 0);
      this.isLocked = true;
      console.log(this.$refs.edit);
      this.keepLastIndex(this.$refs.edit);
      this.$refs.edit.scrollTop = this.$refs.edit.scrollHeight;
    },
    blurE() {
      // alert(3);
      window.scrollTo(0, 0);
      this.isLocked = false;
    },
    keepLastIndex(obj) {
      // console.log(obj.value.length);
      if (window.getSelection) {
        //ie11 10 9 ff safari
        obj.focus(); //解决ff不获取焦点无法定位问题
        let range = window.getSelection(); //创建range
        let offset = range.focusOffset;
        console.log(offset);
        range.selectAllChildren(obj); //range 选择obj下所有子内容
        console.log(range);
        // if(this.$refs.edit.innerHTML==''||this.$refs.edit.innerHTML=='<p><br/></p>'){
        range.collapseToEnd();
        // }else{
        // range.Selection.removeRange();
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
    this.originUrl =
      window.location.origin.indexOf("www") > -1
        ? "http://www.imuguang.com"
        : "http://test.imuguang.com";
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
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
  width: 100% !important;
  text-align: center !important;
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
.edit-div h1.5 {
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