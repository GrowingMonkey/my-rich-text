<template>
  <div>
    <div class="fixedClass">
      <div style="position: relative;top:0;">
        <div class="tab-load">
          <i @click="returnPage"></i>
          <span>编辑</span>
          <button class="submit-load" :disabled="isDisable" style="visibility:hidden">
            <p>发表</p>
          </button>
        </div>
        <div class="dove-cover">
          <img
            :src="cdnUrl+coverUrl+'?x-oss-process=image/resize,w_375,h_300,m_fill'"
            v-if="coverUrl"
            crossorigin="anonymous"
            :data-src="coverUrl"
          >
          <label class="cover-btn button is-danger" :class="{'active':!firstUp}">
            选择封面
            <input type="file" @change="onFileChange" accept="image/*" name="cover">
          </label>
        </div>
        <p class="dove-title" @click="changeStyle">
          <span :class="{'active':!boolStyle}">请输入标题</span>
          <input type="text" ref="title" v-model="title" maxlength="35">
        </p>
      </div>
    </div>
    <div class="dove-content" @click="changeStyle2" :style="{height:contentHeight}">
      <span :class="{'active':!boolStyle2}">请输入正文</span>
      <v-edit-div v-model="text" :on-ok="submitForm" :isdisable="isDisable"></v-edit-div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
// import OSS from 'ali-oss';
import { Toast,Dialog } from "vant";
import vEditDiv from "./vEditDiv";
import qs from "qs";
export default {
  name: "appLoad",
  data() {
    return {
      cdnUrl:'http://file-t.imuguang.com/',
      // cdnUrl:'https://aiyu-out.oss-cn-hongkong.aliyuncs.com/',//艾鱼
      toast: "",
      btncount: 0,
      filesType: "",
      firstUp: true,
      imageUrl: "",
      isDisable: false, //表单重复提交
      coverUrl: "",
      originUrl: "http://www.imuguang.com",
      //originUrl: "http://www.aiyu2019.com",//艾鱼
      coverImg: "",
      title: "",
      positionImg: "",
      times: 1,
      htmlContent: '<p style="color:rgba(175,175,175,1);">请输入正文</p>',
      text: "<p><br></p>",
      token: "",
      boolStyle: true,
      boolStyle2: true,
      contentHeight:'calc(100vh - 15.29791vw - 64.41224vw)',
      draftId:''
    };
  },
  components: {
    vEditDiv
  },
  mounted() {
    
    // this.coverUrl=`bg/${Math.floor(Math.random()*5)+1}.jpg`
    // this.token=JSON.parse(window.localStorage.header).token;
    let header = JSON.parse(window.localStorage.getItem("header"));
    if((!header.token)||header.token=='undefined'){
       Dialog.alert({
            message:'获取用户信息错误'
            }).then(() => {
              this.returnPage();
      });

    }
    let that=this;
    this.originUrl =window.location.origin.indexOf('www')>-1?'http://www.imuguang.com':'http://test.imuguang.com';
    //this.originUrl =window.location.origin.indexOf('www')>-1?'http://www.aiyu2019.com':'http://www.aiyu2019.com';//艾鱼
    if(this.$route.query.caogao_id){
      let draft_data=JSON.parse(window.localStorage.getItem('draft'));
      this.coverUrl=draft_data.bgpUrl||'';
      this.title=draft_data.title||'';
      this.detail=draft_data.detail||'';
      this.text=draft_data.content||'';
    }else{
      //自动获取最新草稿数据
      this.$fetch(that.originUrl + "/api/upload/art/draft/list").then(res => {
        if (res && res.code == 0) {
          let list= res.data.list||[];
          if(list.length!=0){
             that.coverUrl=list[0].bgpUrl;
             that.title=list[0].title;
             that.detail=list[0].detail;
             that.text=list[0].content;
             window.localStorage.setItem("draft_id",list[0].id);
             this.$nextTick(()=>{
                document.getElementById('edit-div').innerHTML=list[0].content;
                // this.value.length>10&&setInterval(function(){
                //   // that.onOk(true,3);
                // },5000)
            })
          }else{
            that.submitForm(true,3);
          }
        } 
      });
    }
  },
  methods: {
    clearMethod(){
      this.title='';
      this.coverUrl='';
      this.text="<p><br></p>";
    },
    GetRequest() {
      let url = window.location.search ? window.location.search : window.location.hash; //获取url中"?"符后的字串 
      if (url.indexOf('#') != -1) {
        url = url.slice(2);
      }
      let theRequest = new Object();
      if (url.indexOf("?") != -1) {
        let str = url.substr(1);
        let strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
      }
      return theRequest;
    },
    changeStyle() {
      this.boolStyle = false;
      this.$refs.title.focus();
    },
    changeStylef() {
      this.boolStyle = true;
      this.$refs.title.focus();
    },
    changeStyle2() {
      this.boolStyle2 = false;
    },
    changeStyle2f() {
      this.boolStyle2 = true;
    },
    //web直签上传oss；
    get_signature(signatureObj, file, fileType) {
      let accessid = signatureObj.accessKeyId;
      let accesskey = signatureObj.accessKeySecret;
      let token = signatureObj.securityToken;
      let time = signatureObj.expiration;
      let that = this;
      let body = signatureObj;
      console.log(body);
      let host = "https://f-bd.imuguang.com";
      // let host = "https://aiyu-out.oss-cn-hongkong.aliyuncs.com";//艾鱼
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
            // req.open("GET", `https://aiyu-out.oss-cn-hongkong.aliyuncs.com/${newFileName}`, true);//艾鱼
            req.send();
            req.onreadystatechange = function() {
              if (req.readyState == 4 && req.status == 200) {
                // 返回的结果，类型是 string
                if (that.positionImg !== "cover") {
                  that.text += `<p class="img-box"><img src="http://file-t.imuguang.com/${newFileName}" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
                  //that.text += `<p class="img-box"><img src="https://aiyu-out.oss-cn-hongkong.aliyuncs.com/${newFileName}" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;//艾鱼
                } else {
                  that.firstUp = false;
                  that.coverUrl = newFileName;
                  // that.contentHeight="calc(100vh - 15.29791vw - 64.41224vw)";
                }
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
            // req.open("GET", `https://aiyu-out.oss-cn-hongkong.aliyuncs.com/${newFileName}`, true);//艾鱼
            req.send();
            req.onreadystatechange = function() {
              if (req.readyState == 4 && req.status == 200) {
                // 返回的结果，类型是 string
                if (that.positionImg !== "cover") {
                  that.text += `<p class="img-box"><img src="http://file-t.imuguang.com/${newFileName}" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
                  // that.text += `<p class="img-box"><img src="https://aiyu-out.oss-cn-hongkong.aliyuncs.com/${newFileName}" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;//艾鱼
  
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
            if (res.code == 0) {
              window.localStorage.setItem("publishId", res.data.id);
              reject(res);
            } else {
              reject(res);
            }
          });
        } else {
          reject({ code: 0 });
        }
      });
    },
    returnPage() {
      if (
        navigator.userAgent.indexOf("Android") > -1 ||
        navigator.userAgent.indexOf("Adr") > -1
      ) {
        if (this.times != 1) {
          window.location.href = "jsbridge://www.imuguang.com/timeClose";
          //window.location.href = "jsbridge://www.aiyu2019.com/timeClose";//艾鱼
        }
        // alert(window.dove.closePage);
        else {
          window.dove.closePage();
        }
      } else {
        //   window.webkit.messageHandlers.方法名(与注册的一致(message.name) ).postMessage(JS传下来的数据(message.body))
        //    data 可以是数组 字典 json字符串.....
        //   window.webkit.messageHandlers.testAction.postMessage(data)
        window.webkit.messageHandlers.closePage.postMessage("这是前端传值");
      }
    },
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
      let that = this;
      this.positionImg = e.target.getAttribute("name");
      this.filesType = e.target.files[0].type;
      let file = e.target.files[0];
      let imgStr = /\.(jpg|jpeg|png|bmp|BMP|JPG|PNG|JPEG)$/;
      if (!imgStr.test(file.name)) {
        alert("文件不是图片类型");
        return false;
      }
      that.toast = Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "上传中"
      });
      let reader = new FileReader();
      //file转base64
      reader.readAsDataURL(file);
      reader.onload = function(e) {
        let base64Img = e.target.result;
        let arr = base64Img.split(",");
        let currentFile = arr[1];
        this.imageUrl = e.target.result;
        //图片转blob
        let blobFile =
          typeof currentFile === "string"
            ? that.convertToBlob(currentFile, that.filesType)
            : currentFile;
        //获取发布id
        that.getpublishId().then(res => {
          if (res.code != 0) {
            // alert("服务端错误");
            Dialog.alert({
            title: '服务端错误',
            message:res.message
            })
            Toast.clear();
            that.returnPage();
          }
          //获取上传oss秘钥
          that
            .$post(`${that.originUrl}/api/upload/pic/getSTSToken`)
            .then(res => {
              if(res['code']!=0){
                Toast({ message: '上传失败', duration: 1000 });
              }else{

              let store = JSON.parse(res.data);
              console.log(store);
              //oss直传
              let fileType = "." + file.name.split(".")[1];
              that.get_signature(store, file, fileType);
              }
              // let client = new OSS.Wrapper({
              //   accessKeyId: store.accessKeyId,
              //   accessKeySecret: store.accessKeySecret,
              //   stsToken: store.securityToken,
              //   endpoint: "http://oss-cn-shenzhen.aliyuncs.com",
              //   bucket: "imuguang-file"
              // });
              // let snowFileName = that.uuid();
              // let fileType = "." + file.name.split(".")[1];
              // let reader2 = new FileReader();
              // //blob转bufffer
              // reader2.readAsArrayBuffer(blobFile);
              // reader2.onload = function(e) {
              //   let buffer = new OSS.Buffer(event.target.result);
              //   //上传
              //   alert(2);
              //   alert(JSON.stringify(client));
              //   console.log(JSON.stringify(client));
              //   alert(JSON.stringify(client.put));
              //   client.put(`img/${snowFileName}${fileType}`, buffer).then(results => {
              //       console.log(232);
              //       alert(JSON.stringify(results));
              //       if (results.res.status == 200) {
              //         let url=results.res.requestUrls[0];
              //         url=url.replace(/http:\/\/[^\/]*\//, "");
              //         if (that.positionImg !== "cover") {
              //           that.text += `<p class="img-box"><img src="http://file-t.imuguang.com/${
              //             url
              //           }" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
              //         } else {
              //           that.firstUp = false;
              //           that.coverUrl = url;
              //         }
              //         Toast("上传成功");
              //       }
              //     }).catch(err=>{
              //       console.log(err);
              //     });
              // };
            });
        });
      };
    },
    //base64转blob
    dataURItoBlob(base64Data) {
      var byteString;
      if (base64Data.split(",")[0].indexOf("base64") >= 0) {
        byteString = atob(base64Data.split(",")[1]);
      } else {
        byteString = unescape(base64Data.split(",")[1]);
        var mimeString = base64Data
          .split(",")[0]
          .split(":")[1]
          .split(";")[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
      }
      return new Blob([ia], { type: mimeString });
    },
    createImage(file) {
      let that = this;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        let base64Img = e.target.result;
        let arr = base64Img.split(",");
        let currentFile = arr[1];
        this.imageUrl = e.target.result;
        let blobFile =
          typeof currentFile === "string"
            ? that.convertToBlob(currentFile, that.filesType)
            : currentFile;
        this.getpublishId().then(res => {
          if (res.code != 0) {
            Dialog.alert({
            title: '服务端错误',
            message:res.message
            })
            Toast.clear();
            that.returnPage();
          }
          that
            .$post(`${that.originUrl}/api/upload/pic/getSTSToken`)
            .then(res => {
              let store = JSON.parse(res.data);
              let client = new OSS.Wrapper({
                accessKeyId: store.accessKeyId,
                accessKeySecret: store.accessKeySecret,
                stsToken: store.securityToken,
                endpoint: "http://oss-cn-shenzhen.aliyuncs.com",
                bucket: "imuguang-file"
              });
              console.log(store);
              console.log(blobFile);
              const readers = new FileReader();
              readers.readAsArrayBuffer(blobFile);
              readers.onload = function(event) {
                const buffer = new OSS.Buffer(event.target.result);
                client.put("img/dsd.png", buffer).then(re => {
                  console.log(re);
                });
              };
              // let result=client.put('dsd.png',blobFile);
              // console.log(a);
            });
          // that.upImage("http://www.imuguang.com/api/upload/art/upload", formData).then(res => {
          //     console.log(res);
          //     if (res.code == 0) {
          //       if (that.positionImg !== "cover") {
          //         that.text += `<p class="img-box"><img src="${
          //           res.data.displayUrl
          //             ? "http://www.imuguang.com/img/" + res.data.displayUrl
          //             : that.imageUrl
          //         }" style="margin:0 auto;margin-top:20px;width:100%;"/></p><p class="edit-clear"> </p>`;
          //       } else {
          //         that.firstUp = false;
          //         that.coverUrl = `${
          //           res.data.displayUrl
          //             ? "http://www.imuguang.com/img/" + res.data.displayUrl
          //             : that.imageUrl
          //         }`;
          //       }
          //       Toast(res);
          //     }
          //   });
        });
      };
    },
    // async multipartUpload(client,file) {

    //     try {
    //       let result = await client.multipartUpload('dsda.png',file);
    //       console.log(result);
    //     } catch(e){
    //       console.log(e);
    //     }
    // },
    upImage(url, data) {
      return new Promise((resolve, reject) => {
        let ids = window.localStorage.getItem("publishId");

        let appHeaders = JSON.parse(window.localStorage.getItem("header"));

        let otherHeader = {
          "Content-Type": "multipart/form-data",
          "publish-id": ids
          // "user_agent":appHeaders.user_agent
        };
        let currentHearder = Object.assign(appHeaders, otherHeader);

        axios({
          url: url,
          method: "post",
          data: data,
          headers: currentHearder
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
    removeHtmlStyle(html){
      let reg= /style="[^=>]*"([(\s+\w+=)|>])/g;
      let newHtml='';
      if(html){
        newHtml=html.replace(reg,'$1');
      }
      return newHtml;
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
    // //定义app调用的方法
    submitForm(val,type) {
      if(type=='clear'){
        this.clearMethod();
        return;
      }
      this.isDisable=val;
      let commit_url='/art/commit';
      if(type==1){
        commit_url='/art/commit';

      }else{
        commit_url='/art/draft/change'
      }
      let that = this;
      that.isDisable = true;
      this.getpublishId().then(res => {
        if (res.code != 0) {
          Dialog.alert({
            title: '服务端错误',
            message:res.message
            })
          that.returnPage();
        } else {
          if (type==1&&!that.title) {
            Toast({ message: "请输入标题", duration: 1000 });
            that.isDisable = false;
            return;
          }
          if (that.text == "<p> </p>") {
            that.isDisable = false;
            Toast({ message: "请输入内容", duration: 1000 });
            return;
          }
          let detail = that.getDetail(that.text).substring(0, 100);
          console.log(detail);
          if (type==1&&detail.replace(/\s/g, "") == "") {
            Toast({ message: "请输入文字", duration: 1000 });
            that.isDisable = false;
            return;
          }
          type!=3&&Toast.loading({
        duration: 100, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "发布中"
      });
          let data = {
            bgpUrl:
              that.coverUrl && that.coverUrl !== ""
                ? that.coverUrl
                : `bg/${Math.floor(Math.random() * 5) + 1}.jpg`,
            title: that.title,
            content: that.removeHtmlStyle(that.text.replace('/<a>/g','<p>').replace('/<\/a>/g','</p>').replace(/\n/g, "<br/>")),
            detail: that.getDetail(that.text).substring(0, 100)
          };
          if(this.$route.query.caogao_id&&type!=1){
            data.id=this.$route.query.caogao_id;
          }
          if(window.localStorage.getItem('draft_id')&&type==3){
            data.id=that.draftId||window.localStorage.getItem('draft_id');
          }
          that
            .$post(`${that.originUrl}/api/upload${commit_url}`, data)
            .then(Response => {
              if (Response.code == 0&&type==1) {//1为发布
                window.localStorage.setItem("publishId", "");
                window.localStorage.removeItem("draft_id");
                  //删除草稿
                  let data={ids:that.draftId};
                  this.$post(that.originUrl + "/api/upload/art/draft/del",data).then(res=>{
                    console.log(res);
                    if(res&&res.code==0){
                        //关闭页面
                         that.returnPage();
                    }
                  })
                that.times += 1;
              } else if(Response.code == 0&&type==3){//3为保存草稿
                that.draftId=Response.data.id;
                 window.localStorage.setItem("publishId", "");
                 window.localStorage.setItem("draft_id",Response.data.id);
              }else{
                 window.localStorage.setItem("publishId", "");
                Toast({ message: Response.message, duration: 1000 });
              }
              that.isDisable = false;
            });
        }
      });
    },
    getDetail(html) {
      let re = new RegExp("<[^<>]+>", "g");
      let text = html.replace(re, "");
      if (text == "") {
        Toast({ message: "请输入文字", duration: 1000 });
      }
      //或
      //var text = html_str.replace(/<[^<>]+>/g,"");
      return text;
    }
  },
  watch: {
    // text(newV,oldV){
    //   if(newV===''){
    //     this.text='<p><br></p>'
    //   }
    //   if(newV.indexOf('<p>')==-1){
    //     this.text='<p>'+newV+'</p>';
    //   }
    // }
    title(newv, oldv) {
      if (newv == "" && oldv != "") {
        // this.changeStylef();
      } else {
        this.changeStyle();
      }
    },
    text(newv, oldv) {
      if (
        (newv == "<p><br></p>" && oldv != "") ||
        (newv == "" && oldv == "<p><br></p>")
      ) {
        // this.changeStyle2f();
      } else {
        this.changeStyle2();
      }
    }
  }
};
</script>
<style>
.fixedClass{
  overflow: hidden;
}
.fixedClass::after{
   clear: both;
   display: block;
   content: '';
}
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
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 29px 52px;
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
.submit-load p:before {
  visibility: hidden;
  content: " ";
  display: inline-block;
  width: 40px;
  height: 38px;
  margin-right: 14px;
  background: url("../../static/fasong.svg");
  background-size: 100%;
}
.dove-cover {
  position: relative;
  width: 1242px;
  /* height: 600px; */
  height: 600px;
  /* min-height: 300px;
  max-height: 800px; */
  overflow: hidden;
  background: rgba(246, 247, 249, 1);
}
.dove-cover .active {
  /* top: 90%;
  right: 10%; */
  background: rgba(0, 0, 0, 0.5);
  width:200px;
  font-size: 40px;
  top: 80%;
  left: 80%;
  transform: translate(-20%, -50%);
  padding: 18px;
  box-sizing: border-box;
  color: #000;
  /* border: 1px solid #ddd; */
  border-radius: 10px;
  cursor: pointer;
  color: #fff !important;
}
.dove-cover img {
  width: 100%;
  height: auto;
}
.cover-btn {
  position: absolute;
  width: 100vw;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 180px;
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
  width: 100vw;
  height: 190px;
  padding-left: 70px;
  padding-right: 10px;
  font-size: 52px;
  font-family: PingFangSC-Semibold;
  font-weight: 600;
  background: #ffffff;
  border-bottom: 1px solid rgba(216, 216, 216, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.dove-title span {
  /* height: 100%; */
  line-height: 2.5;
  font-size: 73px;
  color: rgba(201, 201, 201, 1);
  position: absolute;
  top: 50%;
   transform: translate(0, -50%);
  /* display: block; */
}
.dove-title .active {
  display: none;
}
.dove-title input {
  border: none;
  display: inline-block;
  margin: 0;
  padding-left:1px !important;
  width: 100%;
  /* height: 73px; */
  font-size: 73px;
  -webkit-appearance: none;
  font-family: PingFangSC-Semibold;
  font-weight: 600;
  color: #000;
  /* line-height: 1; */
  outline: none;
  line-height: 73px;
  background: #fff;
  box-sizing: border-box;
  font-size: 73px;
}
.dove-title input:focus {
  color: #000;
}
.dove-content {
  position: relative;
  width: 1242px;
  /* height: 1580px; */
  padding: 42px 70px;

  padding-bottom: 110px;
  box-sizing: border-box;
  outline: none;
}
.dove-content > span {
  position: absolute;
  color: rgba(201, 201, 201, 1);
  font-size: 52px;
  line-height: 1.5;
}
.dove-content > .active {
  display: none;
}
.dove-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 1242px;
  height: 144px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 80px;
  padding-right: 80px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px -4px 64px -8px rgba(160, 160, 160, 0.5);
  box-sizing: border-box;
}
.dove-footer .btn-box {
  display: flex;
  /* width:100%; */
  height:100%;
  flex-direction: column;
  align-items: center;
  justify-content:center;
  background:none;
  border:none;
  position: relative;
}
.dove-footer .btn-box .up-btn {
  cursor: pointer;
  margin-top: 9px;
  background:none;
  border:none;
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
  width: 68px;
  /* margin-top: 9px; */
  height: 63px;
  background: url("https://f-bd.imuguang.com/wh/static/img/send_icon.png") no-repeat;
  /* background: url("https://aiyu-out.oss-cn-hongkong.aliyuncs.com/wh/static/img/send_icon.png") no-repeat; 艾鱼 */
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

