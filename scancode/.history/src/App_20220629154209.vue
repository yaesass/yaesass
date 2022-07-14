<template>
  <div id="app">
    <!-- Name {{ Name }} token {{ token }} Type {{ Type }} Remarks {{ Remarks }} -->
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      // show: "",
      // activeName: "待生产订单",
      // list: [],
      // listLoading: true,
      // queryForm: {
      //   CurrentPage: 1,
      //   PageSize: 999999,
      // },
      // intervalId: null,
      // messageObj: "",
    };
  },
  created() {
    //获取winform数据
    let Name, token, Type, Remarks;
    // Name = this.getQueryString("Name");
    // token = "Bearer" + " " + this.getQueryString("token");
    // Type = this.getQueryString("DeliveryType");
    // Remarks = this.getQueryString("Remarks");
    token =
      "Bearer admin-accessToken-eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IkVBNDY5MDAwLUEwRTMtNDM2NS04OEU1LTYzNTk4MUQxNzM2NSIsIm5hbWUiOiLmiavnoIEifQ.ysDSnXIKlGLatjoH2wUIq0r65R8tv9DP_CH0vsOTbN0";
    Name = "in4";
    Type = "in";
    Remarks = "in4货口";
    if (this.Type == "in") {
      this.$router.push({
        name: "InStock",
        params: { Name, token, Type, Remarks },
      });
    } else {
      this.$router.push({
        name: "OutStock",
        params: { Name, token, Type, Remarks },
      });
    }
  },
  beforeDestroy() {
    // this.isDestroyed = true;
    // this.ws.close("测试");
  },
  methods: {
    //接收winform数据
    getQueryString(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
  },
};
</script>
 