<template>
  <div class="app-container">
    <!-- 顶部搜索 -->
    <el-form :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="68px">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-form-item label="民宿名称" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入民宿名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="所在城市" prop="city">
            <el-input
              v-model="queryParams.city"
              placeholder="请输入所在城市"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="附近景点" prop="near">
            <el-input
              v-model="queryParams.near"
              placeholder="请输入附近景点"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
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
          v-hasPermi="['huacai:homestay:add']"
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
          v-hasPermi="['huacai:homestay:edit']"
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
          v-hasPermi="['huacai:homestay:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['huacai:homestay:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table @row-click="clickRow" ref="table" highlight-current-row
              :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
              height="300" class="fixedTableTwo" v-loading="loading" :data="homestayList"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index" :index="indexMethod"/>
      <el-table-column label="民宿名称" align="center" prop="title"/>
      <el-table-column label="每晚单价" align="center" prop="price"/>
      <el-table-column label="所在城市" align="center" prop="city"/>
      <el-table-column label="附近景点" align="center" prop="spotsName"/>
      <el-table-column label="详细地址" align="center" prop="location"/>
      <el-table-column label="民宿照片" align="center" prop="image" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="设施服务" align="center" prop="facilities">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.facilities"
                    :value="scope.row.facilities ? scope.row.facilities.split(',') : []"/>
        </template>
      </el-table-column>
      <el-table-column label="民宿介绍" align="center" prop="description"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['huacai:homestay:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['huacai:homestay:remove']"
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

    <!-- 添加或修改民宿对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body destroy-on-close>
      <el-form ref="formDialog" :model="form" :rules="rules" label-width="80px">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span style="font-size: 20px; color: #1890ff">民宿信息</span>
          </div>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="民宿名称" prop="title">
                <el-input v-model="form.title" placeholder="请输入民宿名称"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="每晚单价" prop="price">
                <el-input-number style="width: 100%;" v-model="form.price" placeholder="请输入每晚单价"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="所在城市" prop="city">
                <el-input v-model="form.city" placeholder="请输入所在城市"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="附近景点" prop="near">
                <el-select filterable v-model="form.near" placeholder="请选择附近景点" style="width: 100%">
                  <el-option
                    v-for="item in spotsList"
                    :key="item.spotsId"
                    :label="item.name"
                    :value="item.spotsId">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="详细地址" prop="location">
            <el-input v-model="form.location" placeholder="请输入详细地址"/>
          </el-form-item>
          <el-form-item label="民宿介绍" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容"/>
          </el-form-item>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="民宿照片" prop="image">
                <image-upload v-model="form.image"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设施服务" prop="facilities">
                <el-checkbox-group v-model="form.facilities">
                  <el-checkbox
                    v-for="dict in dict.type.facilities"
                    :key="dict.value"
                    :label="dict.value">
                    {{ dict.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="text-align: center;">
            <span style="font-size: 20px; color: #1890ff">民宿标签</span>
          </div>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddHomestayTags">添加</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteHomestayTags">删除
              </el-button>
            </el-col>
          </el-row>
          <el-table :header-cell-style="{background:'#d0cece',color:'#000000',fontWeight:'bold'}"
                    :data="homestayTagsList" :row-class-name="rowHomestayTagsIndex" height="15vh"
                    @selection-change="handleHomestayTagsSelectionChange" ref="homestayTags">
            <el-table-column type="selection" width="50" align="center"/>
            <el-table-column label="序号" align="center" prop="index" width="50"/>
            <el-table-column label="民宿标签" prop="tag">
              <template slot-scope="scope">
                <el-input v-model="scope.row.tag" placeholder="请输入民宿标签"/>
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
import {listHomestay, getHomestay, delHomestay, addHomestay, updateHomestay} from "@/api/huacai/homestay";
import {getToken} from "@/utils/auth";
import {selectSpotsByList} from "@/api/huacai/spots";

export default {
  name: "Homestay",
  dicts: ['facilities'],
  data() {
    return {
      spotsList: [], //景点列表
      selectedRow: null, // 保存当前选中的行
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedHomestayTags: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 民宿表格数据
      homestayList: [],
      // 民宿标签表格数据
      homestayTagsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        city: null,
        near: null,
        userId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          {required: true, message: "民宿名称不能为空", trigger: "blur"}
        ],
        price: [
          {required: true, message: "每晚单价不能为空", trigger: "blur"}
        ],
        city: [
          {required: true, message: "所在城市不能为空", trigger: "blur"}
        ],
        near: [
          {required: true, message: "附近景点不能为空", trigger: "blur"}
        ],
        location: [
          {required: true, message: "详细地址不能为空", trigger: "blur"}
        ],
        image: [
          {required: true, message: "民宿照片不能为空", trigger: "blur"}
        ],
        facilities: [
          {required: true, message: "设施服务不能为空", trigger: "blur"}
        ],
        description: [
          {required: true, message: "民宿介绍不能为空", trigger: "blur"}
        ],
        userId: [
          {required: true, message: "用户ID不能为空", trigger: "blur"}
        ]
      },
    };
  },
  created() {
    this.getList();
    this.getSpotsList();
  },
  methods: {
    //不分页查询景点列表
    getSpotsList() {
      selectSpotsByList().then(res => {
        this.spotsList = res.data
      })
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
    /** 查询民宿列表 */
    getList() {
      this.loading = true;
      listHomestay(this.queryParams).then(response => {
        this.homestayList = response.rows;
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
        homestayId: null,
        title: null,
        price: null,
        city: null,
        near: null,
        location: null,
        image: null,
        facilities: [],
        description: null,
        userId: null
      };
      this.homestayTagsList = [];
      
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
      this.ids = selection.map(item => item.homestayId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加民宿";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const homestayId = row.homestayId || this.ids
      getHomestay(homestayId).then(response => {
        // 创建数据的深拷贝，避免引用问题
        this.form = JSON.parse(JSON.stringify(response.data));
        // 如果facilities是字符串，转换为数组
        if (typeof this.form.facilities === 'string') {
          this.form.facilities = this.form.facilities.split(",");
        }
        // 深拷贝标签列表
        this.homestayTagsList = response.data.homestayTagsList ? 
          JSON.parse(JSON.stringify(response.data.homestayTagsList)) : [];
        this.open = true;
        this.title = "修改民宿";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (valid) {
          // 创建一个新对象用于提交，避免修改原始表单数据
          const submitData = {
            ...this.form,
            facilities: Array.isArray(this.form.facilities) ? this.form.facilities.join(",") : this.form.facilities,
            homestayTagsList: this.homestayTagsList
          };
          
          if (this.form.homestayId != null) {
            updateHomestay(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addHomestay(submitData).then(response => {
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
      const homestayIds = row.homestayId || this.ids;
      this.$modal.confirm('确定删除选中记录？').then(function () {
        return delHomestay(homestayIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 民宿标签序号 */
    rowHomestayTagsIndex({row, rowIndex}) {
      row.index = rowIndex + 1;
    },
    /** 民宿标签添加按钮操作 */
    handleAddHomestayTags() {
      let obj = {};
      obj.tag = "";
      this.homestayTagsList.push(obj);
    },
    /** 民宿标签删除按钮操作 */
    handleDeleteHomestayTags() {
      if (this.checkedHomestayTags.length == 0) {
        this.$modal.msgError("请先选择要删除的民宿标签数据");
      } else {
        const homestayTagsList = this.homestayTagsList;
        const checkedHomestayTags = this.checkedHomestayTags;
        this.homestayTagsList = homestayTagsList.filter(function (item) {
          return checkedHomestayTags.indexOf(item.index) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleHomestayTagsSelectionChange(selection) {
      this.checkedHomestayTags = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('huacai/homestay/export', {
        ...this.queryParams
      }, `homestay_${new Date().getTime()}.xlsx`)
    },
  }
};
</script>
