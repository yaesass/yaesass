<template>
  <div id="app">
    Name {{ Name }} token {{ token }} Type {{ Type }} Remarks {{ Remarks }}
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
    if (this.Type == "out") {
      this.outkey = true;
      this.activeName = "second";
      this.tab = false;
      this.GetOrderOut();
    } else {
      this.GetScanningOrder();
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
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
