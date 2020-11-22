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

interface ChapterDetail{
    bookId: string,
    chapterId: string,
    title: string,
    loaded:boolean,
    content:string
    raw:any
}

interface ChapterInfo{
    chapterId:string,
    chapterName:string,
    raw:any
}

interface BookChapterVolume{
    volumeId:string,
    volumeName:string,
    raw:any,
    chapters:Array<ChapterInfo>
}

interface BookInfo {
    bookId: string;
    bookName: string;
    author: string;
    cover: string;
    totalWordCount: string;
    lastReadInfo?: LastReadInfo,
    lastChapterInfo: LastChapterInfo
    raw:any
}

interface Bookshelf {
    bookshelfId: string,
    bookshelfName: string,
    loaded: false,
    books: Array<BookInfo>
}