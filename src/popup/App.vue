<template>
  <div class="nr-app">
    <component v-bind:is="pageComponent"></component>
  </div>
</template>

<script>
export default {
  computed: {
    pageComponent() {
      return this.$store.state.pageComponent;
    },
  },
};
</script>

<style lang="scss" scoped>
.nr-app {
  width: 300px;
  height: 500px;
}
</style>
