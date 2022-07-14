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
      title: "",
      switchmodel: { id: 0, state: 0 },
      list: [],
      listLoading: true,
      Code: "",
      Second: 0,
    };
  },
  created() {
    console.log("123123123");
  },
  mounted() {},

  destroyed() {
    // 在页面销毁
  },
  methods: {},
};
</script>
