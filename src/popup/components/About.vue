<template>
  <div>
    <van-nav-bar
      title="关于"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <div style=" padding: 5px">
      <p>软件声明：</p>
      <p>
        1.本软件不包含任何破解内容，仅可浏览您所登录的小说网站的账户下的书架书籍，且仅可浏览免费小说、您账户已订阅的小说。
      </p>
      <p>
        2.作者写书不易，请自觉保护版权！请勿将本软件用于非法行为，作者不承担任何责任！
      </p>
      <p>隐私声明：</p>
      <p>1.本软件不会收集任何用户信息</p>
      <p>2.软件所有用户信息均存储于本地</p>

      <br />
      <br />
      <p style="text-align: center">power by chiikin</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
  methods: {
    onClickLeft() {
      this.dispatch({ type: "backPage" });
    },
  },
};
</script>

<style>
</style>