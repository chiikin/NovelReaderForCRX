/** 
 * 本文件定义app与web站点通讯定义
 * 
*/
/**
 * 
 */
interface AccountData{
    account:string,
    nickName:string,
    avatar:string,
}
interface ChapterDetail {
    chapterId: string,
    chapterName: string,
    content: string,
    raw: any
}

interface Chapter {
    chapterId: string,
    chapterName: string,
    raw: any
}
interface Volume {
    volumeId: string,
    volumeName: string,
    chapters: Array<Chapter>
    raw: any
}

interface Bookshelf {
    shelfId: string,
    shelfName: string,
    raw: any
}

interface LastChapterInfo {
    chapterId: string,
    chapterName: string,
    date: string
}

interface LastReadInfo {
    chapterId: string,
    chapterName: string,
    date: string
}

interface Book {
    bookId: string,
    bookName: string,
    author: string,
    cover: string,
    date:string,
    totalWordCount: string,
    lastReadInfo?: LastReadInfo,
    lastChapterInfo: LastChapterInfo
    raw: any
}

interface BaseParam {
    noCache: boolean
}

interface BookshelfParam extends BaseParam {

}

interface BookParam extends BaseParam {
    bookshelf: Bookshelf
}

//VolumeParam
interface VolumeParam extends BaseParam {
    book: Book
}

interface ChapterDetailParam extends BaseParam {
    book:Book,
    chapter: Chapter
}

interface LoginParam {
    account:string,
    password:string
}

interface WebServer {
    login(param:LoginParam):Promise<AccountData>,
    logout():Promise<void>,
    /**
     * 获取书架列表
     * @param param 
     */
    getBookshelfList(param: BookshelfParam): Promise<Array<Bookshelf>>,
    /**
     * 获取指定书架的书籍列表
     * @param param 
     */
    getBookList(param: BookParam): Promise<Array<Book>>,
    /**
     * 获取指定书籍的分卷、章节信息
     * @param param 
     */
    getVolumeList(param: VolumeParam): Promise<Array<Volume>>,
    /**
     * 获取章节详情内容
     * @param param 
     */
    getChapterDetail(param: ChapterDetailParam): Promise<Array<Volume>>,
}
