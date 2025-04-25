<template>
  <div class="app-container">
    <!-- 顶部搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="68px">
      <el-row :gutter="24" class="mb8">
        <el-col :span="8">
          <el-form-item label="民宿ID" prop="homestayId">
            <el-input
              v-model="queryParams.homestayId"
              placeholder="请输入民宿ID"
              clearable
              @keyup.enter.native="handleQuery"
            />
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
<!--          v-hasPermi="['huacai:evaluate:add']"-->
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
<!--          v-hasPermi="['huacai:evaluate:edit']"-->
<!--        >修改-->
<!--        </el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleBatchDelete"
          v-hasPermi="['huacai:evaluate:remove']"
        >批量删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['huacai:evaluate:export']"
        >导出
        </el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          icon="el-icon-upload2"-->
<!--          size="mini"-->
<!--          @click="handleImport"-->
<!--          v-hasPermi="['huacai:evaluate:import']"-->
<!--        >导入-->
<!--        </el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table @row-click="clickRow" ref="table" highlight-current-row
              :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
              height="300" class="fixedTableTwo" v-loading="loading" :data="evaluateList"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index" :index="indexMethod"/>
      <el-table-column label="民宿评价ID" align="center" prop="evaluateId"/>
      <el-table-column label="民宿ID" align="center" prop="homestayId"/>
      <el-table-column label="评分" align="center" prop="rating"/>
      <el-table-column label="评价" align="center" prop="content"/>
      <el-table-column label="用户ID" align="center" prop="userId"/>
      <el-table-column label="评价时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="hasPermission(scope.row)"
            v-hasPermi="['huacai:evaluate:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="hasPermission(scope.row)"
            v-hasPermi="['huacai:evaluate:remove']"
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

    <!-- 导入对话框 -->
    <vxe-modal :title="upload.title" v-model="upload.open" width="400px" showFooter show-zoom resize>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTemplate">下载模板
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </vxe-modal>

    <!-- 添加或修改民宿评价对话框 -->
    <vxe-modal :title="title" v-model="open" width="500px" showFooter show-zoom resize>
      <el-form ref="formDialog" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="民宿ID" prop="homestayId">
          <el-input v-model="form.homestayId" placeholder="请输入民宿ID"/>
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input v-model="form.rating" placeholder="请输入评分"/>
        </el-form-item>
        <el-form-item label="评价" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID"/>
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
import {listEvaluate, getEvaluate, delEvaluate, addEvaluate, updateEvaluate} from "@/api/huacai/evaluate";
import {getToken} from "@/utils/auth";
import { getInfo } from "@/api/login";

export default {
  name: "Evaluate",
  data() {
    return {
      currentUserId: undefined, // 当前用户ID
      isAdmin: false, // 是否为管理员
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
      // 民宿评价表格数据
      evaluateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        homestayId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        homestayId: [
          {required: true, message: "民宿ID不能为空", trigger: "blur"}
        ],
        rating: [
          {required: true, message: "评分不能为空", trigger: "blur"}
        ],
        content: [
          {required: true, message: "评价不能为空", trigger: "blur"}
        ],
        userId: [
          {required: true, message: "用户ID不能为空", trigger: "blur"}
        ],
      },
      // 批量操作权限
      checkPermission: false,
      // 导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/huacai/evaluate/importData"
      }
    };
  },
  created() {
    this.getList();
    this.getCurrentUserInfo();
  },
  methods: {
    /** 获取当前用户信息 */
    getCurrentUserInfo() {
      getInfo().then(res => {
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
    /** 检查用户是否有权限操作该评价 */
    hasPermission(row) {
      // 管理员可以操作所有评价
      if (this.isAdmin) {
        return true;
      }
      
      // 普通用户只能操作自己的评价
      return parseInt(this.currentUserId) === parseInt(row.userId);
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
    /** 查询民宿评价列表 */
    getList() {
      this.loading = true;
      listEvaluate(this.queryParams).then(response => {
        this.evaluateList = response.rows;
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
        evaluateId: null,
        homestayId: null,
        rating: null,
        content: null,
        userId: null,
        createTime: null
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
    /** 选择条数改变 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.evaluateId);
      this.single = selection.length!==1;
      this.multiple = !selection.length;
      // 检查所选记录是否都有权限操作
      this.checkPermission = selection.length > 0 && selection.every(item => this.hasPermission(item));
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加民宿评价";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      if (!this.hasPermission(row)) {
        this.$modal.msgError("操作失败，您无权修改他人发布的评价");
        return;
      }
      this.reset();
      const evaluateId = row.evaluateId || this.ids
      getEvaluate(evaluateId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改民宿评价";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (valid) {
          if (this.form.evaluateId != null) {
            updateEvaluate(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.msg || "修改失败");
              }
            }).catch(err => {
              this.$modal.msgError(err.message || "修改失败");
            });
          } else {
            addEvaluate(this.form).then(response => {
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
      if (!this.hasPermission(row)) {
        this.$modal.msgError("操作失败，您无权删除他人发布的评价");
        return;
      }
      const evaluateIds = row.evaluateId || this.ids;
      this.$modal.confirm('是否确认删除民宿评价编号为"' + evaluateIds + '"的数据项？').then(function () {
        return delEvaluate(evaluateIds);
      }).then((res) => {
        if (res.code === 200) {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError(res.msg || "删除失败");
        }
      }).catch((err) => {
        if (err && err.message) {
          this.$modal.msgError(err.message);
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('huacai/evaluate/export', {
        ...this.queryParams
      }, `evaluate_${new Date().getTime()}.xlsx`)
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('huacai/evaluate/importTemplate', {}, `template_${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "民宿评价导入";
      this.upload.open = true;
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    /** 批量删除操作 */
    handleBatchDelete() {
      if (this.ids.length === 0) {
        this.$modal.msgError("请至少选择一条评价记录");
        return;
      }
      
      // 确保权限检查正确执行
      const hasPermission = this.ids.length > 0 && 
        this.ids.every(id => {
          const row = this.evaluateList.find(item => item.evaluateId === id);
          return row && this.hasPermission(row);
        });
      
      if (!hasPermission) {
        this.$modal.msgError("操作失败，您无权删除他人发布的评价");
        return;
      }
      
      this.$modal.confirm('是否确认删除选中的' + this.ids.length + '条评价记录?').then(() => {
        return delEvaluate(this.ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch((error) => {
        if (error && error !== 'cancel') {
          this.$modal.msgError("删除失败");
        }
      });
    },
  }
};
</script>
