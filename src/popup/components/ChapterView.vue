<template>
  <div class="chapter-view" :style="viewStyle">
    <h1 class="chapter-title" v-text="readingChapter.chapterName"></h1>
    <div class="chapter-content" :style="contentStyle">
      <p
        v-for="(section, index) in cotnentSections"
        :key="index"
        v-html="section"
      ></p>
    </div>
    <div class="chapter-btns" style="text-align: center">
      <van-button type="default" @click="openBookshelf">返回</van-button>
      <van-button type="default" @click="prevChapter">上一章</van-button>
      <van-button type="default" @click="nextChapter">下一章</van-button>
      <van-button type="default" @click="viewSettingVisible = true"
        ><van-icon name="setting-o"></van-icon
      ></van-button>
    </div>
    <van-popup
      v-model="viewSettingVisible"
      closeable
      position="bottom"
      :style="{ height: '30%' }"
      :overlay-style="{ 'background-color': 'rgba(0,0,0,.1)' }"
    >
      <p>
        <label>字体大小</label>
        <van-button type="primary" size="small" @click="changeFontSize(-0.1)"
          >A-</van-button
        >
        <van-button type="primary" size="small" @click="changeFontSize(0.1)"
          >A+</van-button
        >
        <van-button type="primary" size="small" @click="changeFontSize(0)"
          >默认</van-button
        >
      </p>
      <p style="line-height: 32px">
        <label>背景</label>
        <span
          class="chapter-theme-btn"
          v-for="(item, index) in themes"
          @click="changeTheme(item)"
          :key="index"
          :style="getThemeBtnStyle(item)"
          :class="{ active: item.key == theme.key }"
        >
          &nbsp;
        </span>
      </p>
    </van-popup>
  </div>
</template>

<script>
import { localStorage as storage } from "../../utils/webStorage";

const chapterViewSettingKey = "ChapterViewSetting";
export default {
  name: "ChapterView",
  data() {
    return {
      viewSettingVisible: false,
      fontSize: 1,
      theme: {},
      themes: [
        {
          key: 1,
          backgroundColor: "rgb(216, 214, 211)",
          color: "#000",
        },
        {
          key: 2,
          backgroundColor: "rgb(199, 238, 206)",
          color: "#000",
        },
        {
          key: 3,
          backgroundColor: "rgb(216, 214, 211)",
          color: "#000",
        },
        {
          key: 4,
          backgroundColor: "rgb(216, 214, 211)",
          color: "#000",
        },
      ],
      
    };
  },
  computed: {
    readingChapter() {
      return this.$store.state.readingChapter||{};
    },
    contentStyle() {
      return {
        fontSize: this.fontSize + "rem",
        color: this.theme.color,
      };
    },
    viewStyle() {
      return {
        backgroundColor: this.theme.backgroundColor,
        color: this.theme.color,
      };
    },
    cotnentSections() {
      const {content=""}=this.readingChapter;
      //const content = this.content || "";
      return content.trim().split("\n");
      // .map((text) => {
      //   return `<p>${text}</p>`;
      // })
      // .join("");
    },
  },
  created() {
    this.initReadingSetting();
  },
  methods: {
    getThemeBtnStyle(theme) {
      return {
        backgroundColor: theme.backgroundColor,
        color: theme.color,
      };
    },
    changeFontSize(val) {
      if (val != 0) {
        //不等于则增/减字体大小
        this.fontSize += val;
        if (this.fontSize <= 0) {
          this.fontSize = 0.1;
        }
      } else {
        //==0 则设置默认值
        this.fontSize = 1;
      }
      let settings = storage.getObject(chapterViewSettingKey, {});
      settings.fontSize = this.fontSize;
      storage.setObject(chapterViewSettingKey, settings);
    },
    changeTheme(item) {
      this.theme = item;
      let settings = storage.getObject(chapterViewSettingKey, {});
      settings.theme = settings.theme || {};
      settings.theme = this.theme;
      storage.setObject(chapterViewSettingKey, settings);
    },
    initReadingSetting() {
      let settings = storage.getObject(chapterViewSettingKey, {});
      this.theme = settings.theme || this.themes[0];
      this.fontSize = settings.fontSize || 1;
    },
    nextChapter() {
        this.dispatch({type: "viewNextChapter",chapterId:this.readingChapter.chapterId});
        this.$el.scrollTo(0,0);
    },
    prevChapter() {
        this.dispatch({type: "viewPrevChapter",chapterId:this.readingChapter.chapterId});
        this.$el.scrollTo(0,0);
    },
    openBookshelf(){
      this.dispatch({type: "openPage", pageName: "Bookshelf"});
    }
  },
};
</script>

<style lang="scss">
.chapter-view {
  overflow: auto;
  position: relative;
  padding: 0.5rem;
  height: 100%;
  .chapter-title {
  }
  .chapter-content {
    padding-bottom: 30px;
  }
  .chapter-theme-btn {
    display: inline-block;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    margin: 0 5px;
    cursor: pointer;
  }
  .chapter-theme-btn.active {
    outline: 1px solid lightcoral;
  }
  img{
    width: 260px;
  }
}
</style>