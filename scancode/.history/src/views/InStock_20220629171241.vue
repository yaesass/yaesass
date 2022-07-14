<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="待入库订单" class="counttable" name="待入库订单">
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
        style="width: 95%; margin: 40px auto 0 auto; font-size: 25px"
        :cell-style="totalcellcolor"
        height="500"
        :row-style="{ height: '48px' }"
      >
        <el-table-column align="center" label="生产单">
          <template slot-scope="scope">
            <span v-html="scope.row.product"></span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="{ row }">
            <el-button
              type="primary"
              round
              @click="ordercharge(row)"
              style="font-size: 20px"
            >
              入库
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane label="已入库订单" class="counttable" name="已入库订单">
      <el-table
        :data="tableData"
        border
        :header-cell-style="{
          background: '#F2F6FC',
          height: '48px',
          color: '#909399',
          fontSize: '40px',
        }"
        style="width: 95%; margin: 20px auto 0 auto; font-size: 25px"
        :cell-style="totalcellcolor"
        height="550"
        :row-style="{ height: '48px' }"
      >
        <el-table-column align="center" prop="product" label="产品名称">
        </el-table-column>
        <el-table-column align="center" prop="num" label="入库数量">
        </el-table-column>
        <el-table-column align="center" prop="time" label="出库时间">
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
          // let reqdata = response.data.data;
          // console.log("查询入库订单状态", reqdata.dt);
          // if (reqdata.dt != "") {
          //   let { Name, token, Type, Remarks } = that;
          //   //有正在入库的订单
          //   that.$router.push({
          //     name: "InStockDetail",
          //     params: { Name, token, Type, Remarks },
          //   });
          // } else {
          //   that.getlist("待入库订单"); //没有正在入库的订单
          // }
          // that.$loading().close();
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
      let that = this;

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
          console.log("获取待入库订单列表", response.data.data.dt);
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