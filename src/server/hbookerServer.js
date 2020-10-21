import axios from "axios";
import crypto from "crypto";
import Vue from "vue";

import { localStorage as storage } from "../utils/webStorage";

const para = {
  app_version: "2.3.020",
  device_token: "ciweimao_powered_by_chiikin",
};
// 注意在manifest.json文件中添加权限，否则有跨域问题
// permissions:[""https://*/*"]

const ajax = axios.create({
  baseURL: "https://app.hbooker.com",
  timeout: 60000 * 10, //10分钟
  withCredentials: false,   ////跨域请求是否使用凭证
});

const vueInst = new Vue({});

ajax.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          error.message = "请求错误";
          break;
        case 401:
          error.message = "未授权，请登录";
          break;
        case 403:
          error.message = "拒绝访问";
          break;
        case 404:
          error.message = "请求地址出错";
          break;
        case 408:
          error.message = "请求超时";
          break;
        case 500:
          error.message = "服务器内部错误";
          break;
        case 501:
          error.message = "服务未实现";
          break;
        case 502:
          error.message = "网关错误";
          break;
        case 503:
          error.message = "服务不可用";
          break;
        case 504:
          error.message = "网关超时";
          break;
        case 505:
          error.message = "HTTP版本不受支持";
          break;
        default:
      }
    }
    return Promise.reject(error);
  }
);

// 添加请求拦截器
// ajax.interceptors.request.use(function (config) {
//   // 在发送请求之前做些什么
//   console.log('request', config);
//   return config;
// }, function (error) {
//   // 对请求错误做些什么
//   return Promise.reject(error);
// });

function decrypt(data, key) {
  if (key == null) {
    key = crypto
      .createHash("sha256")
      .update("zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn")
      .digest();
  } else {
    key = crypto
      .createHash("sha256")
      .update(key)
      .digest();
  }
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    new Uint8Array(16)
  );
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function login({ account, password }) {
  return new Promise((resolve, reject) => {
    ajax
      .get("/signup/login", {
        params: {
          login_name: account,
          passwd: password,
        },
      })
      .then((response) => {
        let data = decrypt(response.data.trim());
        var lastIndex = data.lastIndexOf("}");
        data = data.substr(0, lastIndex + 1);
        console.log("result", response.data, data);
        let json = JSON.parse(data);
        switch (json.code) {
          case 100000:
            //console.log("成功", json);
            //storage.setObject
            const accountInfo = storage.getObject("accountInfo", {});
            accountInfo.hbooker = {
              account,
              password,
              loginInfo: json.data,
            };
            storage.setObject("accountInfo", accountInfo);
            resolve(accountInfo.hbooker);
            break;
          case 200100:
            //console.log("error");
            //this.$router.push("/login");
            reject();
            break;
          default:
            //console.log("错误", json.tip);
            vueInst.$toast.fail({
              title: "错误",
              message: json.tip,
            });
            reject();
        }
      });
  });
}

function getLoginInfo() {
  const accountInfo = storage.getObject("accountInfo", {});
  return accountInfo.hbooker || {};
}

export default { login, getLoginInfo };
