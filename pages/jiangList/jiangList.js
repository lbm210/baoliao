// pages/jiangList/jiangList.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '我的奖励',//头部导航标题
    navbarBack: 'back',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    holdBot: { //上拉加载样式
      show: false,
      text: '正在加载,请稍后',
      loading: true
    },
    page: {
      loadStatus: true,
      index: 1,
      size: 10
    },
    // 无数据
    nodata: false,
    jiangList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isLoad: false
    })
    this.GetBaoLiaoMsgList(this)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '正在刷新页面',
    })
    this.setData({
      jiangList:[],
      'page.index': 1,
    })
    this.GetBaoLiaoMsgList(this)
  },
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.GetBaoLiaoMsgList(this)
  },
  //获取奖励列表
  GetBaoLiaoMsgList: function (that) {
    var that = that
    if (!that.data.page.loadStatus) return
    that.setData({
      'holdBot.show': true,
      'page.loadStatus': false
    })
    let methodName = "PHSocket_XCX_GetBaoLiaoMsgList";
    var params = util.requestParam(methodName, { page: that.data.page.index, siteID: app.globalData.loginInfo.siteId, userID: app.globalData.loginInfo.userId,type:2 });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo.length > 0) {
            index++
            if (index == 2) {
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                jiangList: res.ServerInfo
              })
            } else {
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                jiangList: that.data.jiangList.concat(res.ServerInfo)
              })
            }
            if (res.ServerInfo.length < that.data.page.size) {
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': true
              })
            }
          } else {
            if (index == 1) {
              that.setData({
                'holdBot.show': false,
                'page.loadStatus': true
              })
            }else{
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': true
              })
            }
          }
        } else {
          that.setData({
            'holdBot.show': false,
            'page.loadStatus': true
          })
        }
        if (that.data.jiangList.length == 0) {
          that.setData({
            nodata: true
          })
        }
      },
      complete: function () {
        that.setData({
          isLoad: false
        })
        wx.hideLoading()
      }
    });

  },

})