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
    <div
      style="display: flex; justify-content: space-between; margin: 50px 100px"
    >
      <div v-if="list == ''" class="inzeroa" @click="EditCloseOrderState()">
        <div class="btntxt">取消入库</div>
      </div>
      <div v-else class="inzeroa" @click="DelCodeOrder()">
        <div class="btntxt">回滚订单</div>
      </div>
      <div class="inzero" @click="finish()" disabled>
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
      errMessage: "", //网络异常提示
      ws: "", //websocket
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    this.getVoices = window.speechSynthesis.getVoices();

    this.GetScanningOrder();

    // console.log("扫码页", this.$route.params);
  },
  mounted() {},

  destroyed() {
    // 页面销毁
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
          if (that.ws != "") {
            that.ws.onclose = function () {
              console.log("主动关闭websocket");
            };
            that.ws.close();
            that.ws = "";
          }
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
            that.orderName = reqdata.dt[0].Remarks.replace("<br/>", " ");
            that.start();
          } else {
            let { Name, token, Type, Remarks } = that;
            that.$router.push({
              name: "InStock",
              params: { Name, token, Type, Remarks },
            });
          }
        })
        .catch(function (error) {
          console.log("查询入库订单状态error", error);
          if (that.errMessage == "") {
            if (e == "err") {
              that.$loading().close();
            }
            that.$loading({
              lock: true,
              text: "网络异常，重新连接中",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.7)",
            });
          }

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
        console.log("  that.ws ", that.ws);

        var wsImpl = window.WebSocket || window.MozWebSocket;
        that.ws = new wsImpl(webhttp);

        that.ws.onmessage = function (e) {
          console.log("Socket消息", e);
          if (e.data != "connect") {
            let temp = JSON.parse(e.data);
            console.log("websocket数据", temp);

            if (temp.code == 200) {
              // that.GetScanningOrder();
              let id = temp.data.Id,
                name = temp.data.Name;
              if (that.list.length == 0) {
                that.list.push({
                  id,
                  name,
                  num: temp.data.Num,
                });
              } else {
                let key = false,
                  t;
                for (let i in that.list) {
                  if (id == that.list[i].id) {
                    key = true;
                    t = i;
                    that.list[i].num = temp.data.Num;
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
                    num: temp.data.Num,
                  });
                }
              }
            } else {
              that.message(temp.msg);
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
              console.log("入库订单没有扫码的情况下取消", response.data.msg);
              that.message(response.data.msg);
              that.GetScanningOrder();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(() => {});
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
              console.log("入库订单已经扫码的情况下回滚", response.data.msg);
              that.GetScanningOrder();
            })
            .catch(function (error) {
              console.log("入库订单已经扫码的情况下回滚", error);
            });
        })
        .catch(() => {
          // that.message("已取消回滚");
        });
    },

    //完成入库按钮
    finish() {
      let that = this;

      this.$confirm("此操作将上传订单且无法修改, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$loading({
            lock: true,
            text: "请稍候...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          that.$axios
            .post(
              "https://www.moondeity.com:8308/api/Areas/OrderInfo/EditOrderState",
              {
                OrderId: that.Id,
                StockType: that.Name,
                StockState: 0,
              },
              {
                headers: {
                  Authorization: that.token,
                },
              }
            )
            .then(function (response) {
              //console.log('EditOrderStateresponse', response.data.msg)
              that.$loading().close();
              that.message(response.data.msg);
              that.GetScanningOrder();
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(() => {});
    },

    //弹窗提示
    message(msg) {
      //console.log('message')
      if (msg == "success") {
        msg = "操作成功";
      }
      if (msg == "修改成功") {
        msg = "操作成功";
      }
      this.speak(msg);
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

    speak(msg) {
      var msgSpeak = new SpeechSynthesisUtterance();
      // console.log(
      //   "window.speechSynthesis.getVoices()",
      //   window.speechSynthesis.getVoices()
      // );
      this.getVoices = window.speechSynthesis.getVoices()[2];
      msgSpeak.text = msg; // 文字内容
      msgSpeak.lang = this.getVoices.lang; // 使用的语言:中文
      msgSpeak.volume = 1; // 声音的音量，区间范围是0到1，默认是1。
      msgSpeak.rate = 1.2; // 设置播放语速，范围：0.1 - 10之间    正常为1倍播放
      msgSpeak.pitch = 2; // 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1。
      msgSpeak.voice = this.getVoices;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msgSpeak);
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