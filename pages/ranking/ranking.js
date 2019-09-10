// pages/rank/rank.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')
const common = require('../../public/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '榜单',//头部导航标题
    navbarBack: 'false',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    is_login: true,
    navIndex: 1,
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
    holdBot: { //上拉加载样式
      show: true,
      text: '正在加载,请稍后',
      loading: true
    },
    // 无数据
    nodata: false,
    page:{
      loadStatus: true,
      size:10,
      index:1,
      type:0
    },
    rankList: {
      guanzhu: 0,
      gandong: 1
    },
    infoList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //底部菜单
    let squareIsOpen = wx.getStorageSync('squareIsOpen');
    let rankIsOpen = wx.getStorageSync('rankIsOpen');
    let auditOpen = wx.getStorageSync('auditOpen');
    if (auditOpen == 1) {
      squareIsOpen = 0;
      rankIsOpen = 0;
    }
    this.setData({
      'footer[0].isOpen': squareIsOpen,
      'footer[1].isOpen': rankIsOpen
    })


    var followIsOpen = wx.getStorageSync('followIsOpen');
    var moveIsOpen = wx.getStorageSync('moveIsOpen');
    if(followIsOpen==0&&moveIsOpen==1){
      this.setData({
        'page.type': 1,
      })
    }

    if (app.globalData.loginInfo.userId == 0) {
      common.getLoginUserInfo();
    }

    this.setData({
      'rankList.guanzhu': followIsOpen,
      'rankList.gandong': moveIsOpen,
    })

    //判断用户授权
    common.userIsAuth(this, app.globalData.loginInfo.session_key);

    this.GetBaoLiaoRankList(this)
  },
  getUserInfo: function (e) {
    let that =this
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
      common.onLaunch(function () {
        that.setData({
          is_login: true
        })
      })
    }
  },
  //翻页请求
  onReachBottom: function () {
    this.GetBaoLiaoRankList(this)
  },
  //获取榜单列表
  GetBaoLiaoRankList: function (that) {
    var that = that
    if (!that.data.page.loadStatus) return
    that.setData({
      'page.loadStatus': false
    })
    let methodName = "PHSocket_XCX_GetBaoLiaoRankList";
    var params = util.requestParam(methodName, { page: that.data.page.index, type: that.data.page.type, siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo.length == 0) {
            if(index == 1){
              that.setData({
                'holdBot.show': false,
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': false
              })
            }else{
              that.setData({
                'holdBot.show': true,
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': false
              })
            }
          } else if(res.ServerInfo.length > 0) {
            index++
            if (index == 2) {
              that.setData({
                'holdBot.show': true,
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                infoList: res.ServerInfo
              })
            } else {
              that.setData({
                'holdBot.show': true,
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                infoList: that.data.infoList.concat(res.ServerInfo)
              })
            }
            if (res.ServerInfo.length < that.data.page.size) {
              that.setData({
                'holdBot.show': true,
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': false
              })
            }
          }
          if (that.data.infoList.length == 0) {
            that.setData({
              nodata: true
            })
          } else {
            that.setData({
              nodata: false
            })
          }
        } else {
          that.setData({
            'holdBot.show': true,
            'page.loadStatus': true,
            'holdBot.loading': false,
            'holdBot.text': '加载内容失败~',
          })
        }
       
      },
      complete: function () {
        wx.hideLoading()
        that.setData({
          isLoad: false
        })
      }
    });

  },
  // 切换榜单
  changeRank:function(e){
    var index = e.currentTarget.dataset.id
    this.setData({
      'holdBot.show': false,
    })
    this.setData({
      'page.type': index,
      'page.index':1,
      'page.loadStatus':true,
      infoList:[],
    })
    wx.showLoading({
      title: '正在加载请稍后...',
    })
    this.GetBaoLiaoRankList(this)
  }

})