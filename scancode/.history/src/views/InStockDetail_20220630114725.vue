<template>
  <div>
    <div class="orderName">{{ orderName }}</div>
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
    <div
      style="display: flex; justify-content: space-between; margin: 50px 100px"
    >
      <div v-if="list == ''" class="inzeroa" @click="EditCloseOrderState()">
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
      orderName: "",
      list: [], //列表数据
      errMessage: "", //
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    this.Id = this.$route.params.Id;

    this.GetScanningOrder();

    // console.log("扫码页", this.$route.params);
  },
  mounted() {},

  destroyed() {
    // 在页面销毁
  },
  methods: {
    //查询有没有正在扫码的订单
    GetScanningOrder(e) {
      let that = this;
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
            if (reqdata.dt[0].RealQuantity > 0) {
              //显示已扫描数据
              let num = reqdata.dt[0].RealQuantity;
              let name = reqdata.dt[0].Remarks.split(">")[1].split("第")[0]; //截取remarks获得产品名

              that.list.push({
                id: reqdata.dt[0].ProductId,
                name,
                num,
              });
              console.log("表格list", that.list);
            }
            that.Id = reqdata.dt[0].Id;
            that.orderName = reqdata.dt[0].Remarks.replace("<br/>", "");
            that.start();
          } else {
            let { Name, token, Type, Remarks } = that;
            that.$router.push({
              name: "InStockDetail",
              params: { Name, token, Type, Remarks },
            });
          }
        })
        .catch(function (error) {
          console.log("查询入库订单状态error", error);
          if (e == "err") {
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

    //开始websocket
    start() {
      this.$loading({
        lock: true,
        text: "正在与服务器连接...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let webhttp = "ws://192.168.99.175:8383/" + this.Name;
      var that = this;
      if (window.WebSocket) {
        var wsImpl = window.WebSocket || window.MozWebSocket;
        window.ws = new wsImpl(webhttp);
        window.ws.onmessage = function (e) {
          console.log("Socket消息", e);
          if (e.data != "connect") {
            let temp = JSON.parse(e.data);
            console.log("websocket数据", temp);
            if (temp.code == 201) {
              const h = that.$createElement;
              let tempHtml = h(
                "p",
                {
                  style:
                    " width: 100%; display:flex;align-items: center;justify-content: space-between;",
                },
                [h("span", undefined, temp.msg)]
              );
              that.messageObj = that.$message({
                dangerouslyUseHTMLString: true,
                duration: 2000,
                type: "warning",
                message: tempHtml,
                customClass: "workShop_message",
              });
            }
            if (temp.code == 200) {
              let id = temp.data.Id,
                name = temp.data.Name;
              if (that.list.length == 0) {
                that.list.push({
                  id,
                  name,
                  num: 1,
                });
              } else {
                let key = false,
                  t;
                for (let i in that.list) {
                  if (id == that.list[i].id) {
                    key = true;
                    t = i;
                    that.list[i].num++;
                    break;
                  }
                }
                if (key) {
                  let temp = that.list[t];
                  that.list.splice(t, 1);
                  that.list.push(temp);
                } else {
                  that.list.push({
                    id,
                    name,
                    num: 1,
                  });
                }
              }
              setTimeout(() => {
                that.$refs.table.bodyWrapper.scrollTop =
                  that.$refs.table.bodyWrapper.scrollHeight;
              }, 50);
            }
          }
        };
        window.ws.onopen = function () {
          that.message("连接成功");
          that.$loading().close();

          if (that.errMessage != "") {
            that.errMessage.close();
            that.errMessage = "";
          }
          // that.webopen = true

          //that.GetScanningOrder()
          //console.log('websocket open', that.webopen)
        };
        window.ws.onclose = function (e) {
          console.log("close", e);

          // that.$loading().close()
          // if (that.errMessage != '') {
          // 	that.errMessage.close()
          // }

          that.reconnect();
        };
        window.ws.error = function () {
          console.log("error");

          // that.$loading().close()
          // if (that.errMessage != '') {
          // 	that.errMessage.close()
          // }

          that.reconnect();
        };
      }
    },

    reconnect() {
      console.log("连接断开");

      if (this.errMessage == "") {
        this.$loading().close();
        this.$loading({
          lock: true,
          text: "网络异常，重新连接中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        const h = this.$createElement;
        let tempHtml = h(
          "p",
          {
            style:
              " width: 100%; display:flex;align-items: center;justify-content: space-between;",
          },
          [h("span", undefined, "网络异常，重新连接中")]
        );
        this.errMessage = this.$message({
          dangerouslyUseHTMLString: true,
          duration: 0,
          type: "error",
          message: tempHtml,
          customClass: "workShop_message",
        });
      }
      var that = this;
      setTimeout(function () {
        that.GetScanningOrder();
      }, 5000);
    },

    //入库订单没有扫码的情况下取消
    EditCloseOrderState() {
      let that = this;
      that
        .$confirm("此操作将取消入库, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          that.$axios
            .post(
              "https://www.moondeity.com:8308/api/Areas/OrderInfo/EditCloseOrderState",
              {
                OrderId: that.Id,
              },
              {
                headers: {
                  Authorization: that.token,
                },
              }
            )
            .then(function (response) {
              //console.log('EditCloseOrderState--response', response.data.msg)
              if (response.data.msg == "修改成功") {
                that.message(response.data.msg);
              } else {
                that.message("已取消入库");
              }
              that.GetScanningOrder();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(() => {
          that.message("已取消关闭");
        });
    },

    //入库订单已经扫码的情况下回滚
    DelCodeOrder() {
      let that = this;
      that
        .$confirm("此操作将回滚订单且需重新扫描产品, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          that.$axios
            .post(
              "https://www.moondeity.com:8308/api/Areas/OrderInfo/DelCodeOrder",
              {
                Id: that.Id,
              },
              {
                headers: {
                  Authorization: that.token,
                },
              }
            )
            .then(function (response) {
              //console.log('DelCodeOrder--response', response.data.msg)
              if (response.data.msg == "回滚成功") {
                that.message(response.data.msg);
              } else {
                that.message(response.data.msg);
              }
              that.GetScanningOrder();
            })
            .catch(function (error) {
              console.log("入库订单已经扫码的情况下回滚", error);
            });
        })
        .catch(() => {
          that.message("已取消回滚");
        });
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
.orderName {
  width: 95%;
  margin: 30px auto;
  font-size: 36px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* .el-table {
  width: 100%;
  display: flex;
  flex-direction: column;
} */

/* .el-table__body-wrapper {
  flex: 1;
}

.el-tabs__nav {
  width: 100%;
} */
/* .el-tabs__item {
  margin-top: 10px;
  width: 50%;
  height: 60px;
  text-align: center;
  font-size: 36px;
  font-weight: 300;
  letter-spacing: 0em;
} */
.el-table .cell {
  line-height: 50px;
  font-weight: 300;
}
.el-message-box {
  width: 80%;
}
.el-message-box__header,
.el-message-box__status {
  display: none;
}

.el-message-box__message{
  padding : 0 12px;
}

.el-message-box__message p {
  font-size: 36px;
  line-height: 50px;
}
</style>