import * as types from "./mutation-types";
import {  getService } from "../server";
import { localStorage as storage } from "../utils/webStorage";


const storageKeys = {
  readingChapter: "readingChapter",
};

/**
 * 保存vuex快照
 * @param {*} context
 */
export function saveSnapshot(context) {
  const {
    webApp,
    pageComponent, //"Bookshelf",//"ChapterView"
    session,
    bookshelfList,
    currentBookshelf, //{}
    bookList,
    readingBook, //{},
    readingBookVolumes,
    readingChapter, //{}
  } = context.state;

  storage.setObject("appVuexSnapshot", {
    webApp,
    pageComponent, //"Bookshelf",//"ChapterView"
    session,
    bookshelfList,
    currentBookshelf, //{}
    bookList,
    readingBook, //{},
    readingBookVolumes,
    readingChapter, //{}
  });
}

export async function recoverSession(context) {
  const { session, webApp } = context.state;
  if (session) {
    const service = getService(webApp);
    await service.login({
      account: session.account,
      password: session.password,
    });
  } else {
    context.state.pageComponent = "Login";
  }
}

export function openPage(context, payload) {
  context.state.pageComponent = payload.pageName;
}

export async function login(context, payload) {
  const { webApp } = context.state;
  const { account, password } = payload;
  const service = getService(webApp);
  try {
    const session = await service.login({ account, password });
    context.state.session = session;
  } catch (e) {
    return showErrorMsg(e);
  }

  context.dispatch({ type: "openPage", pageName: "Bookshelf" });
}

export async function logout(context, payload){
  
}

export async function logoutAndClearData(context, payload){
  
}

export async function loadBookshelf(context, payload) {
  const { webApp } = context.state;
  //const { account, password } = payload;
  const service = getService(webApp);
  context.state.bookshelfList = await service.getBookshelfList({
    noCache: payload.noCache,
  });
  context.state.currentBookshelf = context.state.bookshelfList[0];
  await context.dispatch({ type: "loadBookList", noCache: payload.noCache });
}

export async function loadBookList(context, payload) {
  const { webApp, currentBookshelf, bookshelfList } = context.state;
  //const { account, password } = payload;
  const service = getService(webApp);
  let bookshelf;
  if (payload.shelfId) {
    bookshelf = bookshelfList.find(x => {
      return x.shelfId === payload.shelfId;
    });
  }
  else {
    bookshelf = currentBookshelf;
  }

  context.state.bookList = await service.getBookList({
    bookshelf: bookshelf,
    noCache: payload.noCache,
  });
}

export async function switchBookshelf(context, payload) {
  const { bookshelfList } = context.state;

  const bookshelf = bookshelfList.find((x) => {
    return x.shelfId === payload.shelfId;
  });
  context.state.currentBookshelf = bookshelf;

  await context.dispatch({ type: "loadBookList", noCache: false });
}

export async function loadVolumeList(context, payload) {
  const { readingBook, webApp } = context.state;
  const service = getService(webApp);
  const volumes = await service.getVolumeList({
    book: readingBook,
    noCache: payload.noCache,
  });
  context.state.readingBookVolumes = volumes;
}

function getChapterFromVolume(volumes, chapterId, offset) {
  const allChapters = [];
  offset=offset||0;

  volumes.forEach((vol) => {
    Array.prototype.push.apply(allChapters, vol.chapters);
  });

  for (let i = 0; i < allChapters.length; i++) {
    const chapter = allChapters[i];
    if (chapter.chapterId === chapterId) {
      if (offset === 0) {
        return chapter;
      } else if (offset < 0) {
        const index = i - offset;
        if (index >= 0) {
          return allChapters[index];
        }
      } else if (offset > 0) {
        const index = i + offset;
        if (index < allChapters.length) {
          return allChapters[index];
        } else {
          throw "没有最新章节";
        }
      }
    }
  }
  throw "无效章节";
}

export async function loadChapter(context, payload) {
  const { readingBookVolumes, readingBook, webApp } = context.state;
  const { chapterId,offset, noCache } = payload;
  const service = getService(webApp);
  const chapter = getChapterFromVolume(readingBookVolumes, chapterId,offset);

  const chapterDetail = await service.getChapterDetail({
    book: readingBook,
    chapter,
    noCache,
  });

  if (chapterDetail) context.state.readingChapter = chapterDetail;
  else {
    if (offset === 1) throw "没有最新章节";
    else throw "无效章节";
  }
}

export async function viewBook(context, payload) {
  const { bookList } = context.state;
  const book = bookList.find((x) => {
    return x.bookId === payload.bookId;
  });

  context.state.readingBook = book;

  await context.dispatch({ type: "loadVolumeList" });

  context.state.readingChapter = undefined;
  let chapterId;
  if (book.lastReadInfo) {
    chapterId = book.lastReadInfo.chapterId;
  } else {
    const volumes = context.state.readingBookVolumes;
    for (let i = 0; volumes.length; i++) {
      const volume = volumes[i];
      if (volume.chapters.length > 0) {
        const chapter = volume.chapters[0];
        chapterId = chapter.chapterId;
        break;
      }
    }
  }

  if (chapterId) {
    await context.dispatch({
      type: "loadChapter",
      chapterId: chapterId,
      offset: 0,
    });
    await context.dispatch({ type: "openPage", pageName: "ChapterView" });
  } else {
    throw "阅读失败";
  }
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

/**
 * 浏览书籍，查看最近阅读章节，如果没有最近阅读章节则阅读第一章节
 * @param {*} context
 * @param {*} payload
 */
export async function viewNextChapter(context, payload) {
  await context.dispatch({
    type: "loadChapter",
    chapterId: payload.chapterId,
    offset: 1,
  });
}

export async function viewPrevChapter(context, payload) {
  await context.dispatch({
    type: "loadChapter",
    chapterId: payload.chapterId,
    offset: -1,
  });
}
