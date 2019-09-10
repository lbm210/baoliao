// pages/poster/poster.js
const app = getApp()
const util = require('../../utils/util.js')
const res = wx.getSystemInfoSync();
const windowWidth = res.windowWidth;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarTit: '分享好友',//头部导航标题
    navbarBack: 'back',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isLoad: true,
    siteCity:'',
    siteName: '',
    reward: 0, //奖励
    title: '',
    logo: '',
    avatar: '',
    nickName: '',
    banner: '',
    ewx: '', //小程序码
    picStatus: false,
    shareRead: true,
    taskNum:0 //每月可完成任务数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    //小程序码
    var url = util.GetXCXInfoQRCode('shareUserID=' + app.globalData.loginInfo.userId, 'pages/index/index', app.globalData.loginInfo.siteId, function (url) {
      //url = 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=' + url;
      wx.getImageInfo({
        src: url,
        success: function (res) {
          console.log('小程序码-'+res.path)
          that.setData({
            ewx: res.path,
            isLoad: false,
          })
        } 
      })
    });

    console.log(options)
    var userInfoNick = options.name;
    userInfoNick = this.getLength(userInfoNick)
    this.setData({
      nickName: userInfoNick,
      avatar: options.tx,
      siteCity: wx.getStorageSync('areaName'),
      siteName: wx.getStorageSync('siteName'),
      reward: wx.getStorageSync('reward'),
      taskNum: wx.getStorageSync('taskTotal'),
    })
    this.setData({
      title: `我正在参加${this.data.siteName}身边事爆料，分享身边的好人好事趣事、曝光不文明行为！一起来参加吧`
    })
    var that = this
    wx.getImageInfo({
      src: 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/xcx/images/poster-ban.jpg',
      success: function(res) {
        that.setData({
          banner: res.path
        })
      }
    })
    wx.getImageInfo({
      src: 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/zd-logo.png',
      success: function(res) {
        that.setData({
          logo: res.path
        })
      }
    })
    wx.getImageInfo({
      src: `https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${this.data.avatar}`,
      success: function(res) {
        that.setData({
          avatar: res.path
        })
      }
    })
    
    that.shareFn()

  },
  shareFn: function(e) {
    var that = this
    var banner, logo, ewx, avatar, nickName
    var t = setInterval(function() {
      banner = that.data.banner;
      logo = that.data.logo;
      ewx = that.data.ewx;
      avatar = that.data.avatar
      nickName = that.data.nickName
      if (banner != '' && avatar != '' && ewx != '' && nickName != '' && logo != '') {
        clearInterval(t)
        that.createNewImg(banner, logo, ewx, avatar, nickName);
      } 
    }, 300);
  },
  createNewImg(banner, logo, ewx, avatar, nickName) {
    let that = this;
    that.factor = windowWidth / 750;
    let context = wx.createCanvasContext('mycanvas');
    context.setFillStyle("#fff");
    context.fillRect(0, 0, that.toPx(750), that.toPx(900));
    //banner图
    context.drawImage(banner, 0, 0, that.toPx(750), that.toPx(380));
    //logo
    context.drawImage(logo, that.toPx(30), that.toPx(30), that.toPx(48), that.toPx(48));
    //站点名称
    context.setTextAlign('left')
    context.setFontSize(that.toPx(30));
    context.setFillStyle('#fff');
    context.fillText(that.data.siteName, that.toPx(100), that.toPx(65));
    context.stroke();
    //title标题
    context.setTextAlign('left')
    context.setFontSize(that.toPx(40));
    context.setFillStyle('#333');
    this.wrapText(that, context, that.data.title, that.toPx(28), that.toPx(468), that.toPx(468), that.toPx(710), 3, that.toPx(60));
    //二维码 
    if (ewx != '') {
      context.drawImage(ewx, that.toPx(20), that.toPx(680), that.toPx(136), that.toPx(136));
    }
    //绘制头像
    if (avatar != '') {
      context.save();
      var r = that.toPx(26);
      var d = that.toPx(26) * 2;
      var cx = that.toPx(180);
      var cy = that.toPx(700);
      context.beginPath(); //开始一个新的路径
      context.arc(cx + r, cy + r, r, 0, 2 * Math.PI);
      context.clip();
      context.drawImage(avatar, that.toPx(180), that.toPx(700), that.toPx(52), that.toPx(52));
      context.restore();
      context.closePath(); //关闭当前路径
    }
    //昵称
    var site = that.data.siteName
    if (nickName) {
      context.setTextAlign('left')
      context.setFontSize(that.toPx(30));
      context.setFillStyle('#000');
      context.fillText(nickName + ' 邀请你参加' + site + '爆料', that.toPx(245), that.toPx(740));
      //正在读这篇文章
      //var redLef;
      // redLef = nickName.length * 30 + 255
      // context.setTextAlign('left')
      // context.setFontSize(that.toPx(30));
      // context.setFillStyle('#666');
      // context.fillText('邀请你参加', that.toPx(redLef), that.toPx(740));
    }
    //站点
    // var site = that.data.siteName
    // let siteLeft = redLef + 150
    // context.setTextAlign('left')
    // context.setFontSize(that.toPx(30));
    // context.setFillStyle('#666');
    // context.fillText(site, that.toPx(siteLeft), that.toPx(740));
    // let nameLeft = site.length * 30 + siteLeft
    // context.setTextAlign('left')
    // context.setFontSize(that.toPx(30));
    // context.setFillStyle('#666');
    // context.fillText('爆料', that.toPx(nameLeft), that.toPx(740));
    //长按小程序码
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#666');
    context.fillText('长按小程序码参加，爆料成功有现金奖励哦', that.toPx(180), that.toPx(790));

    context.draw();
    that.setData({
      picStatus: true
    })
  },
  savePoster(e) {
    if (!this.data.shareRead) return
    this.setData({
      shareRead: false
    })
    var _this = this
    wx.showLoading({
      title: '图片保存中...',
    })
    var ti = setInterval(function(){
      if (_this.data.picStatus) {
        clearInterval(ti)
        wx.canvasToTempFilePath({
          canvasId: 'mycanvas',
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(result) {
                _this.setData({
                  shareRead: true
                })
                wx.hideLoading();

                wx.showToast({
                  title: '图片保存成功',
                  icon: 'success',
                  duration: 2000
                })
                _this.setData({
                  saveBind: 'cancelShareFn',
                  posterTip: '已保存至相册，快去朋友圈分享吧',
                  saveBtn: '知道了'
                })
              }
            })
          }
        })
      }
    },300)
  },
  /*px转rpx*/
  toPx(rpx) {
    return rpx * this.factor;
  },
  /*换行并多行隐藏*/
  wrapText(that, context, text, x, y, oriY, maxWidth, lineNum, lineHeight) {
    // 字符分隔为数组
    var arrText = text.split('');
    var line = '';

    for (var n = 0; n < arrText.length; n++) {
      var testLine = line + arrText[n];
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = arrText[n];
        if (y < (oriY + (lineNum - 1) * lineHeight)) {
          y += lineHeight;
        } else {
          return;
        }
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  },
  //字符长度设置，中文两个长度，英文一个长度
  getLength: function (val) {
    var str = new String(val); var bytesCount = 0;
    var newstr = '';
    for (var i = 0, n = str.length; i < n; i++) {
      var c = str.charCodeAt(i);
      if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {

        bytesCount += 1;
      } else {
        bytesCount += 2;
      }
      //console.log(bytesCount)
      if (bytesCount <= 8) {
        //console.log(str.substring(i, i+1))
        newstr += str.substring(i, i + 1);
      }
    }
    return newstr;
  }

})