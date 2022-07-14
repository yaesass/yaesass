<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="实时出库信息" class="counttable" name="实时出库信息">
      <div class="count">
        <div class="counttxt">{{ Remarks }}</div>
      </div>
      <el-table
        ref="tableData"
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
      <div v-if="outState" class="zero" @click="outStart()">
        <div class="btntxt">开始出库</div>
      </div>
      <div v-else class="zero" @click="EditOrderOutState()">
        <div class="btntxt">完成出库</div>
      </div>
    </el-tab-pane>
    <el-tab-pane
      :disabled="!outState"
      label="历史出库单"
      class="counttable"
      name="历史出库单"
    >
      <el-table
        v-loadmore="loadMore"
        :data="tableData"
        border
        :header-cell-style="{
          background: '#F2F6FC',
          height: '48px',
          color: '#909399',
          fontSize: '40px',
        }"
        style="width: 95%; margin: 40px auto; font-size: 40px"
        :cell-style="totalcellcolor"
        height="550"
        :row-style="{ height: '48px' }"
      >
        <el-table-column align="center" label="出库时间">
          <template slot-scope="scope">
            <span v-html="scope.row.AddTime"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="Quantity" label="出库数量">
        </el-table-column>
        <el-table-column align="center" label="操作" width="300px">
          <template #default="{ row }">
            <el-button
              type="primary"
              round
              @click="outOrderDetail(row)"
              style="font-size: 20px"
            >
              查看
            </el-button>
          </template>
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
      outState: true, //出库状态
      CurrentPage: 1, //历史出库单页码
    };
  },
  created() {
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    this.getVoices = window.speechSynthesis.getVoices();
    // console.log("this.$route.params", this.$route.params);
    if (this.$route.params.state == "back") {
      this.activeName = "历史出库单";
      this.CurrentPage = 1;
      this.GetOrderOutList();
    }
    this.GetOrderOut();
  },
  mounted() {},
  directives: {
    // 监听表格滚动
    loadmore: {
      bind(el, binding) {
        const selectWrap = el.querySelector(".el-table__body-wrapper");
        selectWrap.addEventListener("scroll", function () {
          const scrollDistance =
            this.scrollHeight - this.scrollTop - this.clientHeight;
          if (scrollDistance <= 0.5) {
            binding.value(); //执行在使用时绑定的函数，在这里即loadMorePerson方法
          }
        });
      },
    },
  },
  destroyed() {
    // 在页面销毁
  },
  methods: {
    //选项卡
    handleClick(e) {
      console.log("点击tab", e.name);
      this.tableData = [];
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
        this.CurrentPage = 1;
        this.GetOrderOutList();
      }
    },
    //新建出库单
    outStart() {
      this.$loading({
        lock: true,
        text: "请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
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

    //完成出库
    EditOrderOutState() {
      let that = this;
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/EditOrderOutState",
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
          if (reqData.msg == "修改成功") {
            that.message("出库成功");
          } else {
            that.message(reqData.msg);
          }
          that.tableData = [];
          that.GetOrderOut();
        })
        .catch(function (error) {
          console.log(error);
        });
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
              that.outState = true;
              that.$loading().close();
              //  that.outStart(); //没有激活的出库单 ，不处理
            } else if (reqData.msg == "查询成功") {
              that.activeName = "实时出库信息";
              that.outState = false;
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
              that.tableData = dt;
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
        var wsImpl = window.WebSocket || window.MozWebSocket;
        that.ws = new wsImpl(webhttp);

        that.ws.onmessage = function (e) {
          // console.log("Socket消息", e);
          if (e.data != "connect") {
            let temp = JSON.parse(e.data);
            if (temp.code == 200 && temp.msg == "成功") {
              let dt = temp.data.dt,
                list = temp.data.list;
              console.log("websocket数据", { dt, list });

              //第一步刷新数量
              for (let i in that.tableData) {
                for (let j in dt) {
                  if (that.tableData[i].ProductId == dt[j].ProductId) {
                    that.tableData[i].Quantity = dt[j].Quantity;
                    delete dt[j];
                    break;
                  }
                }
              }

              //第二步排序
              for (let i in list) {
                let id = list[i];
                for (let j in that.tableData) {
                  let item = that.tableData[j];
                  if (id == item.ProductId) {
                    let temp = item;
                    that.tableData.splice(j, 1);
                    that.tableData.push(temp);
                    break;
                  }
                }
              }
              //滚动到最底部
              that.$refs.tableData.bodyWrapper.scrollTop =
                that.$refs.tableData.bodyWrapper.scrollHeight;
              that.speak("入库成功");
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
        that.GetOrderOut();
      }, 5000);
    },
    ////////////////////历史出库单//////////////////////////
    //表格触底事件
    loadMore() {
      this.CurrentPage++;
      this.GetOrderOutList();
    },

    //查看出库单事件
    outOrderDetail(row) {
      console.log("row", row);
      let { Name, token, Type, Remarks } = this;

      this.$router.push({
        name: "OutStockDetail",
        params: {
          id: row.Id,
          AddTime: row.AddTime,
          Name,
          token,
          Type,
          Remarks,
        },
      });
    },

    GetOrderOutList() {
      let that = this;
      that.$axios
        .post(
          "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderOutList",
          {
            Name: that.Name,
            CurrentPage: this.CurrentPage,
            PageSize: 10,
          },
          {
            headers: {
              Authorization: that.token,
            },
          }
        )
        .then(function (res) {
          let reqData = res.data;
          console.log("历史出库单", reqData);
          for (let i in reqData.data.dt) {
            reqData.data.dt[i].AddTime = reqData.data.dt[i].AddTime.replace(
              "T",
              "<br/>"
            );
          }
          that.tableData = that.tableData.concat(reqData.data.dt);
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    //弹窗提示
    message(msg) {
      //console.log('message')
      if (msg == "success") {
        msg = "操作成功";
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
      this.speak(msg);

      if (msg.indexOf("成功") != "-1") {
        this.$message({
          dangerouslyUseHTMLString: true,
          duration: 2000,
          type: "success",
          message: tempHtml,
          customClass: "workShop_message",
        });
        return true;
      } else if (msg == "网络连接失败") {
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