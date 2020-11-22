<template>
  <van-form @submit="onSubmit">
    <h1 style="text-align: center">刺猬猫登录</h1>
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
    <div style="text-align:center;font-size:14px;    cursor: pointer;">
      <a @click="about">关于</a> ·
      <a @click="donate">捐赠</a>
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
  methods: {
    async onSubmit() {
      this.loading = true;
      await this.dispatch({
        type: "login",
        account: this.account,
        password: this.password,
      });
      this.loading = false;
    },
    about() {
      this.dispatch({
        type: "about",
      });
    },
    donate() {
      this.dispatch({
        type: "donate",
      });
    },
  },
};
</script>

<style>
</style>