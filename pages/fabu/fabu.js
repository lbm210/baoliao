// pages/fabu/fabu.js
const app = getApp();
var util = require("../../utils/util.js");
var api = require('../../config/api.js');
const common = require('../../public/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '选择爆料类别',//头部导航标题
    navbarBack: 'false',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isEnd:false,
    isLoad: true,
    is_login: true,
    links: [],
    siteName:'',
    releaseBanner:'../../images/fabu2.jpg',
    navIndex:2,
    footer: [
      {
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
    pubRewShow: false, //发布奖励弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //底部菜单
    let squareIsOpen = wx.getStorageSync('squareIsOpen');
    let rankIsOpen = wx.getStorageSync('rankIsOpen');
    let auditOpen = wx.getStorageSync('auditOpen');
    let nowday = new Date().getFullYear().toString() + (new Date().getMonth() + 1).toString() + new Date().getDate().toString() ;
    console.log(nowday)
    //获取上次打开页面时间
    let lastDay = wx.getStorageSync('day');
    if(lastDay) {
        console.log('lastday', lastDay);
        console.log('nowday', nowday)
        if(lastDay == nowday) {
            this.setData({
              pubRewShow: true
            })
        } else {
            this.setData({
              pubRewShow: false
            })
        }  
    }

    if (auditOpen == 1) {
      squareIsOpen = 0;
      rankIsOpen = 0;
    }

    this.setData({
      'footer[0].isOpen': squareIsOpen,
      'footer[1].isOpen': rankIsOpen
    })

    if (app.globalData.loginInfo.userId == 0) {
      common.getLoginUserInfo();
    }
    
    this.setData({
      isLoad: false,
      isEnd: wx.getStorageSync('isEnd'),
      siteName: wx.getStorageSync('siteName'),
      releaseBanner: wx.getStorageSync('releaseBanner'),
    })

    //判断用户授权
    common.userIsAuth(this, app.globalData.loginInfo.session_key);

    this.GetBaoLiaoTypeAllData();

  },
  getUserInfo: function (e) {
    let that = this
    if (!e.detail.userInfo) {
      console.log('授权失败')
      wx.showModal({
        title: '授权失败',
        content: '请允许小程序获取用户权限',
        success: function (res) {
          if (res.confirm) {
            wx.openSetting({});
          }
        }
      })
    } else {
      console.log('授权成功')
      common.getUserInfo(e);
      common.onLaunch(function () {
        that.setData({
          is_login: true
        })
      });
    }
  },
  //获取爆料类别列表
  GetBaoLiaoTypeAllData: function () {
    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoCateList";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        if (res.MessageList.code == 1000) {
          that.setData({
            links: res.ServerInfo
          })
        } else {
          //无数据的时候
        }
        that.setData({
          isLoad: false
        })
      }
    });

  },
  //跳转到发布页
  linkFabu:function(e){
    wx.setStorageSync('labelTit', e.currentTarget.dataset.tit) 
    wx.setStorageSync('labelId', e.currentTarget.dataset.id) 
    wx.navigateTo({
      url: `../fabu_info/fabu_info`,
    })
  },
  closePubRew: function() {
    let nowday = new Date().getFullYear().toString() + (new Date().getMonth() + 1).toString() + new Date().getDate().toString() ;
    wx.setStorageSync('day', nowday);
    this.setData({
      pubRewShow: true
    })
  }
})