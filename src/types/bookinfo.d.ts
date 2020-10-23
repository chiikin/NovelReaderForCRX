interface LastReadInfo {
    chapterId: string,
    title: string,
    date: string
}

interface LastChapterInfo {
    chapterId: string,
    chapterIndex: string,
    title: string,
    date: string
}

interface ReadingChapterInfo {
    bookId: string,
    chapterId: string,
    chapterIndex: string,
    title: string,
    loaded:boolean,
    content:string
}

interface BookInfo {
    bookId: string;
    bookName: string;
    author: string;
    cover: string;
    totalWordCount: string;
    lastReadInfo?: LastReadInfo,
    lastChapterInfo: LastChapterInfo
}

interface Bookshelf {
    bookshelfId: string,
    bookshelfName: string,
    loaded: false,
    books: Array<BookInfo>
}