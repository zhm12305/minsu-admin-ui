<template>
  <div class="navbar">
<!--    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />-->

<!--    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav"/>-->
<!--    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav"/>-->

    <div class="topmenu-container">
    <sidebar-logo v-if="showLogo" :collapse="isCollapse"></sidebar-logo>
    </div>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <span class="right-menu-items">您好, {{nickName}} {{deptLable}}</span> <!-- 您好, 用户昵称, 部门名称(包含上级部门名称) -->
        <el-button type="text" class="right-menu-item"><svg-icon icon-class="待办" style="font-size: 15px; color: #fff;" class-name='custom-class' /><el-link type="text" class="nav-link"><router-link to="/task/stay">待办任务</router-link></el-link></el-button>
        <el-button type="text" class="right-menu-item"><svg-icon icon-class="个人中心" style="font-size: 15px; color: #fff;" class-name='custom-class' /><el-link type="text" class="nav-link"><router-link to="/user/profile">个人中心</router-link></el-link></el-button>
        <el-button type="text" @click.native="logout" class="right-menu-item"><svg-icon icon-class="注销" style="font-size: 15px; color: #fff;" class-name='custom-class' /><el-link type="text" class="nav-link">注销</el-link></el-button>
        <el-tooltip content="全局搜索" effect="dark" placement="bottom">
        <search id="header-search" class="right-menu-item" />
        </el-tooltip>
        <el-tooltip content="全屏" effect="dark" placement="bottom">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>
<!--        <el-tooltip content="布局大小" effect="dark" placement="bottom">-->
<!--          <size-select id="size-select" class="right-menu-item hover-effect" />-->
<!--        </el-tooltip>-->

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
<!--          <el-dropdown-item divided @click.native="logout">-->
<!--            <span>退出登录</span>-->
<!--          </el-dropdown-item>-->
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import SidebarLogo from "@/layout/components/Sidebar/Logo";
import {getUser} from "@/api/system/user";
import * as huacai from "@/utils/huacai";
import {getDept} from "@/api/system/dept";

export default {
  components: {
    SidebarLogo,
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc
  },
  computed: {
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  created() {
    this.getUserNickName()
  },
  data() {
    return {
      nickName: null,
      deptLable: null,// 当前登录用户的部门详细名称(包含上级名称)
    }
  },
  methods: {
    getUserNickName() {
      getUser(this.$store.state.user.id).then(res => {
        this.nickName = res.data.nickName
        this.getFullDeptLabel(res.data.dept.deptId).then(fullLabel => {
          this.deptLable = fullLabel; // 获取当前登录用户的部门详细名称(包含上级名称)
        });
      })
    },
    getFullDeptLabel(deptId) {
      // 调用 getDept 方法获取部门信息
      return getDept(deptId).then(res => {
        // 如果有上级部门（parentId 存在）
        if (res.data.parentId) {
          // 递归调用 getFullDeptLabel 获取上级部门的完整标签
          return this.getFullDeptLabel(res.data.parentId).then(parentLabel => {
            // 返回上级部门标签和当前部门标签的组合
            return parentLabel + '/' + res.data.deptName;
          });
        } else {
          // 如果没有上级部门，直接返回当前部门的标签
          return res.data.deptName;
        }
      });
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      }).catch(() => {});
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #0c4b7c, #1b6ca8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 10px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    padding-right: 15px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 10px;
      height: 100%;
      font-size: 18px;
      color: #ffffff;
      vertical-align: text-bottom;
      transition: all 0.3s;
      
      .el-link {
        color: #ffffff !important;
        font-size: 14px;
        margin-left: 4px;
      }
      
      .nav-link {
        color: #ffffff !important;
        
        a {
          color: #ffffff !important;
          text-decoration: none;
        }
      }

      &.hover-effect {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
      }
    }

    .right-menu-items {
      display: inline-block;
      padding: 0 15px;
      height: 100%;
      font-size: 15px;
      color: #ffffff;
      vertical-align: text-bottom;
      font-weight: 500;
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s;
          
          &:hover {
            transform: scale(1.05);
            border: 2px solid rgba(255, 255, 255, 0.9);
          }
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
