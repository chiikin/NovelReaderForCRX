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
      <van-button round block type="info" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script>
import { login, getLogonInfo } from "../../server/hbookerServer";
export default {
  name: "HbookerLogin",
  data() {
    return {
      account: "",
      password: "",
      loading: false,
    };
  },
  created() {
    //todo 自动登录
    this.autoLogin();
  },
  methods: {
    onSubmit() {
      this.loading = true;
      login({
        account: this.account,
        password: this.password,
      })
        .then(() => {
          this.loading = false;
          this.$toast.success("登录成功");
          //TODO 跳转书架
        })
        .catch(() => {
          this.loading = false;
        });
    },
    autoLogin() {
      const hbooker = getLogonInfo();
      if (hbooker.account && hbooker.password) {
        this.account = hbooker.account;
        this.password = hbooker.password;
        this.onSubmit();
      }
    },
  },
};
</script>

<style>
</style>