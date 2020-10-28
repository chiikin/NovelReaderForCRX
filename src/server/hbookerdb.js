import Dexie from 'dexie';

const db = new Dexie("hbookerDb");

db.version(1).stores({
    bookVolumes: "bookId,bookName",
    chapterDetails: "chapterId,bookId,lastReadTime"
});
db.open();

export default db;