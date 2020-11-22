<template>
  <div class="shelf-container">
    <van-nav-bar>
      <template #title>
        <span @click="shelfListActionShow = true"
          >{{ currentShelfName }} <van-icon name="arrow-down"
        /></span>
      </template>
      <template #right>
        <van-icon
          name="wap-nav"
          class="handler-bar"
          @click="actionShow = true"
        />
      </template>
    </van-nav-bar>
    <!-- <div class="book-list">
      <div class="book-item">
        <div class="book-cover">
          <img
            src="http://c1.kuangxiangit.com/uploads/allimg/c200805/05-08-20175802-1978.jpg"
          />
        </div>
        <div class="book-info">
          <p>
            <span class="book-title">小说名</span>
            <span class="book-update-mark">更新</span>
          </p>
          <p class="book-sub-title">作者 / 字数</p>
          <p class="book-chapter-info">更新: 时间 / 章节名</p>
          <p class="book-chapter-info">进度: 章节名</p>
        </div>
      </div>
    </div> -->

    <div class="book-list">
      <div class="book-item" v-for="book in books" :key="book.bookId">
        <div class="book-cover">
          <img :src="book.cover" @click="openBook(book)" />
        </div>
        <div class="book-info">
          <p @click="openBook(book)">
            <span class="book-title">{{ book.bookName }}</span>
            <!-- <span class="book-update-mark">更新</span> -->
          </p>
          <p class="book-sub-title">
            {{ book.author }} / {{ getWordCountDisplay(book.totalWordCount) }}
          </p>
          <p
            class="book-chapter-info van-ellipsis"
            :title="book.lastChapterInfo.chapterName"
          >
            更新: {{ getUpdateTimeDisplay(book.lastChapterInfo.date) }} /
            {{ book.lastChapterInfo.chapterName }}
          </p>
          <p
            class="book-chapter-info van-ellipsis"
            :title="book.lastReadInfo ? book.lastReadInfo.chapterName : '未读'"
          >
            进度:
            {{ book.lastReadInfo ? book.lastReadInfo.chapterName : "未读" }}
          </p>
        </div>
      </div>
    </div>
    <!--操作列表 START-->
    <van-action-sheet
      v-model="actionShow"
      :actions="actions"
      @select="onSelect"
    />
    <!--操作列表 END-->
    <!--书架列表 START-->
    <van-action-sheet
      v-model="shelfListActionShow"
      :actions="bookshelfListActions"
      @select="switchShelf"
    />
    <!--书架列表 END-->
  </div>
</template>

<script>
import moment from "moment";
moment.locale("zh-CN");
export default {
  name: "Bookshelf",
  data() {
    return {
      actionShow: false,
      shelfListActionShow: false,
      actions: [
        { name: "刷新当前书架", action: "refreshShelf" },
        { name: "退出登录", action: "logout" },
        { name: "退出登录并清除数据", action: "logoutAndClearData" },
        { name: "关于", action: "about" },
        { name: "捐赠", action: "donate" },
      ],
    };
  },
  computed: {
    currentBookshelfId: {
      get: function () {
        const bookshelf = this.$store.state.currentBookshelf;
        return bookshelf ? bookshelf.shelfId : undefined;
      },
      set: function (value) {
        if (value == "0") {
          //todo 刷新书架
          this.dispatch({ type: "loadBookList", noCache: true });
        } else {
          this.dispatch({ type: "switchBookshelf", shelfId: value });
        }
      },
    },
    // bookshelfList() {
    //   return this.$store.state.bookshelfList;
    // },
    bookshelfListOptions() {
      const options = this.$store.state.bookshelfList.map((x) => {
        return {
          text: x.shelfName,
          value: x.shelfId,
        };
      });
      // options.push({
      //   text: "刷新书架",
      //   value: "0",
      // });
      return options;
    },
    bookshelfListActions() {
      return this.$store.state.bookshelfList.map((x) => {
        return {
          name: x.shelfName,
          action: x.shelfId,
        };
      });
    },
    currentShelfName() {
      let item = this.bookshelfListActions.find(
        (x) => x.action === this.currentBookshelfId
      );
      return item ? item.name : "书架";
    },
    books() {
      const { bookList } = this.$store.state;
      return bookList || [];
    },
    session() {
      return this.$store.state.session || {};
    },
    appInfo() {
      const { webApp, webAppList = [] } = this.$store.state;
      return webAppList.find((x) => x.appId === webApp) || {};
    },
  },
  created() {
    if (!this.currentBookshelfId) this.dispatch({ type: "loadBookshelf" });
  },
  methods: {
    getWordCountDisplay(count) {
      count = parseInt(count);
      let tmp;
      if ((tmp = count / 10000) > 1) {
        return `${tmp.toFixed(1)} 万字`;
      } else if ((tmp = count / 1000) > 1) {
        return `${tmp.toFixed(1)} 千字`;
      } else {
        return `${count} 字`;
      }
      return count;
    },
    getUpdateTimeDisplay(time) {
      return moment(time, "YYYY-MM-DD HH:mm:ss").fromNow();
    },
    openBook(book) {
      this.dispatch({
        type: "viewBook",
        bookId: book.bookId,
        //chapterId: book.lastReadInfo.chapterId,
      });
    },
    onSelect(item) {
      // if (item.action === "logout") this.dispatch({ type: "logout" });
      // else if (item.action === "logoutAndClearData")
      //   this.dispatch({ type: "logoutAndClearData" });
      if (item.action === "refreshShelf") {
        this.dispatch({ type: "loadBookList", noCache: true });
        this.actionShow = false;
      } else {
        this.dispatch({ type: item.action });
      }
    },
    switchShelf(item) {
      this.dispatch({ type: "switchBookshelf", shelfId: item.action });
      this.shelfListActionShow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.book-list {
  display: block;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  .book-info {
    flex: 1;
    overflow: hidden;
    > p {
      margin: 5px;
    }
  }
  .book-item {
    display: flex;
    flex-direction: row;
    border-bottom: 1px silver solid;
  }
  .book-title {
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }
  .book-sub-title {
    font-size: 12px;
    color: silver;
  }
  .book-chapter-info {
    font-size: 14px;
  }
  .book-cover > img {
    width: 60px;
    height: 80px;
    margin: 10px 5px;
    cursor: pointer;
  }
  .book-update-mark {
    background: lightcoral;
    padding: 2px 5px;
    font-size: 12px;
    color: #fff;
    border-radius: 10px;
  }
}
.handler-bar {
  font-size: 24px;
}
.shelf-container {
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>