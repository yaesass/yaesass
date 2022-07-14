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
      token:
        "Bearer admin-accessToken-eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IkVBNDY5MDAwLUEwRTMtNDM2NS04OEU1LTYzNTk4MUQxNzM2NSIsIm5hbWUiOiLmiavnoIEifQ.ysDSnXIKlGLatjoH2wUIq0r65R8tv9DP_CH0vsOTbN0",
      //token: '',
      Name: "in4",
      //Name: 'out1',
      //Name: '',
      Type: "in",
      //Type: 'out',
      //Type:'',
      Remarks: "in4货口",
      // Remarks: 'out1货口',
      //Remarks: '',
      activeName: "second", //选项卡
      isDestroyed: false, // 页面是否销毁
      lockReconnect: false, // 是否真正建立连接
      outkey: false, //是否为出货口
      tab: false, //tabs栏是否锁定
      list: [], //接收产品列表
      str: [], //上传产品列表
      innum: false, //当前入库产品数量
      orderlist: [], //订单列表
      tableData: [], //历史列表
      countkey: true, //实时计数第一页
      value1: "", //选择日期
      begintime: "", //开始日期
      endtime: "", //结束日期
      outorderkey: true, //出库历史统计第一页
      outcountkey: true, //出库计数页第一页
      needMergeArr: ["time"], //合并列
      rowMergeArrs: {},
      //分页
      tempList: [], //表格显示数据
      currentPage: 1, //当前页
      pageSize: 10, //每页行数
      total: 0, //列表总行数
      errMessage: "",
    };
  },
  created() {
    // this.GetScanningOrder();
    console.log('this.$route.params',this.$route.params)
  },
  mounted() {},

  destroyed() {
    // 在页面销毁
  },
  methods: {
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
          console.log("	that.$router", that.$router);
          that.$router.push({ name: "in", params: { id: "123456" } });

          if (reqdata.dt != "") {
            //有正在入库的订单

            that.start();
            that.OrderId = reqdata.dt[0].Id;
            that.StockState = reqdata.dt[0].StockState;
            that.activeName = "second";
            that.countkey = false;
            let name = reqdata.dt[0].Remarks.split(">")[1].split("第")[0]; //截取remarks获得产品名
            if (reqdata.dt[0].RealQuantity > 0) {
              //显示已扫描数据
              let num = reqdata.dt[0].RealQuantity;
              that.innum = true;
              //console.log('innum', that.innum)
              that.list.push({
                id: reqdata.dt[0].ProductId,
                name: name,
                num: num,
              });
              //console.log('GetScanningOrder--list', that.list)
            }
          } else {
            that.innum = false;
            that.countkey = true;
            that.value = "order";
            that.getlist(); //没有正在入库的订单
            try {
              //console.log('window.ws', window.ws)
              window.ws.close();
            } catch (e) {
              //console.log('err', e)
            }
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