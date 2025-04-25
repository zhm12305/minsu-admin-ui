<template>
  <div style="max-width: 900px; margin: 20px auto; padding: 0 15px">
    <!-- 认证状态提示 -->
    <el-card style="margin-bottom: 20px">
      <div class="title">当前认证状态</div>

      <div style="padding: 10px 0">
        <el-alert
          :title="statusTitle"
          :type="statusType"
          :description="statusDescription"
          show-icon
          :closable="false"
        ></el-alert>
      </div>
    </el-card>

    <el-card style="margin-bottom: 20px" v-if="state == '未提交认证' || state == '已拒绝'">
      <div class="title">商家认证申请</div>

      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="法人姓名" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="请输入法人姓名"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="营业执照" prop="businessLicense">
              <image-upload v-model="form.businessLicense"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人身份证" prop="legalPersonCard">
              <image-upload v-model="form.legalPersonCard"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="text-align: center">
        <el-button type="primary" @click="submitForm">提 交</el-button>
        <el-button @click="resetFrom">重 置</el-button>
      </div>
    </el-card>


  </div>
</template>

<script>
import {addMerchant, selectMerchantByUserId, selectMerchantWhereUserId} from "@/api/huacai/merchant";

export default {
  name: "merchantAuth",
  data() {
    return {
      state: '',
      form: {
        merchantId: null,
        legalPerson: null,
        phone: null,
        businessLicense: null,
        legalPersonCard: null,
        state: null,
        userId: null
      },
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
    }
  },
  computed: {
    statusTitle() {
      switch (this.state) {
        case '待审核':
          return '认证审核中';
        case '已通过':
          return '认证已通过';
        case '已拒绝':
          return '认证未通过';
        default:
          return '未提交认证'
      }
    },
    statusType() {
      switch (this.state) {
        case '待审核':
          return 'info';
        case '已通过':
          return 'success';
        case '已拒绝':
          return 'error';
        default:
          return 'warning'
      }
    },
    statusDescription() {
      switch (this.state) {
        case '待审核':
          return '您的商家认证已提交, 正在审核中, 请耐心等待';
        case '已通过':
          return '恭喜! 您的商家认证已通过审核, 现在可以开始使用商家功能';
        case '已拒绝':
          return '您的商家申请未通过审核, 请重新提交申请';
        default:
          return '您未提交商家认证申请, 请填写下方表单提交认证'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      selectMerchantWhereUserId().then(res => {
        if (res.data == false) {
          //未提交认证
          this.state = '未提交认证'
        } else {
          selectMerchantByUserId().then(res => {
            this.state = res.data.state
            console.log(this.state)
          })
        }
      })
    },
    //提交表单
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          addMerchant(this.form).then(res => {
            this.$modal.msgSuccess("提交成果, 请等待审核");
            this.getList()
          })
        }
      })
    },
    //重置表单
    resetFrom() {
      this.$refs.form.resetFields();
    }
  }
}
</script>

<style scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}
</style>
