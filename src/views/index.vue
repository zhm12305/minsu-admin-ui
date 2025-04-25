<template>
  <div class="system-promotion-container">
    <!-- 系统主横幅 -->
    <div class="main-banner">
      <el-card shadow="never" class="transparent-card">
        <div class="banner-content">
          <div class="banner-text">
            <h1>悦享—民宿</h1>
            <p class="sub-title">专业 · 高效 · 智能的民宿管理解决方案</p>
            <el-divider></el-divider>
            <p class="banner-description">
              专为民宿行业打造的一站式管理平台，整合房源、订单、用户、商家等多维度管理功能，
              助力您轻松应对复杂业务场景，提升管理效率与服务品质。
            </p>
          </div>
          <div class="banner-image">
            <img src="@/assets/logo/logo.png" alt="系统概览">
          </div>
        </div>
      </el-card>
    </div>

    <!-- 核心价值展示 -->
    <div class="value-section">
      <h2 class="section-title"><i class="el-icon-star-off"></i> 我们的核心价值</h2>
      <el-row :gutter="30">
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <div class="value-card">
            <div class="value-icon" style="color: #409EFF;">
              <i class="el-icon-s-operation"></i>
            </div>
            <h3>全流程管理</h3>
            <p>覆盖从房源上架、订单处理到财务结算的完整业务流程，实现端到端管理。</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <div class="value-card">
            <div class="value-icon" style="color: #67C23A;">
              <i class="el-icon-s-opportunity"></i>
            </div>
            <h3>智能化运营</h3>
            <p>自动化工具，帮助您优化房源展示，提升订单转化率。</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <div class="value-card">
            <div class="value-icon" style="color: #E6A23C;">
              <i class="el-icon-s-check"></i>
            </div>
            <h3>多角色协同</h3>
            <p>完善的角色权限体系，支持管理员、商家、用户等多角色高效协作。</p>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 系统优势总结 -->
    <div class="advantage-section">
      <h2 class="section-title"><i class="el-icon-medal"></i> 系统优势</h2>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="el-icon-lock" style="color: #F56C6C;"></i>
            </div>
            <h4>安全可靠</h4>
            <p>多重数据加密与备份机制</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="el-icon-cpu" style="color: #409EFF;"></i>
            </div>
            <h4>高性能</h4>
            <p>支持高并发访问</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="el-icon-mobile-phone" style="color: #67C23A;"></i>
            </div>
            <h4>响应式设计</h4>
            <p>多终端完美适配</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="el-icon-refresh" style="color: #E6A23C;"></i>
            </div>
            <h4>持续更新</h4>
            <p>定期功能升级与优化</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemPromotion',
}
</script>

<style lang="scss" scoped>
.system-promotion-container {
  padding: 20px;
  background-color: #f5f7fa;

  .transparent-card {
    background-color: transparent;
    border: none;
  }

  .main-banner {
    margin-bottom: 40px;

    .banner-content {
      display: flex;
      align-items: center;
      padding: 30px;

      .banner-text {
        flex: 1;
        padding-right: 40px;

        h1 {
          font-size: 36px;
          color: #303133;
          margin-bottom: 15px;
        }

        .sub-title {
          font-size: 18px;
          color: #606266;
          margin-bottom: 20px;
        }

        .banner-description {
          font-size: 16px;
          line-height: 1.8;
          color: #606266;
        }
      }

      .banner-image {
        flex: 1;
        text-align: center;

        img {
          max-width: 100%;
          border-radius: 4px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .section-title {
    text-align: center;
    margin: 40px 0 30px;
    font-size: 28px;
    color: #303133;

    i {
      margin-right: 10px;
    }
  }

  .value-section {
    margin-bottom: 50px;

    .value-card {
      background: white;
      padding: 30px 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      height: 100%;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .value-icon {
        font-size: 48px;
        margin-bottom: 20px;
      }

      h3 {
        font-size: 20px;
        margin-bottom: 15px;
        color: #303133;
      }

      p {
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  .feature-showcase {
    margin-bottom: 50px;

    .feature-item {
      display: flex;
      align-items: center;
      padding: 20px 0;

      &.left-align {
        flex-direction: row;
      }

      &.right-align {
        flex-direction: row-reverse;
      }

      .feature-image {
        flex: 1;
        padding: 0 30px;

        img {
          width: 100%;
          border-radius: 4px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
      }

      .feature-text {
        flex: 1;

        h3 {
          font-size: 24px;
          color: #303133;
          margin-bottom: 20px;
        }

        p {
          font-size: 16px;
          line-height: 1.8;
          color: #606266;
        }
      }
    }
  }

  .advantage-section {
    .advantage-card {
      background: white;
      padding: 25px 15px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      height: 100%;

      .advantage-icon {
        font-size: 36px;
        margin-bottom: 15px;
      }

      h4 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #303133;
      }

      p {
        color: #909399;
        font-size: 14px;
      }
    }
  }

}
</style>
