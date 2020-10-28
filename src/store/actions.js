import * as types from "./mutation-types";
import { getServer } from "../server";
import { localStorage as storage } from "../utils/webStorage";

const storageKeys = {
  readingChapter: "readingChapter",
};

export const setFoo = ({ commit }, payload) => {
  commit(types.UPDATE_FOO, payload);
};

export function openPage(context, payload) {
  context.state.pageComponent = payload.pageName;
}

function execLogin(webApp, payload, callback) {
  const server = getServer(webApp);

  server
    .login({
      account: payload.account,
      password: payload.password,
    })
    .then((data) => {
      callback(true, data);
    })
    .catch(() => {
      callback(false);
    });
}

export function login(context, payload) {
  execLogin(context.state.webApp, payload, (ret, data) => {
    if (ret) {
      context.state.accountInfo.account = data.account;
      context.state.accountInfo.password = data.password;
      context.state.accountInfo.loginInfo = data.loginInfo;
      context.state.accountInfo.isLogin = true;
      context.dispatch({ type: "openPage", pageName: "Bookshelf" });
    }
  });
}

export function recoveryLoginStatus(context, payload) {
  const server = getServer(context.state.webApp);
  const accountInfo = server.recoverLoginStatus();
  if (accountInfo && accountInfo.loginInfo) {
    context.state.accountInfo.account = accountInfo.account;
    context.state.accountInfo.password = accountInfo.password;
    context.state.accountInfo.loginInfo = accountInfo.loginInfo;
    context.state.accountInfo.isLogin = true;
    context.dispatch({ type: "loadBookshelf" });
  } else {
    context.dispatch({ type: "openPage", pageName: "Login" });
  }
}

/**
 * 登录信息失效，利用已缓存的用户名密码自动重新登录
 * @param {*} context
 * @param {*} payload
 */
export function reflashLoginInfo(context, payload) {
  execLogin(
    context.state.webApp,
    {
      account: context.state.accountInfo.account,
      password: context.state.accountInfo.password,
    },
    (ret, data) => {
      if (ret) {
        context.state.accountInfo.account = data.account;
        context.state.accountInfo.password = data.password;
        context.state.accountInfo.loginInfo = data.loginInfo;
        context.state.accountInfo.isLogin = true;
      } else {
        //还原登录状态失败则转到登录页
        context.dispatch({ type: "openPage", pageName: "Login" });
      }
    }
  );
}

export function loadBookshelf(context, payload) {
  const server = getServer(context.state.webApp);
  server
    .getBookshelfList({
      accountInfo: context.state.accountInfo,
      refresh: payload.refresh,
    })
    .then((bookshelfList) => {
      bookshelfList = bookshelfList || [];
      context.state.bookshelfList = bookshelfList;
      if (bookshelfList.length > 0 && !context.state.currentBookshelfId) {
        context.state.currentBookshelfId = bookshelfList[0].bookshelfId;
        context.dispatch({
          type: "loadShelfBookList",
          shelfId: context.state.currentBookshelfId,
        });
      }
    });
}

export function loadShelfBookList(context, payload) {
  const server = getServer(context.state.webApp);
  server
    .getShelfBookList({
      accountInfo: context.state.accountInfo,
      shelfId: payload.shelfId,
      refresh: payload.refresh,
    })
    .then((bookshelf) => {
      const { bookshelfList } = context.state;
      for (let i = 0; i < bookshelfList.length; i++) {
        const bs2 = bookshelfList[i];
        if (bs2.bookshelfId === bookshelf.bookshelfId) {
          bs2.books = bookshelf.books;
          bs2.loaded = true;
        }
      }
    });
}

export function switchBookshelf(context, payload) {
  const { bookshelfList } = context.state;
  context.state.currentBookshelfId = payload.bookshelfId;
  for (let i = 0; i < bookshelfList.length; i++) {
    const bookshelf = bookshelfList[i];
    if (bookshelf.bookshelfId === payload.bookshelfId) {
      if (!bookshelf.loaded) {
        context.dispatch({
          type: "loadShelfBookList",
          shelfId: bookshelf.bookshelfId,
        });
        return;
      }
    }
  }
}

export function loadReadingChapter(context, payload) {
  const chapterInfo = storage.getObject(storageKeys.readingChapter);
  if (chapterInfo) {
    context.state.readingChapter = chapterInfo;
  } else {
    context.dispatch({ type: "loadChapter", bookId: "", chapterId: "" });
  }
}

export function loadChapter(context, payload) {
  const server = getServer(context.state.webApp);

  // todo: 当没有reading信息时读取第一章
  server
    .getChapter({
      accountInfo: context.state.accountInfo,
      bookId: payload.bookId,
      chapterId: payload.chapterId,
    })
    .then((data) => {
      context.state.readingChapter = data;
    });
}

/**
 * 浏览章节，此方法不检查章节id是否有效
 * @param {*} context
 * @param {*} payload
 */
export function viewChapter(context, payload) {
  const readingChapter = context.state.readingChapter;
  readingChapter.bookId = payload.bookId;
  readingChapter.chapterId = payload.chapterId;
  readingChapter.title = "";
  readingChapter.loaded = false;
  readingChapter.content = "";
  context.dispatch({
    type: "loadChapter",
    bookId: payload.bookId,
    chapterId: payload.chapterId,
  });
}

export function viewBook(context, payload) {
  const { currentBookshelfId, bookshelfList } = context.state;
  const bookshelf = bookshelfList.find(
    (x) => x.bookshelfId === currentBookshelfId
  );

  const book = bookshelf.books.find((val) => {
    return val.bookId === payload.bookId;
  });
  const server = getServer(context.state.webApp);

  function getChapterInVolume(volumes, chapterId) {
    for (let i = 0; i < volumes.length; i++) {
      const volume = volumes[i];
      for (let j = 0; j<volume.chapters.length; j++) {
        const chapter = volume.chapters[j];
        if (chapter.chapterId == chapterId) {
          return chapter;
        }
      }
    }
  }

  function getReadigChapterId(bookChapters) {
    if (book.lastReadInfo) {
      //存在最近阅读
      return book.lastReadInfo.chapterId;
    } else {
      //没有最近阅读
      return bookChapters[0].chapters[0].chapterId;
    }
  }

  server.getChapterList({ book }).then((data) => {
    context.state.bookChapters = data;
    const readChapterId = getReadigChapterId(data);
    let chapter ;
    try{
      chapter= getChapterInVolume(data, readChapterId);
    }catch(e){
      console.error(e )
    }
    
    if(!chapter){
      console.log('打开章节失败,章节id:'+readChapterId);
    }
    server
      .getChapterDetail({
        book: book,
        chapter: chapter,
      })
      .then((data) => {
        context.state.readingChapter = data;
      });
    //console.log('chapterResult', data);
  });

  context.dispatch({ type: "openPage", pageName: "ChapterView" });
}

/**
 * 浏览书籍，查看最近阅读章节，如果没有最近阅读章节则阅读第一章节
 * @param {*} context
 * @param {*} payload
 */
export function viewNextChapter(context, payload) {
  const { currentBookshelfId, bookshelfList } = context.state;
}

export function viewPrevChapter(context, payload) { }
