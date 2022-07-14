<template>
  <div id="app">
    Name {{ Name }} token {{ token }} Type {{ Type }} Remarks {{ Remarks }}
    <router-link to="InStock">in</router-link>
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
    this.Name = this.getQueryString("Name");
    this.token = "Bearer" + " " + this.getQueryString("token");
    this.Type = this.getQueryString("DeliveryType");
    this.Remarks = this.getQueryString("Remarks");
    console.log("this", this);
    // if (this.Type == "in") {
    // this.$router.push({
    //   name: "in",
    //   params: { setid: 111222 },
    // });
    // } else {
    //   this.$router.push({
    //     path: "/outStock/outStock",
    //     params: { setid: 111222 },
    //   });
    // }
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
 