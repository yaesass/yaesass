<template>
  <div>
    <div class="orderName">{{ orderName }}</div>
    <el-table
      :data="list"
      border
      :header-cell-style="{
        background: '#F2F6FC',
        height: '48px',
        color: '#909399',
        fontSize: '40px',
      }"
      :cell-style="{ padding: '0px' }"
      :row-style="{ height: '97px' }"
      style="font-size: 50px; width: 910px; margin: 0 auto"
      ref="table"
      height="450"
    >
      <el-table-column label="商品名称" style="heihgt: 97px">
        <template slot-scope="scope">
          <span v-html="scope.row.name"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="数量" width="323">
        <template slot-scope="scope">
          <div style="color: red">{{ scope.row.num }}</div>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex; justify-content: center; margin: 50px 100px">
      <div class="inzero" @click="back()" disabled>
        <div class="btntxt">返回</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InStock",
  data() {
    return {
      token: "",
      Name: "",
      Type: "",
      Remarks: "",
      orderName: "",
      list: [], //列表数据
      errMessage: "", //网络异常提示
      ws: "", //websocket
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    this.GetOrderOutListDetail(this.$route.params.id);

    // console.log("扫码页", this.$route.params);
  },
  mounted() {},

  destroyed() {
    // 页面销毁
  },
  methods: {
    //查询出库单明细
    GetOrderOutListDetail(OrderId) {
      let that = this;
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderOutListDetail",
          {
            OrderId,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (res) {
          //   that.$loading().close();
          let reqData = res.data;
          console.log("查询出库单明细", reqData);

          if (reqData.code == "200") {
            that.list = reqData.data.dts;
          } else {
            that.message(reqData.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
};
</script>

<style>
.orderName {
  width: 95%;
  margin: 30px auto;
  font-size: 36px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-table .cell {
  line-height: 50px;
  font-weight: 300;
}
.el-message-box {
  width: 75%;
}
.el-message-box__header,
.el-message-box__status {
  display: none;
}

.el-message-box__message {
  padding: 0 12px !important;
}

.el-message-box__message p {
  padding: 20px 0;
  font-size: 36px;
  line-height: 50px;
}

.el-message-box__btns button {
  margin-left: 40px !important;
  padding: 10px 30px;
  font-size: 36px;
  line-height: 50px;
}

.inzeroa {
  display: flex;
  width: 264px;
  height: 81px;
  border-radius: 15px;
  background: #d8d8d8;
}

.inzeroa .btntxt {
  margin: auto;
  font-size: 50px;
  font-weight: 300;
  color: #aaaaaa;
}

.inzero {
  display: flex;
  width: 264px;
  height: 81px;
  border-radius: 15px;
  background: #409eff;
}

.inzero .btntxt {
  margin: auto;
  font-size: 50px;
  font-weight: 300;
  color: #ffffff;
}
</style>