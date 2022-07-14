<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="实时出库信息" class="counttable" name="实时出库信息">
      <div>
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
          <el-table-column label="商品名称" style="heihgt: 97px" v-if="outkey">
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
        <div class="zero" @click="zero()">
          <div class="btntxt">完成出库</div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="历史出库单" class="counttable" name="历史出库单">
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
      }
      // else {

      // }
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
          that.$loading().close();
          let reqData = res.data;
          console.log("查询已激活出库单", reqData);
          if (reqData.code == "200") {
            if (reqData.msg == "无激活订单") {
              that.setData({
                outState: "开始出库",
              });
              that.data.outOrderId = "";
            } else {
              that.setData({
                outState: "出库中",
              });
              that.data.outOrderId = reqData.data.model.Id;
              that.GetOrderOutListDetail();
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
        OrderId = that.data.outOrderId;
      this.$loading({
        lock: true,
        text: "请稍候...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

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
          that.$loading().close();
          let reqData = res.data;
          console.log("查询出库单明细", reqData);

          if (reqData.code == "200") {
            let dt = reqData.data.dts;
            if (dt == "") {
              that.setData({
                list: [],
              });
              // console.log("无返回", that.data.list);
            } else {
              that.setData({
                list: dt,
              });
            }
          } else {
            that.message(reqData.msg);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
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
</style>