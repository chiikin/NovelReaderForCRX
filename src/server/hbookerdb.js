import Dexie from "dexie";

const db = new Dexie("hbookerDb");

// db.version(1).stores({
//     bookVolumes: "bookId,bookName",
//     chapterDetails: "chapterId,bookId,lastReadTime"
// });
// db.open();
// export default db;

export function openUserDB(account) {
  const userDB = new Dexie("hbookerDb:" + account);

  userDB.version(1).stores({
    bookshelfs: "account",
    books: "shelfId",
    volumes: "bookId",
    chapterDetails: "chapterId,bookId,lastReadTime",
    autoBuyBooks: "bookId",
  });
  userDB.open();
  return userDB;
}

export function deleteDB(account) {
  const dbname = "hbookerDb:" + account;
  var DBDeleteRequest = window.indexedDB.deleteDatabase(dbname);
  DBDeleteRequest.onerror = function(event) {
    console.log("Error",arguments);
  };

  DBDeleteRequest.onsuccess = function(event) {
    console.log("success");
  };
}
