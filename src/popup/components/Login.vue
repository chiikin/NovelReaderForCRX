<template>
  <van-form @submit="onSubmit">
    <van-field
      v-model="account"
      name="用户名"
      label="用户名"
      placeholder="用户名"
      :rules="[{ required: true, message: '请填写用户名' }]"
    />
    <van-field
      v-model="password"
      type="password"
      name="密码"
      label="密码"
      placeholder="密码"
      :rules="[{ required: true, message: '请填写密码' }]"
    />
    <div style="margin: 16px">
      <van-button round block type="info" native-type="submit">登录</van-button>
    </div>
  </van-form>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      account: "",
      password: "",
      loading: false,
    };
  },
  // created() {
  //   //todo 自动登录
  //   //this.autoLogin();
  // },
  methods: {
    onSubmit() {
      this.loading = true;
      this.$store.dispatch({
        type: "login",
        account: this.account,
        password: this.password,
      });
    },
    // autoLogin() {
    //   const hbooker = getLoginInfo();
    //   if (hbooker.account && hbooker.password) {
    //     this.account = hbooker.account;
    //     this.password = hbooker.password;
    //     this.onSubmit();
    //   }
    // },
  },
};
</script>

<style>
</style>