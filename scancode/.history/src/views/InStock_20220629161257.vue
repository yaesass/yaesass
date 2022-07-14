<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      label="实时计数统计"
      class="counttable"
      name="second"
      :disabled="tab"
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
        style="width: 910px; margin: 40px auto; font-size: 25px"
        :cell-style="totalcellcolor"
        height="450"
        :row-style="{ height: '48px' }"
        v-if="countkey"
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
    <el-tab-pane
      label="历史计数统计"
      class="counttable"
      name="first"
      :disabled="tab"
    >
      <div class="f" style="justify-content: space-around; margin-top: 17px">
        <el-date-picker
          v-model="value1"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
        <el-button type="primary" @click="inquire()">查询</el-button>
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
        style="width: 910px; margin: 40px auto; font-size: 25px"
        :cell-style="totalcellcolor"
        height="450"
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
    };
  },
  created() {
    // this.GetScanningOrder();
    this.token = this.$route.params.token;
    this.Name = this.$route.params.Name;
    this.Type = this.$route.params.Type;
    this.Remarks = this.$route.params.Remarks;
    console.log("this.$route.params", this.$route.params);
  },
  mounted() {},

  destroyed() {
    // 在页面销毁
  },
  methods: {
    //选项卡
    handleClick() {
      this.inquire();
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
      this.$axios
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
          console.log("查询入库订单状态", reqdata.dt);
          if (reqdata.dt != "") {
            let { Name, token, Type, Remarks } = this;
            //有正在入库的订单
            this.$router.push({
              name: "InStockDetail",
              params: { Name, token, Type, Remarks },
            });
          } else {
            that.getlist("wait"); //没有正在入库的订单
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
    getlist(e) {
      this.tableData = [];
      if (this.begintime == "") {
        this.begintime = "2022-04-10";
      }
      if (this.endtime == "") {
        this.gettime();
      }
      let that = this;
      if (e == "wait") {
        //入库订单
        ////console.log('order')
        this.$axios
          .post(
            "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderList",
            {
              Type: "待入库订单",
              PageSize: 99,
              CurrentPage: 1,
              StockType: that.Name,
            },
            {
              headers: {
                Authorization: that.token,
              },
            }
          )
          .then(function (response) {
            // ////console.log('getOrderList', response.data.data.dt)
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
      } else {
        //总计查询
        //console.log('total')
        this.$axios
          .post(
            "https://www.moondeity.com:8308/api/Areas/OrderInfo/GetOrderList",
            {
              Type: "已入库订单",
              CurrentPage: 1,
              PageSize: 99,
              begintime: that.begintime,
              endtime: that.endtime,
              StockType: that.Name,
            },
            {
              headers: {
                Authorization: that.token,
              },
            }
          )
          .then(function (response) {
            //console.log('total', response)
            let temp = response.data.data.dt;
            for (let i in temp) {
              that.tableData.push({
                time: temp[i].WarehousingTime.split("T")[0],
                product: temp[i].Remarks.split(">")[1].split("第")[0],
                num: temp[i].RealQuantity,
              });
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    },
  },
};
</script>

<style>
.f {
  display: flex;
}

.el-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.el-table__body-wrapper {
  flex: 1;
}

.el-tabs__item {
  margin-top: 10px;
  width: 470px;
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

.out {
  display: flex;
  margin: 180px auto;
  width: 300px;
  height: 150px;
  border-radius: 30px;
  background: #409eff;
}

.out .btntxt {
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