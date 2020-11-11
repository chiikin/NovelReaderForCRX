import axios from "axios";
import crypto from "crypto";
import moment from "moment";

import { openUserDB } from "./hbookerdb";

import { localStorage as storage } from "../utils/webStorage";
const para = {
  app_version: "2.6.019",
  device_token: "ciweimao_powered_by_chiikin", //"ciweimao_867401041011125"//
};

const storageKeys = {
  session: "hbookerSession",
  bookshelf: "hbooker:bookshelfList",
  bookChapters: "hbooker:bookChapters",
};
const serverKey = "hbooker";

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

const dateFormat = "YYYY-MM-DD HH:mm:ss";
function getNowString() {
  return moment().format();
}
/**
 * 判断目标时间是否过期
 * @param {string} compareDate
 * @param {*} intervalSeconds 有效间隔时间，单位：秒。默认1小时
 */
function isExpire(compareDate, intervalSeconds) {
  const date = moment(compareDate, dateFormat);
  return date.diff(new Date(), "seconds") > intervalSeconds;
}

export default class HbookerService {
  constructor() {
    this.initAjax();
    this.session = undefined; //登录会话
    this.db = undefined;
  }
  //#region 私有方法
  initAjax() {
    const _this = this;
    const ajax = axios.create({
      baseURL: "https://app.hbooker.com",
      timeout: 60000 * 10, //10分钟
      withCredentials: false, ////跨域请求是否使用凭证
      // headers: {
      //   "User-Agent": "Android  com.kuangxiangciweimao.novel  2.6.019",
      // },
      // `transformRequest` 允许在向服务器发送前，修改请求数据
      // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
      // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
      transformRequest: [
        function(data, headers) {
          // 对 data 进行任意转换处理
          if (data instanceof FormData || typeof data === "string") {
            return data;
          }
          if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
            return Object.keys(data)
              .map((x) => {
                return `${x}=${encodeURIComponent(data[x])}`;
              })
              .join("&");
          } else {
            if (!headers["Content-Type"])
              headers["Content-Type"] = "application/json";
            // 默认JSON
            return JSON.stringify(data);
          }
        },
      ],
    });

    this.ajax = ajax;

    ajax.interceptors.response.use(
      (response) => {
        try {
          let data = decrypt(response.data.trim());
          let lastIndex = data.lastIndexOf("}");
          data = data.substr(0, lastIndex + 1);
          let json = JSON.parse(data);
          response.data = json;
          console.log("decrypt ok", response);
        } catch (e) {
          console.log("decrypt err", response);
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

    ajax.interceptors.request.use(function(config) {
      //const identity = identityManager.getIdentity(serverKey) || {};
      const { session } = _this;
      let tokenPara = {};
      if (session) {
        const token = session.raw ? session.raw.login_token : undefined;
        tokenPara = {
          login_token: token,
          account: session.tokenAccount,
        };
      }

      if (config.method === "post") {
        config.data = Object.assign(config.data || {}, para, tokenPara);
        delete config.data["reader_id"];
      } else {
        config.params = Object.assign(config.params || {}, para, tokenPara);
        delete config.params["reader_id"];
      }

      return config;
    });
  }

  async httpGet(url, options, stopRelogin = false) {
    const response = await this.ajax.get(url, options);
    let data = response.data || {};
    const code = +data.code;
    if (code === 200100 && !stopRelogin) {
      //登录过期
      const { account, password } = this.session || {};

      this.session = await this.getLoginToken({ account, password });
      return await this.httpGet(url, options, true);
    } else if (code === 100000) {
      //ok
      return data.data;
    } else {
      console.error(data);
      throw data.tip;
    }
  }

  async httpPost(url, options, stopRelogin = false) {
    options.headers = options.headers || {};
    if (!options.headers["Content-Type"])
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";

    const response = await this.ajax.post(url, options.data, options);
    let data = response.data || {};
    const code = +data.code;
    if (code === 200100 && !stopRelogin) {
      //登录过期
      const { account, password } = this.session || {};

      this.session = await this.getLoginToken({ account, password }); //还原一次登录状态
      return await this.httpPost(url, options, true);
    } else if (code === 100000) {
      //ok
      return data.data;
    } else {
      console.error(data);
      throw data.tip;
    }
  }

  async getLoginToken({ account, password }) {
    const response = await this.ajax.get("/signup/login", {
      params: {
        login_name: account,
        passwd: password,
      },
    });
    let data = response.data || {};
    const code = +data.code;
    if (code === 100000) {
      data = data.data;
      const session = {
        account: account,
        password: password,
        token: data.login_token,
        tokenAccount: data.reader_info.account,
        raw: data,
      };
      return session;
    } else {
      throw data.tip;
    }
  }

  ensureSession() {
    if (this.session && this.db) return;
    throw "用户未登录";
  }
  //#endregion

  //#region WebService接口
  async login({ account, password }) {
    // 从session获取token,如果获取到则直接返回
    let session = storage.getObject(`${storageKeys.session}:${account}`);
    if (session) {
      this.session = session;
    } else {
      session = await this.getLoginToken({ account, password });
      if (!session) throw "登录失败";
      this.session = session;
      storage.setObject(`${storageKeys.session}:${account}`, session);
    }

    this.db = openUserDB(this.session.account);
    return {
      account: session.account,
      password: session.password,
      nickName: session.raw.reader_info.reader_name,
      avatar: session.raw.reader_info.avatar_url,
    };
  }
  logout() {
    this.session = undefined;
    //todo 关闭db
    this.db.close();
    return Promise.resolve();
  }
  /**
   * 获取书架列表
   * @param param
   */
  async getBookshelfList({ noCache }) {
    this.ensureSession();
    const { db, session } = this;
    let rawShelfs;
    if (!noCache) {
      const cacheData = await db.bookshelfs.toCollection().first();

      if (cacheData) rawShelfs = cacheData.data;
    }
    if (!rawShelfs) {
      const resp = await this.httpGet("/bookshelf/get_shelf_list", {});
      rawShelfs = resp.shelf_list;
      db.bookshelfs.put(
        {
          account: session.account,
          data: rawShelfs,
        },
        [session.account]
      );
    }
    return rawShelfs.map((x) => {
      return {
        shelfId: x.shelf_id,
        shelfName: x.shelf_name,
        raw: x,
      };
    });
  }
  /**
   * 获取指定书架的书籍列表
   * @param param
   */
  async getBookList({ bookshelf, noCache }) {
    this.ensureSession();
    const { db, session } = this;
    let rawBooks;
    if (!noCache) {
      const cacheData = await db.books
        .where("shelfId")
        .equals(bookshelf.shelfId)
        .first();
      if (cacheData) rawBooks = cacheData.data;
    }

    if (!rawBooks) {
      const resp = await this.httpGet("/bookshelf/get_shelf_book_list_new", {
        params: {
          count: 999,
          shelf_id: bookshelf.shelfId,
          page: 0,
          order: "last_read_time",
        },
      });
      rawBooks = resp.book_list;
      db.books.put(
        {
          shelfId: bookshelf.shelfId,
          data: rawBooks,
        },
        [bookshelf.shelfId]
      );
    }
    return rawBooks.map((book) => {
      const item = {
        bookId: book.book_info.book_id,
        bookName: book.book_info.book_name,
        author: book.book_info.author_name,
        cover: book.book_info.cover,
        date: book.book_info.last_chapter_info.uptime,
        totalWordCount: book.book_info.total_word_count,
        lastReadInfo: undefined,
        lastChapterInfo: {
          chapterId: book.book_info.last_chapter_info.chapter_id,
          chapterName: book.book_info.last_chapter_info.chapter_title,
          date: book.book_info.last_chapter_info.uptime,
        },
        raw: book,
      };
      if (book.last_read_chapter_id) {
        item.lastReadInfo = {
          chapterId: book.last_read_chapter_id,
          chapterName: book.last_read_chapter_title,
          date: book.last_read_chapter_update_time,
        };
      }
      return item;
    });
  }
  /**
   * 获取指定书籍的分卷、章节信息
   * @param param
   */
  async getVolumeList({ book, noCache }) {
    this.ensureSession();
    const { db, session } = this;
    let volumes;
    if (!noCache) {
      const cacheData = await db.volumes
        .where("bookId")
        .equals(book.bookId)
        .first();
      if (cacheData) volumes = cacheData.data;
    }
    if (!volumes) {
      const divisionResp = await this.httpGet("/book/get_division_list", {
        params: { book_id: book.bookId },
      });
      let divisionList = divisionResp.division_list;
      volumes = [];
      for (let i = 0; i < divisionList.length; i++) {
        const division = divisionList[i];
        const ChapterListResp = await this.httpPost(
          "/chapter/get_updated_chapter_by_division_id",
          {
            data: {
              division_id: division.division_id,
              last_update_time: 0,
            },
          }
        );
        let chapters = ChapterListResp.chapter_list.map((chapter) => {
          return {
            chapterId: chapter.chapter_id,
            chapterName: chapter.chapter_title,
            raw: chapter,
          };
        });
        volumes.push({
          volumeId: division.division_id,
          volumeName: division.division_name,
          chapters: chapters,
          raw: division,
        });
      }
      db.volumes.put({
        bookId: book.bookId,
        updateDate: new Date().valueOf(),
        data: volumes,
      });
    }
    return volumes;
  }
  /**
   * 获取章节详情内容
   * @param param
   */
  async getChapterDetail({ book, chapter, noCache }) {
    this.ensureSession();
    const { db, session } = this;
    let chapterDetail;
    if (!noCache) {
      const cacheData = await db.chapterDetails
        .where("chapterId")
        .equals(chapter.chapterId)
        .first();
      if (cacheData) chapterDetail = cacheData.data;
    }
    if (!chapterDetail) {
      const chapterCmdResp = await this.httpPost("/chapter/get_chapter_cmd", {
        data: { chapter_id: chapter.chapterId },
      });
      const chapterDetailResp = await this.httpPost("/chapter/get_cpt_ifm", {
        data: {
          chapter_id: "" + chapter.chapterId,
          chapter_command: chapterCmdResp.command,
        },
      });
      let chapterInfo = chapterDetailResp.chapter_info;
      if (Object.keys(chapterInfo).length != 0) {
        let contentTitle = chapterInfo.chapter_title;
        let contentText = chapterInfo.txt_content;
        let decryptContent = decrypt(contentText, chapterCmdResp.command) || "";
        chapterDetail = {
          chapterId: chapterInfo.chapter_id,
          chapterName: contentTitle,
          content: decryptContent.trim(),
          raw: chapterInfo,
        };
        db.chapterDetails.put(
          {
            bookId: book.bookId,
            chapterId: chapter.chapterId,
            lastReadTime: new Date().valueOf(),
            data: chapterDetail,
          },
          [chapter.chapterId]
        );
      } else {
        console.error(chapterDetailResp);
        throw "获取章节内容失败";
      }
    }
    return chapterDetail;
  }
  /**
   * 设置阅读进度
   * @param {*} param0
   */
  async setLastReadChapter({ book, chapter }) {
    //POST /bookshelf/set_last_read_chapter
    /**
   * 
   * last_read_chapter_id	106208235
app_version	2.6.020
device_token	ciweimao_867401041011125
book_id	100192934
login_token	03efe96ffad843aefe7a3b9d049532e4
account	书客956986535
   */
    this.ensureSession();
    await this.httpPost("/bookshelf/set_last_read_chapter", {
      data: {
        last_read_chapter_id: chapter.chapterId,
        book_id: book.bookId,
      },
    });
  }

  async buyChapter({ shelf, book, chapter }) {
    /**
     * POST /chapter/buy 
 * app_version	2.6.020
device_token	ciweimao_867401041011125
shelf_id	58026
chapter_id	106217146
login_token	03efe96ffad843aefe7a3b9d049532e4
account	书客956986535
 */
    this.ensureSession();
    const data = await this.httpPost("/chapter/buy", {
      data: {
        chapter_id: chapter.chapterId,
        shelf_id: shelf.shelfId,
      },
    });
    // return 
    // {
    //   data:{
    //     reader_info:{},
    //     chapter_info:{
    //       auth_access:"1"
    //     }
    //   }
    // }
  }
  //#endregion
}
