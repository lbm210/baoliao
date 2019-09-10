// pages/kefu/kefu.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '联系客服',//头部导航标题
    navbarBack: 'back',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    phone: '',
    ewm:'',
    ewmTxt:'客服二维码',
    weixin:'dsrfasdf',
    bbsEwm:'',
    bbsEwmTxt:'社区爆料二维码',
    bbsTit:'fasdfasdfasdfasdfasdf'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.GetBaoLiaoKfInfo();
  },
  //获取客服信息
  GetBaoLiaoKfInfo: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoKfInfo";
   // var params = util.requestParam(methodName, { siteID: 1507, uid: app.globalData.loginInfo.uid });
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        that.setData({
          isLoad: false,
        })

        if (res.MessageList.code == 1000) {
       
          that.setData({
            phone: res.ServerInfo.kfTel,
            ewm: res.ServerInfo.kfQrCode,
            ewmTxt: res.ServerInfo.kfName,
            weixin: res.ServerInfo.kfWx,
            bbsEwm: res.ServerInfo.sqCode,
            bbsEwmTxt: res.ServerInfo.sqName,
            bbsTit: res.ServerInfo.sqIntro
          })

        }

      }
    });

  },
  // 拨打电话
  telphone:function(){
    wx.makePhoneCall({
      phoneNumber:this.data.phone
    })
  },
  copy:function(){
    wx.setClipboardData({
      data: this.data.weixin,
      success:function(res){
        console.log(res)
      }
    })
  },
  showBigKF:function(){
    wx.previewImage({
      urls: [this.data.ewm] 
    })
  },
  showBigBBS:function(){
    wx.previewImage({
      urls: [this.data.bbsEwm] 
    })
  }
})