<template>
  <div>
    <div></div>
    <el-table
      :data="list"
      border
      :header-cell-style="{
        background: '#F3F4F7',
        color: '#555',
        height: '97px',
      }"
      :cell-style="{ padding: '0px' }"
      :row-style="{ height: '97px' }"
      style="font-size: 50px; width: 910px; margin: 0 auto"
      ref="table"
      height="450"
    >
      <el-table-column label="商品名称" style="heihgt: 97px" v-if="!countkey">
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
    <div
      style="display: flex; justify-content: space-between; margin: 50px 100px"
    >
      <div v-if="!innum" class="inzeroa" @click="EditCloseOrderState()">
        <div class="btntxt">取消入库</div>
      </div>
      <div v-else class="inzeroa" @click="DelCodeOrder()">
        <div class="btntxt">回滚订单</div>
      </div>
      <div class="inzero" @click="zero()">
        <div class="btntxt">完成入库</div>
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
      activeName: "待入库订单",
      tableData: [], //列表数据
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    this.GetScanningOrder();

    // console.log("this.$route.params", this.$route.params);
  },
  mounted() {},

  destroyed() {
    // 在页面销毁
  },
  methods: {
    //选项卡
    handleClick(e) {
      console.log("点击tab", e.name);
      this.getlist(e.name);
    },

    //入库按钮
    ordercharge(row) {
      this.$loading({
        lock: true,
        text: "请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      this.Ordername = row.product;
      this.EditOrderState(row.OrderId);
    },

    //修改入库订单扫码状态
    EditOrderState(OrderId) {
      let that = this;
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/EditOrderState",
          {
            OrderId,
            StockType: that.Name,
            StockState: 1,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (response) {
          //console.log('EditOrderStateresponse', response.data.msg)
          if (response.data.msg != "修改成功") {
            that.$loading().close();
            that.message(response.data.msg);
          }
          that.GetScanningOrder();
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //查询入库订单状态
    GetScanningOrder(e) {
      let that = this;
      that.$loading({
        lock: true,
        text: "请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      that.list = [];
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetScanningOrder",
          {
            Type: that.Name,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (response) {
          let reqdata = response.data.data;
          // console.log("查询入库订单状态", reqdata.dt);
          if (reqdata.dt != "") {
            let { Name, token, Type, Remarks } = that;
            console.log("{ Name, token, Type, Remarks } ", {
              Name,
              token,
              Type,
              Remarks,
            });
            //有正在入库的订单
            that.$router.push({
              name: "InStockDetail",
              params: { Name, token, Type, Remarks },
            });
          } else {
            that.getlist("待入库订单"); //没有正在入库的订单
          }
          that.$loading().close();
        })
        .catch(function (error) {
          console.log("查询入库订单状态error", error);
          if (e != "err") {
            that.$loading().close();
          }
          that.$loading({
            lock: true,
            text: "网络异常，重新连接中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          setTimeout(() => {
            that.GetScanningOrder("err");
          }, 3000);
        });
    },

    //获取列表
    getlist(Type) {
      let that = this;
      this.tableData = [];
      let formData = {
        Type,
        PageSize: 999999,
        CurrentPage: 1,
        StockType: that.Name,
      };
      if (Type == "已入库订单") {
        formData.begintime = this.gettime();
        formData.endtime = this.gettime();
      }

      this.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderList",
          formData,
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (response) {
          // console.log("获取待入库订单列表", response.data.data.dt);
          let temp = response.data.data.dt,
            list = [];
          for (let i = 0; i in temp; i++) {
            list.push({
              product: temp[i].Remarks,
              OrderId: temp[i].Id,
            });
          }
          //console.log('list', list)
          that.tableData = list;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    //表格列颜色
    batchcellcolor({ row, column, rowIndex, columnIndex }) {
      row, column, rowIndex;
      if (columnIndex == 2) {
        return "color:red";
      }
    },
    totalcellcolor({ row, column, rowIndex, columnIndex }) {
      row, column, rowIndex;
      if (columnIndex == 1) {
        return "color:red";
      }
    },
    //当前日期
    gettime() {
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth() + 1;
      let dd = new Date().getDate();
      return yy + "-" + mm + "-" + dd;
    },
    //弹窗提示
    message(msg) {
      //console.log('message')
      if (msg == "success") {
        msg = "成功";
      }
      const h = this.$createElement;
      let tempHtml = h(
        "p",
        {
          style:
            " width: 100%; display:flex;align-items: center;justify-content: space-between;",
        },
        [h("span", undefined, msg)]
      );
      if (msg.indexOf("成功") != "-1") {
        this.$message({
          dangerouslyUseHTMLString: true,
          duration: 2000,
          type: "success",
          message: tempHtml,
          customClass: "workShop_message",
        });
        return true;
      }
      if (msg == "网络连接失败") {
        this.$message({
          dangerouslyUseHTMLString: true,
          duration: 2000,
          type: "error",
          message: tempHtml,
          customClass: "workShop_message",
        });
        return false;
      } else {
        this.$message({
          dangerouslyUseHTMLString: true,
          duration: 2000,
          type: "error",
          message: tempHtml,
          customClass: "workShop_message",
        });
        return false;
      }
    },
  },
};
</script>

<style>
/* .f {
  display: flex;
} */

.el-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.el-table__body-wrapper {
  flex: 1;
}

.el-tabs__nav {
  width: 100%;
}
.el-tabs__item {
  margin-top: 10px;
  width: 50%;
  height: 60px;
  text-align: center;
  font-size: 36px;
  font-weight: 300;
  letter-spacing: 0em;
}

.back {
  margin-top: -50px;
  margin-left: 750px;
}

.count {
  display: flex;
  justify-content: right;
  margin: 20px 60px 20px 0;
}

.count .counttxt {
  font-size: 40px;
  font-weight: normal;
  line-height: 24px;
  letter-spacing: 0px;
  color: #909399;
}

.counttable .el-table .cell {
  line-height: 50px;
  font-weight: 300;
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

.zero {
  display: flex;
  margin: 34px auto;
  width: 264px;
  height: 81px;
  border-radius: 15px;
  background: #409eff;
}

.zero .btntxt {
  margin: auto;
  font-size: 50px;
  font-weight: 300;
  color: #ffffff;
}

.outhistory {
  display: flex;
  margin: 34px auto;
  width: 264px;
  height: 81px;
  border-radius: 15px;
  background: #409eff;
}

.outhistory .btntxt {
  margin: auto;
  font-size: 50px;
  font-weight: 300;
  color: #ffffff;
}

.workShop_message {
  width: 40%;
  font-size: 30px;
  color: #ff7d38;
}

.workShop_message .btn {
  padding: 5px 10px;
  cursor: pointer;
  background: #ffb89143;
  border: 2px solid #ffb89143;
  border-radius: 10px;
}
</style>