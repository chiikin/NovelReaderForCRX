<template>
  <div class="chapter-view">
    <h3 class="chapter-title"></h3>
    <div>
      {{JSON.stringify(readingChapter)}}
    </div>
  </div>
</template>

<script>
export default {
  name: "ChapterView",
  computed:{
    readingChapter(){
      
      return this.$store.state.readingChapter;
    }
  },
  created(){

  }
};
</script>

<style lang="scss">
.chapter-view {
  background: lightpink;
}
</style>