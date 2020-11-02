<template>
  <div>
    <div class="header">
      <div>
        <!-- <img class="logo" :alt="appInfo.appName" :src="appInfo.logo" /> -->
        <h1 v-text="appInfo.appName"></h1>
      </div>
      <div>
        <img class="avatar" alt="头像" :src="session.avatar" />
        <p class="user-name" v-text="session.nickName"></p>
      </div>
      <div>
        <van-icon
          name="wap-nav"
          style="font-size: 24px; cursor: pointer"
          title="操作菜单"
          @click="openMenu"
        />
      </div>
    </div>
    <van-dropdown-menu>
      <van-dropdown-item
        v-model="currentBookshelfId"
        :options="bookshelfListOptions"
      />
    </van-dropdown-menu>
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
          <p class="book-chapter-info van-ellipsis">
            更新: {{ getUpdateTimeDisplay(book.lastChapterInfo.date) }} /
            {{ book.lastChapterInfo.chapterName }}
          </p>
          <p class="book-chapter-info van-ellipsis">
            进度:
            {{ book.lastReadInfo ? book.lastReadInfo.chapterName : "未读" }}
          </p>
        </div>
      </div>
    </div>
    <van-action-sheet
      v-model="actionShow"
      :actions="actions"
      @select="onSelect"
    />
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
      actions: [
        { name: "退出登录", action: "logout" },
        { name: "退出登录并清除数据", action: "logoutAndClearData" },
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
      options.push({
        text: "刷新书架",
        value: "0",
      });
      return options;
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
    onSelect(item) {
      this.dispatch({ type: item.action });
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
    openMenu() {
      //todo
    },
  },
};
</script>

<style lang="scss" scoped>
.book-list {
  display: block;
  .book-info {
    flex: 1;
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
.header {
  display: flex;
  padding: 5px 20px;
  > div {
    width: 33.33%;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 24px;
  }
  .user-name {
    padding: 0;
    margin: 0;
    font-size: 16px;
  }
  .logo {
    width: 48px;
    height: 48px;
  }
}
</style>