<template>
  <svg
    v-if="lock"
    t="1605432580596"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="7283"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="200"
    height="200"
  >

    <path
      d="M818.247 412.327h-45.989v-70.992c0-152.308-123.463-275.779-275.778-275.779S220.698 189.027 220.698 341.335v70.992h-45.987c-25.379 0-45.988 20.566-45.988 45.987v455.407c0 25.428 20.56 45.989 45.988 45.989h643.536c25.377 0 45.988-20.56 45.988-45.989V458.314c-0.045-25.42-20.611-45.987-45.988-45.987z m-137.915 0H312.625v-70.992c0-101.554 82.345-183.853 183.855-183.853 101.51 0 183.853 82.343 183.853 183.853v70.992h-0.001z m0 0"
      p-id="7284"
    ></path>
  </svg>
  <svg
    v-else
    t="1605432076066"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="6199"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="200"
    height="200"
  >

    <path
      d="M588.8 601.6a32 32 0 0 1 32 32v89.6a32 32 0 1 1-64 0v-89.6a32 32 0 0 1 32-32z m281.6 236.8v-290.24c0-17.6-14.4-32-32-32H339.2c-17.6 0-32 14.4-32 32v290.24c0 17.6 14.4 32 32 32h499.2c17.6 0 32-14.4 32-32z m-32-386.24c52.8 0 96 43.168 96 96v290.24c0 52.768-43.2 96-96 96H339.2c-52.8 0-96-43.232-96-96v-290.24c0-52.832 43.2-96 96-96h112.96V290.24C452.16 200.608 379.52 128 290.24 128A162.24 162.24 0 0 0 128 290.24v179.2c0 17.6-14.4 32-32 32s-32-14.4-32-32v-179.2C64 165.44 165.44 64 290.24 64c124.48 0 225.92 101.44 225.92 226.24v161.92H838.4z"
      p-id="6200"
      fill="#2c2c2c"
    ></path>
  </svg>
</template>

<script>
export default {
  name:"LockIcon",
  props: {
    lock: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
</style>