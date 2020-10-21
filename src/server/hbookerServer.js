import axios from "axios";
import crypto from "crypto";
import Vue from "vue";

import { localStorage as storage } from "../utils/webStorage";

const para = {
  app_version: "2.3.020",
  device_token: "ciweimao_powered_by_chiikin",
};

const storageKeys = {
  bookshelf: "hbooker:bookshelfList"
}
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
    try {
      let data = decrypt(response.data.trim());
      var lastIndex = data.lastIndexOf("}");
      data = data.substr(0, lastIndex + 1);
      let json = JSON.parse(data);
      response.data = json;
    }
    catch (e) {

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

function httpGet(url, options) {
  return new Promise((resolve, reject) => {
    ajax
      .get(url, options)
      .then((response) => {
        let json = response.data || {};
        switch (json.code) {
          case 100000:
            resolve(json.data);
            break;
          // case 200100:
          //   //console.log("error");
          //   //this.$router.push("/login");
          //   reject();
          //   break;
          default:
            //console.log("错误", json.tip);
            vueInst.$toast.fail({
              title: "错误",
              message: json.tip,
            });
            reject();
        }
      }).catch(err => {
        vueInst.$toast.fail({
          title: "错误",
          message: "服务器错误，请稍后重试!",
        });
        reject();
      });;
  })
}

function login({ account, password }) {
  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {
      login_name: account,
      passwd: password,
    });
    httpGet("/signup/login", {
      params: params
    }).then((data) => {
      const accountInfo = storage.getObject("accountInfo", {});
      accountInfo.hbooker = {
        account,
        password,
        loginInfo: data,
      };
      storage.setObject("accountInfo", accountInfo);
      resolve(accountInfo.hbooker);
    }).catch(err => reject(err));
  });
}

function getLoginInfo() {
  const accountInfo = storage.getObject("accountInfo", {});
  return accountInfo.hbooker || {};
}
/**
 * 获取书架列表
 * @param {*} parma0 loginInfo:登录信息，refresh:是否从服务器刷新，否则从缓存中加载
 */
function getBookshelfList({ accountInfo, refresh }) {
  const { loginInfo } = accountInfo;
  const bookshelfList = storage.getObject(storageKeys.bookshelf)
  if (!bookshelfList || refresh) {
    return new Promise((resolve, reject) => {
      let params = Object.assign({}, para, {
        login_token: loginInfo.login_token,
        account: loginInfo.reader_info.account
      })
      httpGet('/bookshelf/get_shelf_list', {
        params: params
      }).then(data => {
        const ret = data.shelf_list.map(x => {
          return {
            bookshelfId: x.shelf_id,
            bookshelfName: x.shelf_name,
            loaded: false,
            books: []
          };
        });
        storage.setObject(storageKeys.bookshelf, ret);
        resolve(ret);
      }).catch(err => {
        reject(err);
      });
    });
  }
  else {
    return Promise.resolve(bookshelfList);
  }
}

function getShelfBookList({ accountInfo, shelfId, refresh }) {
  const { loginInfo } = accountInfo;
  const bookshelfList = storage.getObject(storageKeys.bookshelf);
  let bookshelf;
  if (bookshelfList) {
    const ret = bookshelfList.filter(x => x.bookshelfId === shelfId);
    bookshelf = ret && ret.length > 0 ? ret[0] : undefined;
  }

  if (!refresh && bookshelf && bookshelf.loaded) {
    return Promise.resolve(bookshelf);
  }
  // 从服务器加载
  return new Promise((resolve, reject) => {
    let params = Object.assign({}, para, {
      login_token: loginInfo.login_token,
      account: loginInfo.reader_info.account,
      count: 999,
      shelf_id: shelfId,
      page: 0,
      order: 'last_read_time'
    })
    httpGet('/bookshelf/get_shelf_book_list_new', {
      params: params
    }).then(data => {
      const books = data.book_list.map(book => {
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
            date: book.book_info.last_chapter_info.uptime
          },
          original: book
        };
        if (book.last_read_chapter_id) {
          bookInfo.lastReadInfo = {
            chapterId: book.last_read_chapter_id,
            title: book.last_read_chapter_title,
            date: book.last_read_chapter_update_time
          };
        }
        return bookInfo;
      });

      bookshelf.books = books;
      bookshelf.loaded = true;
      storage.setObject(storageKeys.bookshelf, bookshelfList);

      resolve(bookshelf);
    }).catch(err => {
      reject(err);
    });
  });
}

function clearStorage() {

}

export default { login, getLoginInfo, getBookshelfList, getShelfBookList, clearStorage };
