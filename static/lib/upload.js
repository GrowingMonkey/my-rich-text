import {
  post,
  fetch,
  patch,
  put
} from '../../src/request'
import configuration from "../../src/utils/utils";
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
import OSS from "ali-oss";
let ossClient={};
const setOssClient=(val)=>{
    ossClient=val;
}
const getOssClient=()=>{
    return ossClient;
}
/**
 * file上传文件
 * callback  回调函数(该会掉函数需要返回oss的bucket,endpoint,和filename)
 */
export async function upload(file,callback) {
  //获取签名
  let sign = await getSign();
  let {data}=sign;
  let dataObj = JSON.parse(data);
  let callbackObj=callback();
  let clientOss = new OSS({
    accessKeyId: dataObj.accessKeyId,
    accessKeySecret: dataObj.accessKeySecret,
    stsToken: dataObj.securityToken,
    endpoint: callbackObj?callbackObj.VUE_APP_ENDPOINT:VUE_APP_ENDPOINT,
    bucket: callbackObj?callbackObj.VUE_APP_BUCKET:VUE_APP_BUCKET2
  });
  //设置oss对象
  setOssClient(clientOss);
  let temporary = file.name.lastIndexOf(".");
  let fileNameLength = file.name.length;
  let fileFormat = file.name.substring(temporary + 1, fileNameLength); //png
  let fileName=callbackObj&&callbackObj.fileName?callbackObj.fileName+'.'+fileFormat:file.name;//在callback获取文件名
  return new Promise((resolve,reject)=>{
    multipartUploadWithSts(fileName, file).then(res=>{
        resolve(res);
    }).catch(function(err){
        reject(err);
    });
  })
}
/**
 * storeAs //文件名或路径
 * file  //上传文件
 */
const multipartUploadWithSts = (storeAs, file, cpt) => {
  let clientOss=getOssClient();
  return multitest(clientOss, storeAs, file, cpt)
}
async function multitest(ossClient, storeAs, file, cpt){
  var checkpoint_temp;
  if (cpt) {
    console.log("multitest with cpt");
   return ossClient
      .multipartUpload(storeAs, file, {
        parallel: 2,
        checkpoint: cpt,
        progress: function(percent, cpt) {
          console.log("Progress: " + percent);
          checkpoint_temp = cpt;
        }
      })
      .then(function (result) {
        console.log(result);
        return result
      })
      .catch(function (err) {

        console.log(err);
        multipartUploadWithSts(storeAs, file, checkpoint_temp);
      });
  } else {
    console.log("multitest without cpt");
    let selfObj={};
    return ossClient
      .multipartUpload(storeAs, file, {
        parallel: 2,
        progress: function(percent, cpt) {
          console.log("Progress: " + percent);
          selfObj.percent=percent;
          checkpoint_temp = cpt;
        }
      })
      .then(function (result) {
        console.log(result);
        return result;
      })
      .catch(function (err) {
        console.log(err);
        multipartUploadWithSts(storeAs, file, checkpoint_temp);
      });
  }
}
const getToken = () => {
  let Token = window.localStorage.getItem('token');
  return Token;
}
const getSign = () => {
  return post(`${VUE_APP_BASEURL}/${
        NODE_ENV == "aiyu" ? "api" : "api"
      }/upload/pic/getSTSToken`)
}
