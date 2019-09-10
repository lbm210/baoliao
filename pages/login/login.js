// pages/login/login.js
const app = getApp()
const util = require('../../utils/util.js');
const common = require('../../public/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '登录',//头部导航标题
    navbarBack: 'back',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    phone: '',
    verify: "",
    verifyStatus: false,
    verifyTxt: '获取验证码',
    loading: false,
    login: false,
    loginState: 0, //0：登录 1：注册
    options: {},
    eRR_OK:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      options: options
    })
    this.setData({
      isLoad: false
    })
  },
  // 输入事件
  iptInput: function(e) {
    let type = e.currentTarget.dataset.type
    if (type == 'phone') {
      let phone = util.trim(e.detail.value)
      if (util.phoneReg(phone)) {
        this.setData({
          verifyStatus: true,
          phone: phone
        })
      }
    } else {
      let verify = util.trim(e.detail.value)
      this.setData({
        verify: verify
      })
    }
  },
  // 失焦事件
  iptBlur: function(e) {
    let type = e.currentTarget.dataset.type
    let val = util.trim(e.detail.value)
    if (type == 'phone') {
      console.log(util.phoneReg(val))
      if (util.phoneReg(val)) {
        this.setData({
          verifyStatus: true,
          phone: val
        })
      } else {
        this.setData({
          verifyStatus: false,
          phone: val
        })
        if (val == '') {
          util.showToast('请填写手机号码')
        } else {
          util.showToast('手机号码错误，请重新填写')
        }
      }
    } else {
      if (val.length != 6) {
        util.showToast('验证码错误，请重新填写')
      } else {
        this.setData({
          verify: val
        })
      }
    }
  },
  // 获取验证码
  getVerify: function() {
    var that = this
    that.setData({
      verifyStatus: false,
      verifyTxt: '已发送60s'
    })
    this.timeOut()
    let methodName = 'PHSocket_GetCheckPhoneAuth';
    var params = util.requestParam(methodName, {
      mobile: this.data.phone
    });
    util.request({
      url: '',
      data: {
        param: params
      },
      success: function(res) {
        if (res.MessageList.code == 1000) {
          //注册
          that.setData({
            loginState: 1
          })
          console.log('爆料用户注册')
          that.sendCode(6, '爆料用户注册');
        } else if (res.MessageList.code == 1001) {
          //登录
          that.setData({
            loginState: 0
          })
          console.log('爆料用户登录')
          that.sendCode(7, '爆料用户登录');
        } else {
          wx.showToast({
            title: res.MessageList.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //发送验证码
  sendCode: function(otype, tag) {
    let that = this;
    let methodName = 'PHSocket_SetSmsLoginSendCode';
    if(otype==6){
      methodName = 'PHSocket_SetRegSendCode';
    }
    var params = util.requestParam(methodName, {
      phone: this.data.phone,
      siteID: app.globalData.loginInfo.siteId,
    });
    util.request({
      url: '',
      data: {
        param: params
      },
      success: function (res) {
        //成功
        console.log(res)
        if (res.MessageList.code == 1000) {
          that.setData({
            isUp: false
          })
        }else{
          wx.showToast({
            title: res.MessageList.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //倒计时
  timeOut: function() {
    let time = 60
    let that = this
    let interVla = setInterval(function() {
      time--
      time < 0 ? time = 0 : time
      if (time == 0) {
        that.setData({
          verifyTxt: '重新发送',
          verifyStatus: true
        })
        clearInterval(interVla)
      } else {
        that.setData({
          verifyTxt: `已发送${time}s`,
          verifyStatus: false
        })
      }
    }, 1000)
  },
  //登录/注册验证
  login: function() {
    let phone = this.data.phone,
      verify = this.data.verify,
      that = this,
      eRR_OK = true
    if (!phone) {
      util.showToast('请填写手机号码')
      eRR_OK = false
    } else if (!verify) {
      util.showToast('请填写验证码')
      eRR_OK = false
    } else if (!util.phoneReg(phone)) {
      util.showToast('手机号码错误，请重新填写')
      eRR_OK = false
    } else if (verify.length != 6) {
      util.showToast('验证码错误，请重新填写')
      eRR_OK = false
    }
   
    if (!eRR_OK) {
      return
    }
    
    if(!this.data.eRR_OK) return
    this.setData({
      eRR_OK: false
    })
    wx.showLoading({
      title: '加载中',
    })
    if (that.data.loginState == 0) {
      console.log('爆料登录')
      that.goLogin(phone, verify);
    } else {
      console.log('爆料注册')
      that.goRegister(phone, verify);
    }

  },
  //直接登录
  goLogin: function(phone, verify) {
    let that = this;
    let methodName = 'PHSocket_XCX_GetSmsLoginCheckBl';
    var params = util.requestParam(methodName, {
      phone: phone,
      authKey: verify,
      post: '8000',
      version: '爆料-小程序',
      siteId: app.globalData.loginInfo.siteId
    });
    util.request({
      url: '',
      data: {
        param: params
      },
      success: function(res) {
        that.setData({
          eRR_OK : true
        })
        wx.hideLoading()
        if (res.MessageList.code == 1000) {
          app.globalData.loginInfo.userId = res.ServerInfo[0].UserID;
          app.globalData.loginInfo.userName = res.ServerInfo[0].UserName;
          app.globalData.loginInfo.phone = res.ServerInfo[0].Tel;
          app.globalData.loginInfo.userFace = res.ServerInfo[0].RoleImg;
          app.globalData.loginInfo.nick = res.ServerInfo[0].RoleName;
          //console.log(app.globalData.loginInfo)
          common.saveLoginUserInfo(res.ServerInfo[0].UserID, res.ServerInfo[0].UserName, res.ServerInfo[0].RoleImg, res.ServerInfo[0].RoleName, res.ServerInfo[0].Tel);
          wx.navigateBack({
            delta: 1
          })
          // 返回上一页
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1]; //当前页面
          var prevPage = pages[pages.length - 2]; //上一个页面
          if (that.data.options.page == 'fabu') {

            //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
              'fabuData.label': that.data.options.tit,
              'fabuData.labelId': that.data.options.id,
            })
          } else if (that.data.options.page == 'detail') {
            prevPage.setData({
              'detailId': that.data.options.id,
            })
          } else if (that.data.options.page == 'my') {
            prevPage.setData({
              'showLogin': false,
              'isBack': true
            })
          }

        } else {
          wx.showToast({
            title: res.MessageList.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //注册后登录
  goRegister: function(phone, verify) {
    let that = this;
    let methodName = 'PHSocket_SetPhoneRegUser';
    var params = util.requestParam(methodName, {
      phone: phone,
      authKey: verify,
      post: '8000',
      version: '爆料-小程序',
      siteID: app.globalData.loginInfo.siteId,
      type: 1,
      nick: app.globalData.loginInfo.nick,
      userFace: app.globalData.loginInfo.userFace,
      sex: app.globalData.loginInfo.sex
    });
    util.request({
      url: '',
      data: {
        param: params
      },
      success: function(res) {
        that.setData({
          eRR_OK : true
        })
        wx.hideLoading()
        if (res.MessageList.code == 1000) {
          app.globalData.loginInfo.userId = res.ServerInfo.UserID;
          app.globalData.loginInfo.userName = res.ServerInfo.UserName;
          app.globalData.loginInfo.phone = phone;
          app.globalData.loginInfo.userFace = res.ServerInfo.RoleImg;
          app.globalData.loginInfo.nick = res.ServerInfo.RoleName;
          common.saveLoginUserInfo(res.ServerInfo.UserID, res.ServerInfo.UserName, res.ServerInfo.RoleImg, res.ServerInfo.RoleName, phone);
          wx.navigateBack({
            delta: 1
          })

          // 返回上一页
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1]; //当前页面
          var prevPage = pages[pages.length - 2]; //上一个页面
          if (that.data.options.page == 'fabu') {

            //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
              'fabuData.label': that.data.options.tit,
              'fabuData.labelId': that.data.options.id,
            })
          } else if (that.data.options.page == 'detail') {
            prevPage.setData({
              'detailId': that.data.options.id,
            })
          } else if (that.data.options.page == 'my') {
            prevPage.setData({
              'showLogin': false,
              'isBack': true
            })
          }

        } else {
          wx.showToast({
            title: res.MessageList.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  }
})