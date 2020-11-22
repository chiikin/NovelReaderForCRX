<template>
  <div class="chapter-view" :style="viewStyle">
    <!-- 阅读 START -->
    <div class="chapter-view-body" v-if="viewBody === 'content'">
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
        <van-button type="default" @click="prevChapter"
          ><van-icon name="arrow-left"
        /></van-button>
        <van-button type="default" @click="viewVolume"
          ><van-icon name="bars"
        /></van-button>
        <van-button type="default" @click="nextChapter"
          ><van-icon name="arrow"
        /></van-button>
        <van-button type="default" @click="viewSettingVisible = true"
          ><van-icon name="setting-o"></van-icon
        ></van-button>
      </div>
    </div>
    <!-- 阅读 END -->
    <!-- 目录 START -->
    <div class="chapter-volume-body" v-else>
      <van-nav-bar
        left-text="返回"
        left-arrow
        right-text="刷新"
        @click-left="viewBody = 'content'"
        @click-right="refreshVolume"
      >
      </van-nav-bar>

      <div class="volume-list">
        <div
          class="volume-item"
          v-for="volume in readingBookVolumes"
          :key="volume.volumeId"
        >
          <h3
            class="volume-item-title"
            @click="toggleOpenVolume(volume.volumeId)"
          >
            <van-icon
              :name="
                openedVolumeKey[volume.volumeId] ? 'arrow-up' : 'arrow-down'
              "
            />
            {{ volume.volumeName }}&nbsp;({{ volume.chapters.length }})
          </h3>
          <div
            class="volume-item-chapters"
            v-show="openedVolumeKey[volume.volumeId]"
          >
            <p
              class="volume-item-chapter-item"
              v-for="chapter in volume.chapters"
              :key="chapter.chapterId"
              @click="viewChapter(chapter.chapterId)"
            >
              <lock-icon :lock="chapter.locked"></lock-icon>
              {{ chapter.chapterName }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- 目录 END -->

    <!-- 阅读样式设置 START -->
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
    <!-- 阅读样式设置 END -->
    <!-- 章节购买设置 START -->
    <van-popup
      v-model="buyChapterVisible"
      closeable
      position="bottom"
      :style="{ height: '30%' }"
      :overlay-style="{ 'background-color': 'rgba(0,0,0,.1)' }"
    >
      <div style="margin: 50px 25px 10px 25px">
        <van-button block type="info" native-type="button" @click="buyChapter">
          订阅本章节
        </van-button>
      </div>
      <div style="margin: 0 25px; font-size: 16px">
        <p>
          <van-switch
            v-model="autoBuy"
            size="16px"
            active-color="#07c160"
            inactive-color="#ee0a24"
          />
          此后遇到收费章节自动订阅
        </p>
      </div>
    </van-popup>
    <!-- 章节购买设置 END -->
  </div>
</template>

<script>
import { localStorage as storage } from "../../utils/webStorage";
import LockIcon from "./lockIcon.vue";
const chapterViewSettingKey = "ChapterViewSetting";
export default {
  name: "ChapterView",
  components: {
    "lock-icon": LockIcon,
  },
  data() {
    return {
      viewBody: "content",
      viewSettingVisible: false,
      buyChapterVisible: false,
      autoBuy: false,
      openedVolumeKey: {},
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
      return this.$store.state.readingChapter || {};
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
      const { content = "" } = this.readingChapter;
      //const content = this.content || "";
      return content.trim().split("\n");
      // .map((text) => {
      //   return `<p>${text}</p>`;
      // })
      // .join("");
    },
    readingBookVolumes() {
      return this.$store.state.readingBookVolumes || [];
    },
  },
  watch: {
    readingChapter(newVal) {
      if (newVal && newVal.isPaid && !newVal.authAccess) {
        this.buyChapterVisible = true;
      }
      else{
        this.buyChapterVisible = false;
      }
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
      this.dispatch({
        type: "viewNextChapter",
        chapterId: this.readingChapter.chapterId,
      });
      this.$el.scrollTo(0, 0);
    },
    prevChapter() {
      this.dispatch({
        type: "viewPrevChapter",
        chapterId: this.readingChapter.chapterId,
      });
      this.$el.scrollTo(0, 0);
    },
    openBookshelf() {
      this.dispatch({ type: "openPage", pageName: "Bookshelf" });
    },
    async buyChapter() {
      //TODO :
      if (this.autoBuy) {
        await this.dispatch({
          type: "setCurrentBookAutoBuy",
        });
      }
      //buyChapter
      await this.dispatch({
        type: "buyChapter",
        chapterId: this.readingChapter.chapterId,
        offset: 0,
      });
      await this.dispatch({
        type: "viewChapter",
        chapterId: this.readingChapter.chapterId,
        offset: 0,
        noCache:true
      });
      this.buyChapterVisible=false;
    },
    viewVolume() {
      this.viewBody = "volume";
    },
    toggleOpenVolume(volumeId) {
      this.$set(
        this.openedVolumeKey,
        volumeId,
        !this.openedVolumeKey[volumeId]
      );
      //this.openedVolumeKey[volumeId]=!this.openedVolumeKey[volumeId];
    },
    viewChapter(chapterId) {
      this.dispatch({
        type: "viewChapter",
        chapterId: chapterId,
        offset: 0,
      });
      this.viewBody = "content";
    },
    refreshVolume(){
      this.dispatch({
        type: "loadVolumeList",
        noCache:true
      });
    }
  },
};
</script>

<style lang="scss">
.chapter-view {
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  height: 100%;
  .chapter-view-body {
    margin: 0.5rem;
  }
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
  img {
    width: 260px;
  }
}
.chapter-volume-body {
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  .volume-list {
    flex: 1;
    overflow: auto;
    background: #fff;
  }
  .volume-item {
    margin: 0 5px;
    user-select: none;
  }
  .volume-item-title {
    cursor: pointer;
  }
  .volume-item-chapters {
    margin: 0 5px;
  }
  .volume-item-chapter-item {
    border-bottom: 1px solid silver;
    cursor: pointer;
  }
  .volume-item-chapter-item:hover {
    background: silver;
  }
}
</style>