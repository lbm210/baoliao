// pages/msg/msg.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false,
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
    msgList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      msgList: [],
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
  //获取消息列表
  GetBaoLiaoMsgList: function (that) {
    var that = that
    if (!that.data.page.loadStatus) return
    that.setData({
      'holdBot.show': true,
      'page.loadStatus': false
    })
    let methodName = "PHSocket_XCX_GetBaoLiaoMsgList";
    //var params = util.requestParam(methodName, { page: that.data.page.index, siteID: 1507, userID: app.globalData.loginInfo.userId, type: 0, pageSize:5});  //测试
    var params = util.requestParam(methodName, { page: that.data.page.index, siteID: app.globalData.loginInfo.siteId, userID: app.globalData.loginInfo.userId,type:0 });
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
            if(index==2){
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                msgList: res.ServerInfo
              })
            }else{
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                msgList: that.data.msgList.concat(res.ServerInfo)
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
            that.setData({
              'holdBot.loading': false,
              'holdBot.text': ' 没有更多内容了~',
              'page.loadStatus': true
            })
          }
        } else {
          that.setData({
            'holdBot.show': false,
            'page.loadStatus': true
          })
        }
        if (that.data.msgList.length == 0) {
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
  //跳转我的爆料或详情
  link:function(e){
    //var type = e.currentTarget.dataset.type
    var id = e.currentTarget.dataset.id
    var url='';
    if(id>0){
      url = `../baoliaoDetail/baoliaoDetail?id=${id}`;
    }else{
      url = `../baoliaoList/baoliaoList`;
    }
    //console.log(id)
    wx.navigateTo({
      url: url,
    })
  }
})