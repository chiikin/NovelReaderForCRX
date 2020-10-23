import axios from "axios";
import crypto from "crypto";
import Vue from "vue";

import { localStorage as storage } from "../utils/webStorage";
import identityManager from "./identityManager"

const para = {
  app_version: "2.6.011",
  device_token: "ciweimao_powered_by_chiikin",
};

const storageKeys = {
  bookshelf: "hbooker:bookshelfList",
};
const serverKey = "hbooker";
// 注意在manifest.json文件中添加权限，否则有跨域问题
// permissions:[""https://*/*"]

const ajax = axios.create({
  baseURL: "https://app.hbooker.com",
  timeout: 60000 * 10, //10分钟
  withCredentials: false, ////跨域请求是否使用凭证
  // `transformRequest` 允许在向服务器发送前，修改请求数据
  // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
  // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
  transformRequest: [function (data, headers) {
    // 对 data 进行任意转换处理
    if (data instanceof FormData || typeof data === "string") {
      return data;
    }
    if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
      return Object.keys(data).map(x => {
        return `${x}=${encodeURIComponent(data[x])}`;
      }).join('&');
    }
    else {
      if (!headers["Content-Type"])
        headers["Content-Type"] = "application/json";
      // 默认JSON
      return JSON.stringify(data);
    }
  }],

  // // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
  // transformResponse: [function (data) {
  //   // 对 data 进行任意转换处理
  //   console.log('resp', data, this);
  //   return data;
  // }],
});

const vueInst = new Vue({});


ajax.interceptors.response.use(
  (response) => {
    try {
      let data = decrypt(response.data.trim());
      var lastIndex = data.lastIndexOf("}");
      data = data.substr(0, lastIndex + 1);
      let json = JSON.parse(data);
      response.data = json;
      console.log('decrypt ok', response);
    } catch (e) {
      console.log('decrypt err', response);
    }
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

ajax.interceptors.request.use(function (config) {
  const identity = identityManager.getIdentity(serverKey) || {};
  const tokenPara = identity.tokenPara || {};
  config.params = Object.assign(config.params || {}, para, tokenPara);

  return config;
});

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

function commonResultHandle(response, httpHandle, resolve, reject, url, options) {
  let data = response.data || {};
  switch (data.code) {
    case 100000:
      resolve(data.data);
      break;
    case 200100:
      // 登录已过期
      if (!httpHandle) {
        return reject();
      }
      // 刷新token，如果成功则重新请求发起之前的请求，否则抛出异常
      refreshLoginToken().then(() => {
        httpHandle(url, options).then(resolve).catch(reject);
      }).catch(reject);
      break;
    default:
      //console.log("错误", json.tip);
      vueInst.$toast.fail({
        title: "错误",
        message: data.tip,
      });
      reject(data.tip);
  }
}

function refreshLoginToken() {
  const hbookerAccountInfo = getLoginInfo();
  if (hbookerAccountInfo.account && hbookerAccountInfo.password) {
    return login({
      account: hbookerAccountInfo.account,
      password: hbookerAccountInfo.password,
      isRetry: true
    });
  }
  else {
    return Promise.reject();
  }
}

const httpGet = function (url, options, isRetry) {
  return new Promise((resolve, reject) => {
    ajax
      .get(url, options)
      .then((response) => {
        //console.log(response);
        commonResultHandle(response, isRetry ? undefined : httpGet, resolve, reject, url, options);
      })
      .catch((err) => {
        vueInst.$toast.fail({
          title: "错误",
          message: "服务器错误，请稍后重试!",
        });
        reject("服务器错误，请稍后重试!");
      });
  });
}

const httpPost = function (url, options, isRetry) {
  return new Promise((resolve, reject) => {
    ajax
      .post(url, options.params, options)
      .then((response) => {
        //console.log(response);
        commonResultHandle(response, isRetry ? undefined : httpPost, resolve, reject, url, options);
      })
      .catch((err) => {
        vueInst.$toast.fail({
          title: "错误",
          message: "服务器错误，请稍后重试!",
        });
        reject("服务器错误，请稍后重试!");
      });
  });
}

function login({ account, password, isRetry }) {
  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {
      login_name: account,
      passwd: password,
    });
    httpGet("/signup/login", {
      params: params,
    }, isRetry)
      .then((data) => {
        const accountInfo = storage.getObject("accountInfo", {});
        accountInfo.hbooker = {
          account,
          password,
          loginInfo: data,
          tokenPara: {
            login_token: data.login_token,
            account: data.reader_info.account,
            reader_id: data.reader_info.reader_id
          }
        };
        storage.setObject("accountInfo", accountInfo);
        identityManager.setIdentity(serverKey, accountInfo.hbooker);
        resolve(accountInfo.hbooker);
      })
      .catch((err) => reject(err));
  });
}

/**
 * 从缓存的数据中恢复登录状态
 */
function recoverLoginStatus() {
  const accountInfo = storage.getObject("accountInfo", {});
  if (accountInfo.hbooker) {
    identityManager.setIdentity(serverKey, accountInfo.hbooker);
    return accountInfo.hbooker;
  }
  else {
    return false;
  }
}

function getLoginInfo() {
  const accountInfo = storage.getObject("accountInfo", {});
  return accountInfo.hbooker || {};
}
/**
 * 获取书架列表
 * @param {*} parma0 loginInfo:登录信息，refresh:是否从服务器刷新，否则从缓存中加载
 */
function getBookshelfList({ refresh }) {
  const bookshelfList = storage.getObject(storageKeys.bookshelf);
  if (!bookshelfList || refresh) {
    return new Promise((resolve, reject) => {
      httpGet("/bookshelf/get_shelf_list", {
        params: {},
      })
        .then((data) => {
          const ret = data.shelf_list.map((x) => {
            return {
              bookshelfId: x.shelf_id,
              bookshelfName: x.shelf_name,
              loaded: false,
              books: [],
            };
          });
          storage.setObject(storageKeys.bookshelf, ret);
          resolve(ret);
        })
        .catch((err) => {
          reject(err);
        });
    });
  } else {
    return Promise.resolve(bookshelfList);
  }
}

function getShelfBookList({ shelfId, refresh }) {

  const bookshelfList = storage.getObject(storageKeys.bookshelf);
  let bookshelf;
  if (bookshelfList) {
    const ret = bookshelfList.filter((x) => x.bookshelfId === shelfId);
    bookshelf = ret && ret.length > 0 ? ret[0] : undefined;
  }

  if (!refresh && bookshelf && bookshelf.loaded) {
    return Promise.resolve(bookshelf);
  }
  // 从服务器加载
  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {

      count: 999,
      shelf_id: shelfId,
      page: 0,
      order: "last_read_time",
    });
    httpGet("/bookshelf/get_shelf_book_list_new", {
      params: params,
    })
      .then((data) => {
        const books = data.book_list.map((book) => {
          const bookInfo = {
            bookId: book.book_info.book_id,
            bookName: book.book_info.book_name,
            author: book.book_info.author_name,
            cover: book.book_info.cover,
            date: book.book_info.last_chapter_info.uptime,
            totalWordCount: book.book_info.total_word_count,
            lastReadInfo: undefined,
            lastChapterInfo: {
              chapterId: book.book_info.last_chapter_info.chapter_id,
              chapterIndex: book.book_info.last_chapter_info.chapter_index,
              title: book.book_info.last_chapter_info.chapter_title,
              date: book.book_info.last_chapter_info.uptime,
            },
            // original: book
          };
          if (book.last_read_chapter_id) {
            bookInfo.lastReadInfo = {
              chapterId: book.last_read_chapter_id,
              title: book.last_read_chapter_title,
              date: book.last_read_chapter_update_time,
            };
          }
          return bookInfo;
        });

        bookshelf.books = books;
        bookshelf.loaded = true;
        storage.setObject(storageKeys.bookshelf, bookshelfList);

        resolve(bookshelf);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function clearStorage() { }

function getChapter({ bookId, chapterId }) {
  return new Promise((resolve, reject) => {
    getChapterKey({ bookId, chapterId })
      .then((command) => {
        getChapterContent({ bookId, chapterId, command })
          .then((data) => {
            let chapterInfo = data.chapter_info;
            if (Object.keys(chapterInfo).length != 0) {
              let contentTitle = chapterInfo.chapter_title;
              let contentText = chapterInfo.txt_content;
              let decryptContent = decrypt(contentText, command);
              const readingChapterInfo = {
                bookId: bookId,
                chapterId: chapterId,
                chapterIndex: "",
                title: contentTitle,
                loaded: false,
                content: decryptContent,
                original: data,
              };
              resolve(readingChapterInfo);
            } else {
              reject("");
            }
          })
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
}

function getChapterKey({ bookId, chapterId }) {

  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {
      chapter_id: "" + chapterId,
    });
    httpPost("/chapter/get_chapter_cmd", {
      params: params,
    })
      .then((data) => {
        resolve(data.command);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getChapterContent({ chapterId, command }) {

  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {
      chapter_id: "" + chapterId,
      chapter_command: command,
    });
    httpPost("/chapter/get_cpt_ifm", {
      params: params,
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export default {
  login,
  recoverLoginStatus,
  getLoginInfo,
  getBookshelfList,
  getShelfBookList,
  getChapter,
  clearStorage,
};
