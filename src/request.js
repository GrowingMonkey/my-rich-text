import axios from 'axios';
import qs from 'qs';
import JSONbig from 'json-bigint';
const originUrl=window.location.origin.indexOf('www')>-1?'http://www.imuguang.com':'http://test.imuguang.com';
//const originUrl=window.location.origin.indexOf('www')>-1?'http://www.aiyu2019.com':'http://www.aiyu2019.com';//艾鱼
axios.defaults.timeout = 5000;
axios.defaults.baseURL = `${originUrl}/api/user`;
// axios.defaults.baseURL = 'http://192.168.1.107:9090/user';
axios.defaults.transformResponse=function (data) {
  // 对 data 进行任意转换处理
  return JSONbig.parse(data);
},
//http request 拦截器
axios.interceptors.request.use(
  config => {
    let headers = JSON.parse(window.localStorage.getItem("header"));
    let id=window.localStorage.getItem("publishId");
    // const token = getCookie('名称');注意使用的时候需要引入cookie方法，推荐js-cookie
    // config.data = JSON.stringify(config.data);
    let typeObj={
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    if(window.localStorage.getItem("header")){
      config.headers = Object.assign(headers,typeObj);
    }else{
      config.headers=typeObj;
    }
    console.log(config.headers);
    if(id){
      config.headers['publish-id']=id;
      // alert(JSON.stringify(config.headers));
    }
    return config;
  },
  error => {
    return Promise.reject(err);
  }
);


//http response 拦截器
axios.interceptors.response.use(
  response => {
    console.log(response);
    if (response.data.errCode == 2) {
      router.push({
        path: "/login",
        querry: {
          redirect: router.currentRoute.fullPath
        } //从哪个页面跳转
      })
    }
    return response;
  },
  error => {
    return error;
  }
)


/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function fetch(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
        params: params
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(err => {
        reject(err)
      })
  })
}


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, qs.stringify(data))
      .then(response => {
        console.log(response.data);
        resolve(response.data);
      }, err => {
        reject(err)
      })
  })
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function patch(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.patch(url, data)
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err)
      })
  })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data)
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err)
      })
  })
}
