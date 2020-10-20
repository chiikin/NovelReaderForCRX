<template>
  <div class="nr-app">
    <p>popup.js</p>
    <hbooker-login></hbooker-login>
  </div>
</template>

<script>
import HbookerLogin from "./components/HbookerLogin.vue";

export default {
  components: {
    HbookerLogin,
  },
  mounted() {
    console.log("popup.js mounted");
  },
};
</script>

<style lang="scss" scoped>
.nr-app {
  width: 300px;
  height: 500px;
}
</style>
