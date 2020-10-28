<template>
  <div>
    <van-nav-bar title="书架" />
    <div>用户信息</div>
    <van-dropdown-menu>
      <van-dropdown-item
        v-model="currentBookshelf"
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
            {{ book.lastChapterInfo.title }}
          </p>
          <p class="book-chapter-info van-ellipsis">
            进度: {{ book.lastReadInfo ? book.lastReadInfo.title : "未读" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
moment.locale("zh-CN");
export default {
  name: "Bookshelf",
  data() {
    return {};
  },
  computed: {
    currentBookshelf: {
      get: function () {
        return this.$store.state.currentBookshelfId;
      },
      set: function (value) {
        this.$store.dispatch({ type: "switchBookshelf", bookshelfId: value });
      },
    },
    bookshelfList() {
      return this.$store.state.bookshelfList;
    },
    bookshelfListOptions() {
      return this.$store.state.bookshelfList.map((x) => {
        return {
          text: x.bookshelfName,
          value: x.bookshelfId,
        };
      });
    },
    books() {
      const { bookshelfList, currentBookshelfId } = this.$store.state;
      const ret = bookshelfList.filter(
        (x) => x.bookshelfId === currentBookshelfId
      );
      return ret && ret.length > 0 ? ret[0].books : [];
    },
  },
  created() {
    this.$store.dispatch({ type: "recoveryLoginStatus" });
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
      this.$store.dispatch({
        type: "viewBook",
        bookId: book.bookId,
        //chapterId: book.lastReadInfo.chapterId,
      });
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
</style>