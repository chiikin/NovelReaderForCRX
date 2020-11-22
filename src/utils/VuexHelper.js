import Vue from "vue";
const vueInst = new Vue({});
export function dispatch() {
  const args = Array.prototype.slice.call(arguments, 0);
  this.$store.dispatch
    .apply(this.$store, args)
    .then(() => {
      //每一次从外部执行的dispatch都保存一次快照
      if (args[0].type !== "logoutAndClearData")
        this.$store.dispatch({ type: "saveSnapshot" });
    })
    .catch((e) => {
      if (typeof e === "string") {
        vueInst.$toast.fail(e);
      } else {
        console.error(e);
        vueInst.$toast.fail("系统错误,请稍后再试");
      }
    });
}
