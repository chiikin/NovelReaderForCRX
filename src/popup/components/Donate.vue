<template>
  <div>
    <van-nav-bar
      title="捐赠"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <h3 style="text-align: center">
      如果软件对你有帮助，可以请作者喝杯速溶咖啡
    </h3>
    <div style="text-align:center;width:100%;">
      <img src="../assets/images/weixin_pay.jpg" style="height: 200px" />
      <img src="../assets/images/zfb_pay.jpg" style="height: 200px" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Donate",
  methods: {
    onClickLeft() {
      this.dispatch({ type: "backPage" });
    },
  },
};
</script>

<style>
</style>