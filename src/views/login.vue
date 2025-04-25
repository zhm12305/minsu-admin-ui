<template>
  <div class="login">
    <!-- 背景视频或图片 -->
    <div class="bg-container">
      <video autoplay muted loop id="bg-video">
        <source src="../assets/media/index-back.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="overlay"></div>
    </div>

    <!-- 登录表单 -->
    <div class="form-container">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <div class="form-header">
          <h3 class="title">悦享—民宿</h3>
          <p class="subtitle">管理后台</p>
        </div>

        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            auto-complete="off"
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
          >
            <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            auto-complete="off"
            placeholder="请输入密码"
            @keyup.enter.native="handleLogin"
            prefix-icon="el-icon-lock"
          >
            <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>

        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input
            v-model="loginForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img"/>
          </div>
        </el-form-item>

        <div class="remember-container">
          <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
        </div>

        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click.native.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>

        <div class="options-container" v-if="register">
          <router-link class="register-link" :to="'/register'">立即注册账号</router-link>
        </div>
      </el-form>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2024-20xx 悦享—民宿. 后台管理系统</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaEnabled: false,
      // 注册开关
      register: true,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCode();
    this.getCookie();
    // 禁止代码调试
    // (() => {
    //   function block() {
    //     if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
    //       document.body.innerHTML = "检测到非法调试,请关闭后刷新重试!";
    //     }
    //     setInterval(() => {
    //       (function () {
    //         return false;
    //       }
    //         ['constructor']('debugger')
    //         ['call']());
    //     }, 50);
    //   }
    //
    //   try {
    //     block();
    //   } catch (err) {
    //   }
    // })();
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove('rememberMe');
          }
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          }).catch(() => {
            this.loading = false;
            if (this.captchaEnabled) {
              this.getCode();
            }
          });
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
/* 全局样式 */
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景视频容器 */
.bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

/* 背景视频 */
#bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translateX(-50%) translateY(-50%);
  object-fit: cover;
  /* 添加额外的缩放控制 */
  max-width: 100%;
  max-height: 100%;
  /* 确保视频固定在中心点 */
  object-position: center;
}

/* 背景叠加层 - 使用深色背景带青色色调，区别于用户端 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(12, 40, 80, 0.7), rgba(32, 55, 95, 0.7));
  z-index: -1;
}

/* 表单容器 */
.form-container {
  width: 420px;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.8s ease-out;
}

/* 登录表单 */
.login-form {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  padding: 35px 40px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border-top: 5px solid #0c4b7c;

  &:hover {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
    transform: translateY(-5px);
  }
}

/* 表单头部 */
.form-header {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeIn 1s ease-out;
}

/* 标题 */
.title {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
  color: #0c4b7c;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* 副标题 */
.subtitle {
  margin: 0;
  font-size: 16px;
  color: #5d7b9d;
  font-weight: 500;
  letter-spacing: 1px;
}

/* 输入框样式 */
.el-input {
  margin-bottom: 5px;

  .el-input__inner {
    height: 46px;
    line-height: 46px;
    border-radius: 8px;
    border: 1px solid #d8dce5;
    background-color: rgba(248, 250, 252, 0.8);
    font-size: 15px;
    transition: all 0.3s;

    &:focus {
      border-color: #0c4b7c;
      background-color: #fff;
      box-shadow: 0 0 0 2px rgba(12, 75, 124, 0.2);
    }
  }

  .input-icon {
    height: 46px;
    width: 18px;
    margin-left: 6px;
    color: #5d7b9d;
  }
}

/* 记住密码容器 */
.remember-container {
  margin: 10px 0 25px;

  .el-checkbox {
    color: #5d7b9d;
    font-size: 14px;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #0c4b7c;
    border-color: #0c4b7c;
  }

  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #0c4b7c;
  }
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0c4b7c, #1b6ca8);
  border: none;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(12, 75, 124, 0.4);
  transition: all 0.3s;

  &:hover, &:focus {
    background: linear-gradient(135deg, #0a4069, #175d91);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(12, 75, 124, 0.5);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(12, 75, 124, 0.4);
  }
}

/* 验证码样式 */
.login-code {
  width: 34%;
  height: 46px;
  float: right;

  .login-code-img {
    height: 100%;
    border-radius: 8px;
    cursor: pointer;
    display: block;
    width: 100%;
    object-fit: cover;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

/* 注册链接容器 */
.options-container {
  margin-top: 20px;
  text-align: center;

  .register-link {
    color: #0c4b7c;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.2s;
    position: relative;
    padding-bottom: 2px;

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 1px;
      bottom: 0;
      left: 0;
      background: #0c4b7c;
      transition: width 0.3s ease;
    }

    &:hover {
      color: #1b6ca8;

      &::after {
        width: 100%;
      }
    }
  }
}

/* 页脚 */
.el-login-footer {
  height: 60px;
  line-height: 60px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-size: 14px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 576px) {
  .form-container {
    width: 90%;
    max-width: 360px;
  }

  .login-form {
    padding: 25px 20px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 14px;
  }
}
</style>
