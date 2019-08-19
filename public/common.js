const util = require('../utils/util.js');
const utilTwo = require('../utils/utilTwo.js')
var app = getApp();
//用户是否已授权
const userIsAuth = function (mod, session_key) {
  console.log(mod.data.is_login, session_key)
  // 查看是否授权
  if (session_key.length > 0) {
    mod.setData({
      is_login: true,
    })
  } else {
    mod.setData({
      is_login: false
    })
  }
}

//重置用户信息
const resetSiteInfo = function (siteid, uid) {
  if (app.globalData.loginInfo.siteId != siteid && app.globalData.loginInfo.uid != uid) {
    app.globalData.loginInfo.phone = '';
    app.globalData.loginInfo.userFace = '';
    app.globalData.loginInfo.nick = '';
    app.globalData.loginInfo.userId = 0;
    app.globalData.loginInfo.userName = '';
    app.globalData.loginInfo.siteId = parseInt(siteid);
    app.globalData.loginInfo.uid = parseInt(uid);
    app.globalData.loginInfo.lifeaddr = '';
    app.globalData.loginInfo.userIsAuth = 0;
    app.globalData.loginInfo.qrCode = '';
    app.globalData.loginInfo.unionId = '';
    app.globalData.loginInfo.openId = '';
    app.globalData.loginInfo.session_key = '';
    app.globalData.userInfo = null;
  }
}
//退出登录
const quitLoginUserInfo = function () {
  wx.removeStorageSync('phone')
  wx.removeStorageSync('userId')
  wx.removeStorageSync('userName')
  wx.removeStorageSync('userFace')
  wx.removeStorageSync('nick')
  wx.removeStorageSync('isAddOpenId');
  //wx.removeStorageSync('session_key')
  app.globalData.loginInfo.phone = '';
  app.globalData.loginInfo.userFace = '';
  app.globalData.loginInfo.nick = '';
  app.globalData.loginInfo.userId = 0;
  app.globalData.loginInfo.userName = '';
  app.globalData.loginInfo.lifeaddr = '';
  app.globalData.loginInfo.userIsAuth = 0;
  app.globalData.loginInfo.qrCode = '';
  app.globalData.loginInfo.unionId = '';
  app.globalData.loginInfo.openId = '';
  //app.globalData.loginInfo.session_key = '';
  app.globalData.userInfo = null;
}

//保存用户信息
const saveLoginUserInfo = function (userId, userName, userFace, nick, phone) {
  wx.setStorageSync('userId', userId);
  wx.setStorageSync('userName', userName);
  wx.setStorageSync('userFace', userFace);
  wx.setStorageSync('nick', nick);
  wx.setStorageSync('phone', phone);
}

//获取用户信息
const getLoginUserInfo = function () {
  app.globalData.loginInfo.phone = wx.getStorageSync('phone');
  app.globalData.loginInfo.userFace = wx.getStorageSync('userFace');
  app.globalData.loginInfo.nick = wx.getStorageSync('nick');
  console.log('userId-'+wx.getStorageSync('userId'))
  let userId = wx.getStorageSync('userId');
  if (userId==''){
    app.globalData.loginInfo.userId = 0;
  }else{
    app.globalData.loginInfo.userId = parseInt(userId);
  }
  app.globalData.loginInfo.userName = wx.getStorageSync('userName');
  app.globalData.loginInfo.session_key = wx.getStorageSync('session_key');
}

//手动授权获取用户信息
const getUserInfo = function (e) {
  let that = this;
  var sex = '';
  if (e.detail.userInfo.gender == 1) {
    sex = '男';
  } else if (e.detail.userInfo.gender == 2) {
    sex = '女';
  } else {
    sex = '未知';
  }
  app.globalData.loginInfo.userFace = e.detail.userInfo.avatarUrl;
  app.globalData.loginInfo.nick = e.detail.userInfo.nickName;
  app.globalData.loginInfo.sex = sex;
  app.globalData.loginInfo.lifeaddr = e.detail.userInfo.province + e.detail.userInfo.city;
}
//登录
const onLaunch = function (succFunc,failFunc) {
  let that = this;
  //console.log(that.data)
  wx.login({
    success: res => {
      var params = util.requestParam("PHSocket_GetWeiXinOpenID", { code: res.code, type: 1, uid: app.globalData.loginInfo.uid, xcxtype: 19 }, 0);
      util.request({
        url: util.API_net,
        data: { param: params },
        error: function (err) {
          if (failFunc) { failFunc(); return; }
          wx.showToast({ title: '获取数据失败', icon: "none" });
        },
        success: function (res) {
          console.log(res)
          if (res.MessageList.code == "1000") {
            app.globalData.loginInfo.openId = res.ServerInfo.openID;
            app.globalData.loginInfo.unionId = res.ServerInfo.unionid;
            app.globalData.loginInfo.session_key = res.ServerInfo.session_key;
            wx.setStorageSync('session_key', res.ServerInfo.session_key);
            if (succFunc && typeof succFunc == 'function'){
              succFunc()
            }
            //获取unionID未获取到，为空；则调用授权方法重新获取unionID
            // if(app.globalData.loginInfo.unionId==""){
            //   userIsAuth(getWxLoginUserInfo,succFunc,failFunc);
            // }else{
            //   getWxLoginUserInfo(succFunc,failFunc);
            // }       
          }else{
            wx.showToast({ title: res.MessageList.message, icon: "none" });
          }
        }
      });
    }
  })
}
// 添加小程序用户点击记录
const addXcxUserHitLog = function () {
  let isAddOpenId = wx.getStorageSync('isAddOpenId');
  if (isAddOpenId == 1) {
    return;
  }
  var that = this
  let methodName = "PHSocket_XCX_AddXcxUserInfo";
  var params = util.requestParam(methodName, { siteId: app.globalData.loginInfo.siteId, xcxId: app.globalData.loginInfo.xcxId, uid: app.globalData.loginInfo.uid, userId: app.globalData.loginInfo.userId, userName: app.globalData.loginInfo.userName, openId: app.globalData.loginInfo.openId, unionId: app.globalData.loginInfo.unionId });

  util.request({
    url: util.API_net,
    data: { param: params },
    error: function (err) {
    },
    success: function (res) {

      if (res.MessageList.code == 1000) {
        wx.setStorageSync('isAddOpenId', 1);
      }

    }
  });

}

//是否已登录
const isLogin = function (succFunc,failFunc) {
  // console.log("userName:"+app.globalData.loginInfo.userName)
  if (app.globalData.loginInfo.userId == 0 || app.globalData.loginInfo.phone.length == 0) {
    //未登录
    onLaunch(succFunc, failFunc);
  } else {
    //已登录
    if (succFunc){
      succFunc();
    }
  }
}

//自动手机认证
const getPhoneNumber = function (e,mod) {
  let that = mod;
  if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
    //不进行自定绑定，停留当前页
    return;
  } else {
    console.log('授权获取手机号')
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        console.log('session_key 未过期')
        getPhoneinfo(e, that);
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        console.log('session_key 已经失效')
        onLaunch(function(){
          getPhoneinfo(e, that);
        }); //重新登录
      }
    })
  }
}
//手机号信息解密,并根据手机号查询是否已绑定账号
const getPhoneinfo = function (e, mod) {
  let that = mod;
  var sessionKey = app.globalData.loginInfo.session_key;
  var encryptedData = e.detail.encryptedData;
  console.log(e.detail)
  var iv = e.detail.iv;
  var params = util.requestParam("PHSocket_GetXCXDecryptInfo", { encryptedData: encryptedData, iv: iv, sessionkey: sessionKey, ywtype: 1, loginType: 1, userSource: 1, type: 1, openID: app.globalData.loginInfo.unionId, siteId: app.globalData.loginInfo.siteId, userName: app.globalData.loginInfo.userName, userId: app.globalData.loginInfo.userId }, 0);
  console.log(params)
  util.request({
    url: util.API_net,
    data: { param: params },
    error: function (err) { wx.showToast({ title: '获取数据失败', icon: "none" }); },
    success: function (res) {
      console.log(res)
      if (res.MessageList.code == "1000") {
        var user = res.ServerInfo;
        if (user == null) {
          //注册
          console.log('注册')
          app.globalData.loginInfo.phone = res.Extend.Phone;
          setRegUserInfo(that);
        } else {
          //用户信息
          console.log('用户信息')
          app.globalData.loginInfo.phone = res.ServerInfo.Tel;
          app.globalData.loginInfo.userFace = res.ServerInfo.RoleImg;
          app.globalData.loginInfo.nick = res.ServerInfo.RoleName;
          app.globalData.loginInfo.userId = res.ServerInfo.UserID;
          app.globalData.loginInfo.userName = res.ServerInfo.UserName;
          saveLoginUserInfo(res.ServerInfo.UserID, res.ServerInfo.UserName, res.ServerInfo.RoleImg, res.ServerInfo.RoleName, res.ServerInfo.Tel);

          that.setData({
            'showLogin': false,
            'is_login': true,
            'isLogin': false
          })
          that.onLoad()
        }
      } else {
        wx.showToast({
          title: '服务器忙，请稍后在试~',
          icon: 'none'
        })
      }
    }
  });
}
//注册用户
const setRegUserInfo = function (mod) {
  let that = mod;
  let time = util.formatTime(new Date());
  let method ='PHSocket_XCX_SetPhoneRegUserByXcx';
  var key = 'ccoo_xcx_baoliao_2019';
  var sign = utilTwo.hexMD5(key + method + time);  //密码

  var params = util.requestParam(method, { 
    authKey: sign, 
    time: time, 
    phone: app.globalData.loginInfo.phone, 
    post: 8000, 
    version: '爆料-小程序', 
    siteID: app.globalData.loginInfo.siteId 
    }, 0);
  util.request({
    url: util.API_net,
    data: { param: params },
    error: function (err) { wx.showToast({ title: '获取数据失败', icon: "none" }); },
    success: function (res) {
      // console.log(res)
      if (res.MessageList.code == "1000") {
        var user = res.ServerInfo;
        if (user == null) {
          wx.showToast({
            title: '服务器忙，请稍后在试~',
            icon: 'none'
          })
        } else {
          //用户信息
          console.log('手机号授权注册成功后，获取到的用户信息')
          app.globalData.loginInfo.userFace = res.ServerInfo.RoleImg;
          app.globalData.loginInfo.nick = res.ServerInfo.RoleName;
          app.globalData.loginInfo.userId = res.ServerInfo.UserID;
          app.globalData.loginInfo.userName = res.ServerInfo.UserName;
          saveLoginUserInfo(res.ServerInfo.UserID, res.ServerInfo.UserName, res.ServerInfo.RoleImg, res.ServerInfo.RoleName, app.globalData.loginInfo.phone);

          that.setData({
            'showLogin': false,
            'isLogin': true
          })
          that.onLoad()

        }
      } else {
        wx.showToast({
          title: res.MessageList.message,
          icon: 'none'
        })
      }
    }
  });
}
//获取上传视频的封面图
const getVideoPicUrl = function (url,wh,cb) {
  let method = 'PHSocket_XCX_GetBaoLiaoVideoPicUrl';
  var params = util.requestParam(method, {
    wh: wh,
    url: url,
    siteID: app.globalData.loginInfo.siteId
  }, 0);
  util.request({
    url: util.API_net,
    data: { param: params },
    error: function (err) { wx.showToast({ title: '获取数据失败', icon: "none" }); },
    success: function (res) {
      if (res.MessageList.code == "1000") {
       
        cb(res.ServerInfo.pic)
      } else {
        //生成失败
      }
    }
  });
}
module.exports = {
  userIsAuth: userIsAuth,
  getUserInfo: getUserInfo,
  isLogin: isLogin,
  getPhoneNumber: getPhoneNumber,
  saveLoginUserInfo: saveLoginUserInfo,
  getLoginUserInfo: getLoginUserInfo,
  quitLoginUserInfo: quitLoginUserInfo,
  getVideoPicUrl: getVideoPicUrl,
  addXcxUserHitLog: addXcxUserHitLog,
  //getQRCode: getQRCode,
  resetSiteInfo: resetSiteInfo,
  onLaunch: onLaunch
};
