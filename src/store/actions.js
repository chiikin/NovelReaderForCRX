import * as types from "./mutation-types";
import { getServer, getService } from "../server";
import { localStorage as storage } from "../utils/webStorage";
import Vue from "vue";

const storageKeys = {
  readingChapter: "readingChapter",
};

const vueInst = new Vue({});
function showErrorMsg(e) {
  if (typeof e === 'string') {
    vueInst.$toast.fail(e);
  }
  else {
    console.error('showError', e);
  }
}

/**
 * 保存vuex快照
 * @param {*} context 
 */
export function saveSnapshot(context) {
  const { webApp,
    pageComponent,//"Bookshelf",//"ChapterView"
    session,
    bookshelfList,
    currentBookshelf,//{}
    bookList,
    readingBook,//{},
    readingBookVolumes,
    readingChapter,//{}
  } = context.state;

  storage.setObject("appVuexSnapshot", {
    webApp,
    pageComponent,//"Bookshelf",//"ChapterView"
    session,
    bookshelfList,
    currentBookshelf,//{}
    bookList,
    readingBook,//{},
    readingBookVolumes,
    readingChapter,//{}
  });
}

export async function recoverSession(context) {
  const { session, webApp } = context.state;
  if (session) {
    const service = getService(webApp);
    await service.login({ account: session.account, password: session.password });
  }
  else {
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

export async function loadBookshelf(context, payload) {
  const { webApp } = context.state;
  //const { account, password } = payload;
  const service = getService(webApp);
  context.state.bookshelfList = await service.getBookshelfList({ noCache: payload.noCache });
  context.state.currentBookshelf = context.state.bookshelfList[0];
  await context.dispatch({ type: "loadBookList",  noCache: payload.noCache });
}

export async function loadBookList(context, payload) {
  const { webApp,currentBookshelf } = context.state;
  //const { account, password } = payload;
  const service = getService(webApp);

  context.state.bookList= await service.getBookList({ bookshelf:currentBookshelf, noCache: payload.noCache  });

}

export async function switchBookshelf(context, payload) {
  const { bookshelfList } = context.state;

  const bookshelf = bookshelfList.find(x => { return x.shelfId === payload.shelfId });
  context.state.currentBookshelf = bookshelf;

  await context.dispatch({ type: "loadBookList",  noCache: false });
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
      for (let j = 0; j < volume.chapters.length; j++) {
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
    let chapter;
    try {
      chapter = getChapterInVolume(data, readChapterId);
    } catch (e) {
      console.error(e)
    }

    if (!chapter) {
      console.log('打开章节失败,章节id:' + readChapterId);
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
  const { bookId, currentChapterId } = payload;
  const { currentBookshelfId, bookshelfList } = context.state;
}

export function viewPrevChapter(context, payload) { }
