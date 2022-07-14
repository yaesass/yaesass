<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :disabled="outState"
      label="实时出库信息"
      class="counttable"
      name="实时出库信息"
    >
      <div class="count">
        <div class="counttxt">{{ Remarks }}</div>
      </div>
      <el-table
        :data="tableData"
        border
        :header-cell-style="{
          background: '#F2F6FC',
          height: '48px',
          color: '#909399',
          fontSize: '40px',
        }"
        style="width: 95%; margin: 40px auto 0 auto; font-size: 50px"
        :cell-style="totalcellcolor"
        height="400"
        :row-style="{ height: '90px' }"
      >
        <el-table-column label="商品名称" style="heihgt: 97px" prop="Name">
        </el-table-column>
        <el-table-column align="center" label="数量" width="323">
          <template slot-scope="scope">
            <div style="color: red">{{ scope.row.Quantity }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div class="zero" @click="zero()">
        <div class="btntxt">{{ outState ? "开始出库" : "完成出库" }}</div>
      </div>
    </el-tab-pane>
    <el-tab-pane
      :disabled="outState"
      label="历史出库单"
      class="counttable"
      name="历史出库单"
    >
      <el-table
        :data="tableData"
        border
        :header-cell-style="{
          background: '#F2F6FC',
          height: '48px',
          color: '#909399',
          fontSize: '40px',
        }"
        style="width: 910px; margin: 40px auto; font-size: 25px"
        :cell-style="totalcellcolor"
        height="450"
        :row-style="{ height: '48px' }"
      >
        <el-table-column align="center" prop="product" label="产品名称">
        </el-table-column>
        <el-table-column align="center" prop="time" label="时间">
        </el-table-column>
        <el-table-column align="center" prop="num" label="出库数量">
        </el-table-column>
        <el-table-column align="center" prop="state" label="出库类型">
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>
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
      activeName: "实时出库信息",
      tableData: [], //列表数据
      outOrderId: "", //出库单单号
      ws: "", //websocket
      errMessage: "", //错误提示
      outState: false, //出库状态
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;

    // console.log("this.$route.params", this.$route.params);
  },
  mounted() {
    this.GetOrderOut();
  },

  destroyed() {
    // 在页面销毁
  },
  methods: {
    //选项卡
    handleClick(e) {
      console.log("点击tab", e.name);
      if (e.name == "实时出库信息") {
        this.GetOrderOut();
      } else {
        if (this.ws != "") {
          this.ws.onclose = function () {
            console.log("主动关闭websocket");
          };
          this.ws.close();
          this.ws = "";
        }
      }
    },

    //查询已激活出库单
    GetOrderOut() {
      let that = this;
      this.$loading({
        lock: true,
        text: "请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderOut",
          {
            Name: that.Name,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (res) {
          let reqData = res.data;
          console.log("查询已激活出库单", reqData);
          if (reqData.code == "200") {
            if (reqData.msg == "无激活订单") {
              that.outState = false;
              //  that.outStart(); //没有激活的出库单 ，不处理
            } else if (reqData.msg == "查询成功") {
              that.outState = true;
              that.outOrderId = reqData.data.model.Id;
              that.GetOrderOutListDetail();
            } else {
              that.message(reqData.msg);
            }
          } else {
            that.message(reqData.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //新建出库单
    outStart() {
      let that = this;
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/AddOrderOut",
          {
            Name: that.Name,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (res) {
          let reqData = res.data;
          console.log("生成出库单", reqData);
          if (reqData.code == "200") {
            setTimeout(() => {
              that.GetOrderOut();
            }, 5000);
          } else {
            // wx.showToast({
            //   title: "加载失败，请稍后再试",
            //   icon: "none",
            //   duration: 1000,
            // });
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //查询出库单明细
    GetOrderOutListDetail() {
      let that = this,
        OrderId = that.outOrderId;
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
          if (that.ws != "") {
            that.ws.onclose = function () {
              console.log("主动关闭websocket");
            };
            that.ws.close();
            that.ws = "";
          }
          if (reqData.code == "200") {
            let dt = reqData.data.dts;
            if (dt == "") {
              that.tableData = [];
              // console.log("无返回", that.data.list);
            } else {
              that.tableData2 = new Object();
              that.tableData = [];
              that.listData(dt);
            }
            that.start();
          } else {
            that.message(reqData.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    listData(dt) {
      for (let i in dt) {
        let t = dt[i];
        // console.log("t", t);
        if (!this.tableData2[t.ProductId]) {
          // 如果没有这个商品
          this.tableData2[t.ProductId] = {
            Name: t.Name,
            Quantity: t.Quantity,
          };
        } else {
          this.tableData2[t.ProductId].Quantity++;
        }
      }
      for (let i in this.tableData2) {
        let t = this.tableData2[i];
        this.tableData[this.tableData.length] = {
          Name: t.Name,
          Quantity: t.Quantity,
        };
      }
      // console.log("that.tableData2", this.tableData2);
      // console.log("that.tableData", this.tableData);
      // that.tableData = dt;
    },

    //开始websocket
    start() {
      if (this.errMessage == "") {
        this.$loading({
          lock: true,
          text: "正在与服务器连接...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
      }
      let webhttp = "ws://192.168.99.175:8383/" + this.Name;
      var that = this;
      if (window.WebSocket) {
        console.log("  that.ws ", that.ws);

        var wsImpl = window.WebSocket || window.MozWebSocket;
        that.ws = new wsImpl(webhttp);

        that.ws.onmessage = function (e) {
          console.log("Socket消息", e);
          if (e.data != "connect") {
            let temp = JSON.parse(e.data);
            if (temp.code == 200 && temp.msg == "成功") {
              let id = temp.data.Id,
                name = temp.data.Name;

              console.log("websocket数据", temp);

              if (that.tableData.length == 0) {
                that.list.push({
                  id,
                  name,
                  num: 1,
                });
              } else {
                let key = false,
                  t;
                for (let i in that.tableData) {
                  if (id == that.tableData[i].id) {
                    key = true;
                    t = i;
                    that.tableData[i].num++;
                    break;
                  }
                }
                if (key) {
                  let temp = that.tableData[t];
                  that.tableData.splice(t, 1);
                  that.tableData.push(temp);
                } else {
                  that.tableData.push({
                    id,
                    name,
                    num: 1,
                  });
                }
              }
              // setTimeout(() => {
              //   that.$refs.table.bodyWrapper.scrollTop =
              //     that.$refs.table.bodyWrapper.scrollHeight;
              // }, 50);
            } else {
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
          }
        };
        that.ws.onopen = function () {
          // that.message("连接成功");
          that.$loading().close();

          if (that.errMessage != "") {
            that.errMessage.close();
            that.errMessage = "";
          }
        };
        that.ws.onclose = function (e) {
          console.log("close", e);

          that.reconnect();
        };
        that.ws.error = function () {
          console.log("error");

          that.reconnect();
        };
      }
    },

    reconnect() {
      console.log("reconnect连接断开");

      if (this.errMessage == "") {
        this.$loading().close();
        this.$loading({
          lock: true,
          text: "网络异常，重新连接中...",
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
        that.GetOrderOut();
      }, 5000);
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
    totalcellcolor({ row, column, rowIndex, columnIndex }) {
      row, column, rowIndex;
      if (columnIndex == 1) {
        return "color:red";
      }
    },
  },
};
</script>

<style>
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
</style>