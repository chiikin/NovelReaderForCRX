<template>
  <div></div>
</template>

<script>
export default {
  name: "Bookshelf",

  created() {
    this.$store.dispatch({ type: "recoveryLoginStatus" });
  },
};
</script>

<style>
</style>