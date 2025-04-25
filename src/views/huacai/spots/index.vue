<template>
  <div class="app-container">
    <!-- 顶部搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="68px">
      <el-row :gutter="24" class="mb8">
        <el-col :span="8">
          <el-form-item label="景点名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入景点名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所在城市" prop="city">
            <el-input
              v-model="queryParams.city"
              placeholder="请输入所在城市"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['huacai:spots:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['huacai:spots:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['huacai:spots:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['huacai:spots:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table @row-click="clickRow" ref="table" highlight-current-row
              :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
              height="300" class="fixedTableTwo" v-loading="loading" :data="spotsList"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index" :index="indexMethod"/>
      <el-table-column label="景点名称" align="center" prop="name"/>
      <el-table-column label="所在城市" align="center" prop="city"/>
      <el-table-column label="详细地址" align="center" prop="location"/>
      <el-table-column label="景点图片" align="center" prop="image" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="景点描述" align="center" prop="description"/>
      <el-table-column label="开放时间" align="center" prop="openingHours"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['huacai:spots:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['huacai:spots:remove']"
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

    <!-- 添加或修改景点对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body destroy-on-close>
      <el-form ref="formDialog" :model="form" :rules="rules" label-width="80px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span style="font-size: 20px; color: #1890ff">景点基本信息</span>
          </div>
          <el-row :gutter="24" class="mb8">
            <el-col :span="12">
              <el-form-item label="景点名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入景点名称"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所在城市" prop="city">
                <el-input v-model="form.city" placeholder="请输入所在城市"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24" class="mb8">
            <el-col :span="12">
              <el-form-item label="开放时间" prop="openingHours">
                <el-input v-model="form.openingHours" placeholder="请输入开放时间"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="详细地址" prop="location">
                <el-input v-model="form.location" type="textarea" placeholder="请输入内容"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24" class="mb8">
            <el-col :span="12">
              <el-form-item label="景点图片" prop="image">
                <image-upload v-model="form.image"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="景点描述" prop="description">
                <el-input :rows="9" v-model="form.description" type="textarea" placeholder="请输入内容"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span style="font-size: 20px; color: #1890ff">景点标签</span>
          </div>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddSpotsTags">添加</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteSpotsTags">删除</el-button>
            </el-col>
          </el-row>
          <el-table :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
                    :data="spotsTagsList" :row-class-name="rowSpotsTagsIndex"
                    @selection-change="handleSpotsTagsSelectionChange" ref="spotsTags">
            <el-table-column type="selection" width="50" align="center"/>
            <el-table-column label="序号" align="center" prop="index" width="50"/>
            <el-table-column label="标签名称" prop="tag">
              <template slot-scope="scope">
                <el-input v-model="scope.row.tag" placeholder="请输入标签名称"/>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listSpots, getSpots, delSpots, addSpots, updateSpots} from "@/api/huacai/spots";
import {getToken} from "@/utils/auth";

export default {
  name: "Spots",
  data() {
    return {
      selectedRow: null, // 保存当前选中的行
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedSpotsTags: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 景点表格数据
      spotsList: [],
      // 景点标签表格数据
      spotsTagsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        city: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          {required: true, message: "景点名称不能为空", trigger: "blur"}
        ],
        city: [
          {required: true, message: "所在城市不能为空", trigger: "blur"}
        ],
        location: [
          {required: true, message: "详细地址不能为空", trigger: "blur"}
        ],
        image: [
          {required: true, message: "景点图片不能为空", trigger: "blur"}
        ],
        description: [
          {required: true, message: "景点描述不能为空", trigger: "blur"}
        ],
        openingHours: [
          {required: true, message: "开放时间不能为空", trigger: "blur"}
        ]
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
    /** 查询景点列表 */
    getList() {
      this.loading = true;
      listSpots(this.queryParams).then(response => {
        this.spotsList = response.rows;
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
        spotsId: null,
        name: null,
        city: null,
        location: null,
        image: null,
        description: null,
        openingHours: null
      };
      this.spotsTagsList = [];
      
      // 确保在下一个事件循环中重置表单，避免数据绑定问题
      this.$nextTick(() => {
        if (this.$refs.formDialog) {
          this.$refs.formDialog.clearValidate();
        }
      });
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
      this.ids = selection.map(item => item.spotsId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加景点";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const spotsId = row.spotsId || this.ids
      getSpots(spotsId).then(response => {
        // 创建数据的深拷贝，避免引用问题
        this.form = JSON.parse(JSON.stringify(response.data));
        // 深拷贝标签列表
        this.spotsTagsList = response.data.spotsTagsList ? 
          JSON.parse(JSON.stringify(response.data.spotsTagsList)) : [];
        this.open = true;
        this.title = "修改景点";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (valid) {
          // 创建一个新对象用于提交，避免修改原始表单数据
          const submitData = {
            ...this.form,
            spotsTagsList: this.spotsTagsList
          };
          
          if (this.form.spotsId != null) {
            updateSpots(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSpots(submitData).then(response => {
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
      const spotsIds = row.spotsId || this.ids;
      this.$modal.confirm('确定删除选中记录？').then(function () {
        return delSpots(spotsIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 景点标签序号 */
    rowSpotsTagsIndex({row, rowIndex}) {
      row.index = rowIndex + 1;
    },
    /** 景点标签添加按钮操作 */
    handleAddSpotsTags() {
      let obj = {};
      obj.tag = "";
      this.spotsTagsList.push(obj);
    },
    /** 景点标签删除按钮操作 */
    handleDeleteSpotsTags() {
      if (this.checkedSpotsTags.length == 0) {
        this.$modal.msgError("请先选择要删除的景点标签数据");
      } else {
        const spotsTagsList = this.spotsTagsList;
        const checkedSpotsTags = this.checkedSpotsTags;
        this.spotsTagsList = spotsTagsList.filter(function (item) {
          return checkedSpotsTags.indexOf(item.index) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleSpotsTagsSelectionChange(selection) {
      this.checkedSpotsTags = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('huacai/spots/export', {
        ...this.queryParams
      }, `spots_${new Date().getTime()}.xlsx`)
    },
  }
};
</script>
