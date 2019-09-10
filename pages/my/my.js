// pages/my/my.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')
const common = require('../../public/common.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '我的',//头部导航标题
    navbarBack: 'false',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    is_login: true,
    navIndex: 3,
    footer: [{
        isOpen: 1,
        url: '../index/index',
        txt: '广场',
        icon: 'xicon-guangchang'
      },
      {
        isOpen: 1,
        url: '../ranking/ranking',
        txt: '榜单',
        icon: "xicon-bangdan"
      },
      {
        isOpen: 1,
        url: '../fabu/fabu',
        txt: '发布',
        icon: 'xicon-fabu'
      },
      {
        isOpen: 1,
        url: '../my/my',
        txt: '我的',
        icon: 'xicon-wode'
      }
    ],
    hasUser: {
      phone: '',
      userTx: '../../images/user-tx-d.png',
      loginUrl: '../login/login?page=my'
    },
    showLogin: false, //登录弹窗开关
    tipsShow: false, //余额说明弹窗
    siteName: '',
    shareOpen: 1, //分享好友 1开启 0关闭
    auditOpen: 0, //审核 1开启 0关闭
    dialog: {
      type: 'login',
      toggle: true, //登录提示弹窗开关
      tit: '登录后才可以查看',
      btnL: '取消',
      btn2: '确定'
    },
    appDownshow: true, //app下载提示弹窗
    userData: {
      name: '',
      memo: '',
      money: 0,
      blNum: 0,
      blRewardMoney: 0,
      noReadNum: 0,
      appId:'',
    },
    isBack: false,
    //微信手机登录开关
    phoneBtnShow: true,
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //底部菜单
    let squareIsOpen = wx.getStorageSync('squareIsOpen');
    let rankIsOpen = wx.getStorageSync('rankIsOpen');
    let auditOpen = wx.getStorageSync('auditOpen');
    let shareOpen = wx.getStorageSync('shareOpen');
    if (auditOpen == 1) {
      squareIsOpen = 0;
      rankIsOpen = 0;
      shareOpen = 0;
    }
    this.setData({
      'footer[0].isOpen': squareIsOpen,
      'footer[1].isOpen': rankIsOpen,
      shareOpen: shareOpen,
      auditOpen: auditOpen,
    })

    if (app.globalData.loginInfo.userId == 0) {
      common.getLoginUserInfo();
    }

    let that = this
    //是否登录
    if (app.globalData.loginInfo.userId > 0 && app.globalData.loginInfo.phone.length > 0) {
      this.setData({
        'hasUser.phone': app.globalData.loginInfo.phone,
        'hasUser.userTx': app.globalData.loginInfo.userFace,
        'userData.name': app.globalData.loginInfo.nick,
      })
      this.GetBaoLiaoMyHome();
    }
    //判断用户授权
    common.userIsAuth(this, app.globalData.loginInfo.session_key);

    //页面信息
    this.setData({
      isLoad: false,
      siteName: wx.getStorageSync('siteName'),
    })

    common.addXcxUserHitLog();
  },
  onShow: function() {
    if (this.data.isBack) {
      this.onLoad()
    }
  },
  //获取配置信息
  GetBaoLiaoMyHome: function() {
    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoMyHome";
    var params = util.requestParam(methodName, {
      siteID: app.globalData.loginInfo.siteId,
      userID: app.globalData.loginInfo.userId
    });
    util.request({
      url: api.ApiRootUrl,
      data: {
        param: params
      },
      error: function(err) {},
      success: function(res) {

        if (res.MessageList.code == 1000) {
          that.setData({
            'userData.memo': res.ServerInfo.memo,
            'userData.money': res.ServerInfo.money,
            'userData.blNum': res.ServerInfo.blNum,
            'userData.blRewardMoney': res.ServerInfo.blRewardMoney,
            'userData.noReadNum': res.ServerInfo.noReadNum,
            'userData.appId': res.ServerInfo.appId,
          })
        }

      }
    });

  },
  
  //获取手机号
  getphonenumber: function(e) {
    console.log(e)
    common.getPhoneNumber(e, this);
  },
  getUserInfo: function(e) {
    var that = this
    if (!e.detail.userInfo) {
      console.log('授权失败')
      wx.showModal({
        title: '授权失败',
        content: '请允许小程序获取用户权限',
        success: function(res) {
          if (res.confirm) {
            wx.openSetting({});
          }
        }
      })
    } else {
      console.log('授权成功')
      common.getUserInfo(e, that);
      common.onLaunch(function() {
        that.setData({
          is_login: true
        })
      });
    }
  },
  FnPhoneBtnShow: function () {
    this.setData({
      phoneBtnShow: false
    })
  },
  FnPhoneBtnHide: function () {
    this.setData({
      phoneBtnShow: true
    })
  },
  // 钱包提示
  tipsShow: function() {
    this.setData({
      tipsShow: !this.data.tipsShow
    })
  },
  //提现提示
  tixian: function() {
    this.setData({
      dialog: {
        type: 'appdown',
        toggle: false, //登录提示弹窗开关
        tit: `请下载${this.data.siteName}城市通APP提现`
      }
    })
  },
  // 页面检查登录跳转
  linkBaoliao: function() {
    if (!this.data.hasUser.phone) {
      // this.setData({
      //   dialog: {
      //     type: 'login',
      //     toggle: false, //登录提示弹窗开关
      //     tit: '登录后才可以查看'
      //   }
      // })
      // return 
      this.setData({
        'dialog.toggle': true,
        showLogin: true
      })
    } else {
      wx.navigateTo({
        url: '../baoliaoList/baoliaoList',
      })
    }
  },
  linkJl: function() {
    if (!this.data.hasUser.phone) {
      // this.setData({
      //   dialog: {
      //     type: 'login',
      //     toggle: false,
      //     tit: '登录后才可以查看'
      //   }
      // })
      // return
      this.setData({
        'dialog.toggle': true,
        showLogin: true
      })
    } else {
      wx.navigateTo({
        url: '../jiangList/jiangList',
      })
    }
  },
  linkMsg: function() {
    if (!this.data.hasUser.phone) {
      // this.setData({
      //   dialog: {
      //     type: 'login',
      //     toggle: false, 
      //     tit: '登录后才可以查看'
      //   }
      // })
      // return
      this.setData({
        'dialog.toggle': true,
        showLogin: true
      })
    } else {
      wx.navigateTo({
        url: '../msg/msg',
      })
    }
  },
  linkShare:function(){
    
  },
  // 用户分享跳转
  onGotUserInfo: function (e) {
    if (e.detail.userInfo) {
      if (!this.data.hasUser.phone) {
        // this.setData({
        //   dialog: {
        //     type: 'login',
        //     toggle: false,
        //     tit: '登录后才可以查看'
        //   }
        // })
        // return
        this.setData({
          'dialog.toggle': true,
          showLogin: true
        })
      } else {
        let avatarUrl = e.detail.userInfo.avatarUrl
        let nickName = e.detail.userInfo.nickName
        wx.navigateTo({
          url: `../poster/poster?tx=${avatarUrl}&name=${nickName}`,
        })
      }
     
    }
  },
  // 关闭弹窗
  closeDia: function() {
    this.setData({
      'dialog.toggle': true
    })
  },
  // 打开登录
  showLogin: function() {
    this.setData({
      'dialog.toggle': true,
      showLogin: true
    })
  },
  // 退出登录
  logoutDia: function() {
    this.setData({
      dialog: {
        type: 'logout',
        toggle: false, //登录提示弹窗开关
        tit: '确认退出当前登录吗？'
      }
    })
  },
  logout: function() {
    try {
      this.setData({
        dialog: {
          toggle: true, //登录提示弹窗开关
        }
      })

      common.quitLoginUserInfo();
      // this.onload();
      this.setData({
        'hasUser.phone': '',
        'hasUser.userTx': '../../images/user-tx-d.png',
        'userData.name': '',
        'userData.memo': '',
        'userData.money': 0,
        'userData.blNum': 0,
        'userData.blRewardMoney': 0,
        'userData.noReadNum': 0
      })

      console.log("退出")

    } catch (e) {
      console.log(e)
    }
  },
  //app下载提示/关闭
  showAppDia: function() {
    this.setData({
      appDownshow: false
    })
  },
  closeApp: function() {
    this.setData({
      appDownshow: true
    })
  },
  //打开头条小程序
  openToutiao:function(){
    let appId=this.data.userData.appId;
    console.log(appId)
    wx.navigateToMiniProgram({
      appId: appId,
    })
  },
  // 关闭登录弹窗
  closeLogin: function () {
    this.setData({
      showLogin: false
    })
  }

})