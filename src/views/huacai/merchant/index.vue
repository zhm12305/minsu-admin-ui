<template>
  <div class="app-container">
    <!-- 顶部搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="68px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item label="法人姓名" prop="legalPerson">
            <el-input
              v-model="queryParams.legalPerson"
              placeholder="请输入法人姓名"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="认证状态" prop="state">
            <el-select v-model="queryParams.state" placeholder="请选择认证状态" clearable>
              <el-option
                v-for="dict in dict.type.merchant_sta"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 顶部按钮 -->
    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          icon="el-icon-plus"-->
<!--          size="mini"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['huacai:merchant:add']"-->
<!--        >新增-->
<!--        </el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['huacai:merchant:edit']"-->
<!--        >修改-->
<!--        </el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['huacai:merchant:remove']"-->
<!--        >删除-->
<!--        </el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['huacai:merchant:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table @row-click="clickRow" ref="table" highlight-current-row
              :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
              height="300" class="fixedTableTwo" v-loading="loading" :data="merchantList"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index" :index="indexMethod"/>
      <el-table-column label="法人姓名" align="center" prop="legalPerson"/>
      <el-table-column label="联系电话" align="center" prop="phone"/>
      <el-table-column label="营业执照" align="center" prop="businessLicense" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.businessLicense" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="法人身份证" align="center" prop="legalPersonCard" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.legalPersonCard" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="认证状态" align="center" prop="state">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.merchant_sta" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleApproved(scope.row)"
            v-if="scope.row.state === '待审核' && isAdmin"
          >审核通过
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleReview(scope.row)"
            v-if="scope.row.state === '待审核' && isAdmin"
          >审核不通过
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="isAdmin"
            v-hasPermi="['huacai:merchant:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="isAdmin"
            v-hasPermi="['huacai:merchant:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改商家对话框 -->
    <vxe-modal :title="title" v-model="open" width="500px" showFooter show-zoom resize>
      <el-form ref="formDialog" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="法人姓名" prop="legalPerson">
          <el-input v-model="form.legalPerson" placeholder="请输入法人姓名"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="营业执照" prop="businessLicense">
          <image-upload v-model="form.businessLicense"/>
        </el-form-item>
        <el-form-item label="法人身份证" prop="legalPersonCard">
          <image-upload v-model="form.legalPersonCard"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer  dialog-footer-center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </vxe-modal>
  </div>
</template>

<script>
import {listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant, approved} from "@/api/huacai/merchant";
import {getToken} from "@/utils/auth";
import { getInfo } from "@/api/login";

export default {
  name: "Merchant",
  dicts: ['merchant_sta'],
  data() {
    return {
      isAdmin: false, // 是否为管理员
      currentUserId: null, // 当前用户ID
      selectedRow: null, // 保存当前选中的行
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 商家表格数据
      merchantList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        legalPerson: null,
        legalPersonCard: null,
        state: null,
        userId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        legalPerson: [
          {required: true, message: "法人姓名不能为空", trigger: "blur"}
        ],
        state: [
          {required: true, message: "认证状态不能为空", trigger: "change"}
        ],
        userId: [
          {required: true, message: "用户ID不能为空", trigger: "blur"}
        ],
        phone: [
          {required: true, message: "联系电话不能为空", trigger: "blur"}
        ],
        businessLicense: [
          {required: true, message: "营业执照未上传", trigger: "blur"}
        ],
        legalPersonCard: [
          {required: true, message: "法人身份证未上传", trigger: "blur"}
        ],
      },
    };
  },
  created() {
    this.getCurrentUserInfo().then(() => {
      this.getList();
    });
  },
  methods: {
    /** 获取当前用户信息 */
    getCurrentUserInfo() {
      return getInfo().then(res => {
        console.log("获取到的用户信息:", res);
        this.currentUserId = res.user.userId;
        
        // 判断是否是管理员
        if (res.roles && res.roles.length > 0) {
          for (let role of res.roles) {
            console.log("检查角色:", role);
            if (role.roleId === 1 || role.roleKey === 'admin') {
              this.isAdmin = true;
              break;
            }
          }
        }
        
        // 超级管理员检查
        if (res.user && res.user.userId === 1) {
          this.isAdmin = true;
        }
        
        console.log("当前用户是否为管理员:", this.isAdmin);
      });
    },
    //审核不通过
    handleReview(row) {
      if (!this.isAdmin) {
        this.$modal.msgError("操作失败，只有管理员可以审核商家");
        return;
      }
      let from = {
        merchantId: row.merchantId,
        state: '已拒绝'
      }
      updateMerchant(from).then(response => {
        this.$modal.msgSuccess("已拒绝通过");
        this.getList();
      }).catch(err => {
        this.$modal.msgError(err.message || "操作失败");
      });
    },
    // 审核通过
    handleApproved(row) {
      if (!this.isAdmin) {
        this.$modal.msgError("操作失败，只有管理员可以审核商家");
        return;
      }
      approved(row.merchantId).then(res => {
        this.$modal.msgSuccess("审核通过成功");
        this.getList();
      }).catch(err => {
        this.$modal.msgError(err.message || "操作失败");
      });
    },
    //点击行 获取行
    clickRow(row) {
      this.selectedRow = row; // 更新选中的行
      const table = this.$refs.table;
      const selectedRows = table.selection;

      // 否则取消之前选中的行，并选中当前点击的行
      selectedRows.forEach(selectedRow => {
        table.toggleRowSelection(selectedRow);
      });
      table.toggleRowSelection(row);
    },
    /** 自定义序号 */
    indexMethod(index) {
      let pageNum = this.queryParams.pageNum - 1;
      if ((pageNum !== -1 && pageNum !== 0)) {
        return (index + 1) + (pageNum * this.queryParams.pageSize);
      } else {
        return (index + 1)
      }
    },
    /** 查询商家列表 */
    getList() {
      this.loading = true;
      listMerchant(this.queryParams).then(response => {
        this.merchantList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        merchantId: null,
        legalPerson: null,
        phone: null,
        businessLicense: null,
        legalPersonCard: null,
        state: null,
        userId: null
      };
      this.resetForm("formDialog");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.merchantId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加商家";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (!this.isAdmin) {
        this.$modal.msgError("操作失败，只有管理员可以修改商家信息");
        return;
      }
      this.reset();
      const merchantId = row.merchantId || this.ids
      getMerchant(merchantId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改商家";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (valid) {
          if (this.form.merchantId != null) {
            updateMerchant(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMerchant(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      if (!this.isAdmin) {
        this.$modal.msgError("操作失败，只有管理员可以删除商家");
        return;
      }
      const merchantIds = row.merchantId || this.ids;
      this.$modal.confirm('确定删除选中记录？').then(function () {
        return delMerchant(merchantIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch((err) => {
        if (err && err.message) {
          this.$modal.msgError(err.message);
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('huacai/merchant/export', {
        ...this.queryParams
      }, `merchant_${new Date().getTime()}.xlsx`)
    },
  }
};
</script>
