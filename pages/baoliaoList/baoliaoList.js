// pages/baoliaoList/baoliaoList.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: true,
    holdBot: { //上拉加载样式
      show: true,
      text: '正在加载,请稍后',
      loading: true
    },
    page: {
      loadStatus: true,
      index: 1,
      size: 10
    },
    contList:[],
    // 无数据
    nodata:false,
    dialog:{
      show:true,
      tit:'',
      txt:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GetMyBaoLiaoList(this)
  },
  //获取爆料列表
  GetMyBaoLiaoList: function (that) {
    var that = that
    if (!that.data.page.loadStatus) return
    that.setData({
      'holdBot.show': true,
      'page.loadStatus': false
    })
    let methodName = "PHSocket_XCX_GetMyBaoLiaoList";
    var params = util.requestParam(methodName, { page: that.data.page.index, siteID: app.globalData.loginInfo.siteId, userName: app.globalData.loginInfo.userName });
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
                contList: res.ServerInfo
              })
            } else {
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                contList: that.data.contList.concat(res.ServerInfo)
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
            if (index > 2) {
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': true
              })
            }else{
              //第一页的时候，无数据 显示为发布按钮
              that.setData({
                'holdBot.show': false,
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
        if (that.data.contList.length == 0) {
          that.setData({
            nodata: true
          })
        }
      },
      complete: function () {
        that.setData({
          isLoad: false
        })
      }
    });

  },
  //翻页请求
  onReachBottom: function () {
    this.GetMyBaoLiaoList(this)
  },
  //跳转详情页
  linkBoliaoDetail:function(e){
    let id = e.currentTarget.dataset.id
    let status = e.currentTarget.dataset.status
    let msg = e.currentTarget.dataset.msg
    if(status == 2){
      this.setData({
        'dialog.show': false,
        'dialog.txt':  msg,
        'dialog.tit': '您的信息未被采纳！',
      })
    }else if(status == 0){
      this.setData({
        'dialog.show': false,
        'dialog.txt': '如有其它疑问，请联系爆料客服',
        'dialog.tit': '您的信息正等待审核采纳...',
      })
    }else{
      wx.navigateTo({
        url: '../baoliaoDetail/baoliaoDetail?id=' + id,
      })
    }
  },
  // 关闭弹窗
  closeDia:function(){
    this.setData({
      'dialog.show':true
    })
  },
  // 复制客服微信号关闭小程序去添加
  copy:function(){
    wx.navigateTo({
      url: '../kefu/kefu',
    })
    // var that = this
    // wx.setClipboardData({
    //   data: that.data.dialog.weixin,
    //   success:function(res){
    //     console.log(res)
    //   }
    // })
  }
})