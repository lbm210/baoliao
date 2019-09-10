//app.js
var util = require("/utils/util.js");
var api = require('/config/api.js');
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    var that = this

    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.setStorageSync('is_login', 1)

    //读取配置文件信息
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    //console.log(extConfig)
    if (extConfig) {
      that.globalData.loginInfo.siteId = extConfig.siteid;
      that.globalData.loginInfo.uid = extConfig.uid;
    }
    // that.globalData.loginInfo.siteId = 1507;
    // that.globalData.loginInfo.uid = 1614;

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        let methodName = "PHSocket_XCX_GetBaoLiaoRankSetInfo";
        var params = util.requestParam(methodName, { siteID: that.globalData.loginInfo.siteId, uid: that.globalData.loginInfo.uid });
        util.request({
          url: api.ApiRootUrl,
          data: { param: params },
          error: function (err) {
          },
          success: function (res) {
            if (res.MessageList.code == 1000) {
              that.globalData.loginInfo.siteName = res.ServerInfo.SiteName;
              that.globalData.loginInfo.areaName = res.ServerInfo.AreaName;
              wx.setStorageSync('siteName', res.ServerInfo.SiteName);
              wx.setStorageSync('siteUrl', res.ServerInfo.SiteUrl);
              wx.setStorageSync('areaName', res.ServerInfo.AreaName);
              wx.setStorageSync('releaseBanner', res.ServerInfo.ReleaseBanner);
              wx.setStorageSync('squareBanner', res.ServerInfo.SquareBanner);
              wx.setStorageSync('reward', res.ServerInfo.Reward);
              wx.setStorageSync('taskTotal', res.ServerInfo.TaskTotal);
              wx.setStorageSync('followIsOpen', res.ServerInfo.FollowIsOpen);
              wx.setStorageSync('moveIsOpen', res.ServerInfo.MoveIsOpen);
              //广场 0：关闭 1：开启
              wx.setStorageSync('squareIsOpen', res.ServerInfo.SquareIsOpen);
              //榜单 0：关闭 1：开启
              wx.setStorageSync('rankIsOpen', res.ServerInfo.RankIsOpen);
              //分享好友 1开启 0关闭
              wx.setStorageSync('shareOpen', res.ServerInfo.ShareOpen);
              //审核 1开启 0关闭
              wx.setStorageSync('auditOpen', res.ServerInfo.AuditOpen); 
              wx.setStorageSync('isEnd', res.ServerInfo.IsEnd);
            }
          }
        });

        var params2 = util.requestParam("PHSocket_GetWeiXinOpenID", { code: res.code, type: 1, uid: that.globalData.loginInfo.uid, xcxtype: 19 }, 0);
        util.request({
          url: util.API_net,
          data: { param: params2 },
          error: function (err) {
            if (failFunc) { failFunc(); return; }
            wx.showToast({ title: '获取数据失败', icon: "none" });
          },
          success: function (res) {
            console.log(res)
            if (res.MessageList.code == "1000") {
              that.globalData.loginInfo.openId = res.ServerInfo.openID;
              that.globalData.loginInfo.unionId = res.ServerInfo.unionid;
              that.globalData.loginInfo.session_key = res.ServerInfo.session_key;
              wx.setStorageSync('session_key', res.ServerInfo.session_key);
             
              //获取unionID未获取到，为空；则调用授权方法重新获取unionID
              // if(app.globalData.loginInfo.unionId==""){
              //   userIsAuth(getWxLoginUserInfo,succFunc,failFunc);
              // }else{
              //   getWxLoginUserInfo(succFunc,failFunc);
              // }       
            }
          }
        });

      }
    })
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    //自定义头部导航
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.platform = res.platform
        let totalTopHeight = 68
        if (res.model.indexOf('iPhone X') !== -1) {
          totalTopHeight = 88
        } else if (res.model.indexOf('iPhone') !== -1) {
          totalTopHeight = 64
        }
        that.globalData.statusBarHeight = res.statusBarHeight
        that.globalData.titleBarHeight = totalTopHeight - res.statusBarHeight
      },
      failure() {
        that.globalData.statusBarHeight = 0
        that.globalData.titleBarHeight = 0
      }
    })
  },
  globalData: {
    userInfo: null,
    loginInfo: {
      xcxId: 19,
      siteId: 0,
      siteName: '',
      siteUrl: '',
      areaName: '',
      uid: 0,
      unionId: "",
      openId: "",
      session_key: "",
      // userId: 20326494,
      // userName: 'cctn02',
      // phone: '13810638594',
      // userFace: 'http://p5.pccoo.cn/PHBBS/20190307/2019030717425133382326.jpg',
      // nick: '奔跑的蜗牛',
      userId: 0,
      userName: '',
      phone: '',
      userFace: '',
      nick: '',
      sex: '',
      lifeaddr: '',
      userIsAuth: 0, //用户是否授权  0：未授权  1：已授权
      qrCode: '', //二维码
      code: ''
    },
  }
})