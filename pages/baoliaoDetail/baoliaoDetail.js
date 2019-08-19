// pages/headerline/headerline.js
//获取应用实例
const app = getApp()
var util = require("../../utils/util.js")
var api = require('../../config/api.js')
const common = require('../../public/common.js');
const res = wx.getSystemInfoSync();
const windowWidth = res.windowWidth;
const WxParse = require('../../wxParse/wxParse.js')

Page({
  data: {
    is_login:false,
    isLoad: true,
    shieldIsOpen: 0, //是否开启屏蔽 0：否 1：是
    userInfo: {},
    showLogin:false,
    hasUser: {
      phone: '',
      userTx: '../../images/user-tx-d.png',
      loginUrl: '../login/login'
    },
    dialog: {
      toggle: true, //登录提示弹窗开关
    },
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    detailId: '',// 文章ID
    isAdd: 0,  //是否查询原库 0：否 1：是
    rd: 0,//热度
    review:true,//审核成功/失败
    detaileData: { // 文章内容
      title:'',
      label:'',
      readNum:0,
      hot:0,
      userTx:'',
      userName:'',
      time:'', //发布时间
      date:'',// 发生时间
      address: '',//发生地点
      txt:'',//爆料说明内容
      img:[], //爆料图片
      video:[],//爆料视频
      isZan:false,
      zanTx:[],//点赞人头像列表
      zanNum:0 //点赞人数
    },
    pinglun: [ //文章评论列表
    ],
    itemsList: [ // 精彩推荐
    ],
    flag: true,
    saveBind: 'savePoster',
    load_complete: false,//海报弹窗是否加载完成
    posterTip: '点击保存到手机相册',
    saveBtn: '保存',
    banner: '',
    logo: '',// 站点logo
    siteName: '',
    popTitle: '',
    ewx: '',
    avatar: '',
    nickName: '',
    popSite: '',
    sharePic: '',
    shareRead: true,
    backIndex:true
  },
  onLoad: function (option) {
    
    var that = this;
    this.setData({
      detailId: wx.getStorageSync('detaileId'),
      // detailId: 10976991,
    })
    if (!app.globalData.loginInfo.session_key) {
      //未登录
      that.setData({
        is_login:false
      })
    } else {
      //已登录
      that.setData({
        is_login: true
      })
    }
    wx.getImageInfo({
      src: 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/headline-xcx/images/zd-logo.png',
      success: function (res) {
        that.setData({
          logo: res.path
        })
      }
    })

    //小程序码参数
    if(option){
      var scene = decodeURIComponent(option.scene);
      console.log("scene:" + scene);
      if (scene != undefined && scene != "" && scene != "undefined") {
        var arr = scene.split("&");
        if (arr.length >= 2) {
          option.id = arr[0].replace('id=', '');
          option.share = arr[1].replace('share=', '');

          console.log("share:" + option.share);
          console.log("id:" + option.id);
        } else {
          option.id = scene.replace('id=', '');
          console.log("id:" + option.id);
        }
      }

      try {
        this.setData({
          backIndex: option.share ? false : true
        })
      } catch (err) {
        console.log(err)
      }

      let id = option.id;
      console.log('id'+id)
      this.setData({
        detailId: id,
        // detailId: 10976991,
      })
    }

    this.setData({
      shieldIsOpen: wx.getStorageSync('shieldIsOpen'),
    })

    wx.setStorageSync('site', app.globalData.loginInfo.siteName)
    this.setData({
      site: wx.getStorageSync('site'),
      siteName: wx.getStorageSync('site')
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log(res.userInfo)
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
          })
        }
      })
    }

    var that = this;

    // 获取详情,文章id
    that.GetBaoLiaoTopicInfo();
    //记录用户点击信息
    that.AddXcxUserHitLog();
  },
  onShareAppMessage: function (res) {

    var pages = getCurrentPages() //获取加载的页面 
    var currentPage = pages[pages.length - 1] //获取当前页面的对象 
    var url = currentPage.route //当前页面url 
    var sharePic = this.data.sharePic;
    //发送给好友
    return {
      title: this.data.detaileData.title,
      path: `${url}?id=${this.data.detailId}&share==1`,
      imageUrl: ''
    }
  },
  // 获取详情
  GetBaoLiaoTopicInfo: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoTopicInfo";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, topicID: that.data.detailId, isAdd: that.data.isAdd, uid: app.globalData.loginInfo.uid, userId: app.globalData.loginInfo.userId, userName: app.globalData.loginInfo.userName });

    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        if (res.MessageList.code == 1000) {

          //信息不存在时
          // if (res.ServerInfo == null) {
          //   wx.showLoading({
          //     title: '该信息已被删除',
          //     duration: 1500,
          //     success: function (e) {
          //       setTimeout(function () {
          //         wx.navigateBack()
          //       }, 1000)
          //     }
          //   })
          // }

          console.log(res.ServerInfo)
          that.setData({
            detaileData: res.ServerInfo.detaileData,
            pinglun: res.ServerInfo.pinglun,
            itemsList: res.ServerInfo.itemsList,
            popTitle: res.ServerInfo.detaileData.title,
            sharePic: (res.ServerInfo.detaileData.img && res.ServerInfo.detaileData.img.length > 0)? res.ServerInfo.detaileData.img : "http://img.pccoo.cn/xcx/images/poster-ban.jpg", 
            banner: "https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=http://img.pccoo.cn/xcx/images/poster-ban.jpg"
          })

          //console.log(article)
          var article = that.data.detaileData.txt;     // 这里是ajax请求数据       
          WxParse.wxParse('article', 'html', article, that, 0);


          // 设置查看更多
          try{
            let arr = that.data.pinglun.map(function (item, index) {
              item.moreTxt = `更多${item.moreLength}条回复`
              return item
            })
            that.setData({
              pinglun: arr
            })

          }catch(err){
            console.log(err)
          }
          var article = that.data.detaileData.content;     // 这里是ajax请求数据

          wx.getImageInfo({
            src: that.data.banner,
            success: function (res) {
              console.log(res.path)
              that.setData({
                banner: res.path
              })
            }
          })
        } else {
          wx.showLoading({
            title: '网络出现故障',
            duration: 1500
          })
        }
        that.setData({
          isLoad: false
        })
      }
    });

  },
  // 添加小程序用户点击记录
  AddXcxUserHitLog: function () {

    var that = this
    let methodName = "PHSocket_XCX_AddXcxUserHitLog";
    var params = util.requestParam(methodName, { siteId: app.globalData.loginInfo.siteId, infoId: that.data.detailId, xcxId: app.globalData.loginInfo.xcxId, uid: app.globalData.loginInfo.uid, userId: app.globalData.loginInfo.userId, userName: app.globalData.loginInfo.userName, openId: app.globalData.loginInfo.openId });

    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        if (res.MessageList.code == 1000) {
          //wx.setStorageSync('isAddOpenId', 1);
        }

      }
    });

  },
  //获取手机号
  getphonenumber: function (e) {
    console.log(e)
    common.getPhoneNumber(e, this);
  },
  getUserInfo: function (e) {
    let that = this
    console.log(!e.detail.userInfo)
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
      console
      if(!e.currentTarget.dataset.type){
        that.setData({
          userInfo: e.detail.userInfo,
        })
        that.shareFn()
      }else{
        common.onLaunch(function () {
          that.setData({
            is_login: true,
            userInfo: e.detail.userInfo,
          })
        });
      }
    }
  },

  more: function (e) {
    let index = Number(e.currentTarget.id)
    console.log(this.data.pinglun[0].childMax)
    let arr = [];
    let query = wx.createSelectorQuery();

    if (this.data.pinglun[index].childMax != 2) {
      arr = this.data.pinglun.map(function (item, index) {
        if (index == e.currentTarget.id) {
          item.childMax = 2
          item.moreTxt = `更多${item.moreLength}条回复`
        }
        return item
      })
    } else {
      arr = this.data.pinglun.map(function (item, index) {
        if (index == e.currentTarget.id) {
          item.childMax = item.length
          item.moreTxt = '收起'
        }
        return item
      })
    }
    this.setData({
      pinglun: arr
    })
  },/*海报弹窗*/
  shareFn: function (e) {
    var times = 100;
    var that = this;
    var banner = this.data.banner;
    var logo = this.data.logo;
    //var ewx = this.data.ewx;
    var ewx = '';
    //小程序码
    //pages/baoliaoDetail/baoliaoDetail
    var url = util.GetXCXInfoQRCode('id=' + that.data.detailId +'&share==1', 'pages/baoliaoDetail/baoliaoDetail', app.globalData.loginInfo.siteId, function (url) {
      //url = 'https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=' + url;
      wx.getImageInfo({
        src: url,
        success: function (res) {
          console.log(res.path)
          that.setData({
            ewx: res.path
          })
          ewx = res.path
        }
      })
    });
    var avatar

    //如果有用户信息调用户信息
    if (this.data.userInfo != undefined) {
      this.setData({
        avatar: this.data.userInfo.avatarUrl,
        nickName: this.data.userInfo.nickName
      })
    }
    //如果没有用户信息调调默认头像
    avatar = this.data.avatar;
    var nickName = this.data.nickName;
    wx.getImageInfo({
      src: `https://xcxapi.bccoo.cn/imgref/ajax/imgref.ashx?url=${avatar}`,
      success: function (res) {
        avatar = res.path
      }
    })
    wx.showLoading({
      title: '生成中...',
    })
    let time = 20
    var t = setInterval(function () {
      time--
      if ((banner != '' && avatar != '' && ewx != '' && nickName != '')) {
        clearInterval(t);
        that.setData({
          load_complete: true,
          flag: false,
          saveBind: 'savePoster',
          posterTip: '点击保存到手机相册',
          saveBtn: '保存',
        })
        that.createNewImg(banner, logo, ewx, avatar, nickName);
        clearInterval(t)
      }
      if(time < 0){
        wx.hideLoading()
        wx.showToast({
          title: '生成失败，请重新生成',
          icon:'none'
        })
        clearInterval(t)
      }
    }, 300);

  },/*关闭海报弹窗*/
  cancelShareFn: function (e) {
    //取消发给好友、生成卡片
    this.setData({
      flag: true,
    })
  },/*海报canvas*/
  createNewImg(banner, logo, ewx, avatar, nickName) {
    let that = this;
    that.factor = windowWidth / 750;
    let context = wx.createCanvasContext('mycanvas');
    context.setFillStyle("#fff");
    context.fillRect(0, 0, that.toPx(750), that.toPx(800));
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
    this.wrapText(that, context, that.data.popTitle, that.toPx(28), that.toPx(468), that.toPx(468), that.toPx(710), 2, that.toPx(60));
    //二维码 
    if (ewx != '') {
      context.drawImage(ewx, that.toPx(20), that.toPx(580), that.toPx(136), that.toPx(136));
    }
    //绘制头像
    if (avatar != '') {
      console.log(avatar)
      context.save();
      var r = that.toPx(26);
      var d = that.toPx(26) * 2;
      var cx = that.toPx(180);
      var cy = that.toPx(600);
      context.beginPath();//开始一个新的路径
      context.arc(cx + r, cy + r, r, 0, 2 * Math.PI);
      context.clip();
      context.drawImage(avatar, that.toPx(180), that.toPx(600), that.toPx(52), that.toPx(52));
      context.restore();
      context.closePath();//关闭当前路径
    }
    //昵称
    var redLef;
    if (nickName) {
      context.setTextAlign('left')
      context.setFontSize(that.toPx(30));
      context.setFillStyle('#000');
      context.fillText(nickName, that.toPx(245), that.toPx(640));
      //正在读这篇文章
      redLef = nickName.length * 30 + 255
      context.setTextAlign('left')
      context.setFontSize(that.toPx(30));
      context.setFillStyle('#666');
      context.fillText('正在读这篇文章', that.toPx(redLef), that.toPx(640));
    }
    //长按小程序码
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#666');
    context.fillText('长按小程序码，进入', that.toPx(180), that.toPx(690));
    //站点
    var site = that.data.popSite
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#ee2e2e');
    context.fillText(site, that.toPx(400), that.toPx(690));
    //查看详情
    var seeInfoLef = site.length * 24 + 410
    context.setTextAlign('left')
    context.setFontSize(that.toPx(24));
    context.setFillStyle('#666');
    context.fillText('查看详情', that.toPx(seeInfoLef), that.toPx(690));
    context.draw();
    wx.hideLoading();
  },/*海报保存*/
  savePoster(e) {
    if (!this.data.shareRead) return
    this.setData({
      shareRead: false
    })
    var _this = this
    wx.showLoading({
      title: '保存中...',
    })
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(result) {
              wx.hideLoading();
              _this.setData({
                shareRead: true
              })
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
    }, 3000)
  },/*px转rpx*/
  toPx(rpx) {
    return rpx * this.factor;
  },/*换行并多行隐藏*/
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
  // 点赞
  thumbsUp: function (e) {
    let that = this
    let phone = app.globalData.loginInfo.phone
    if(!phone){
      that.setData({
        showLogin: true,
        'hasUser.loginUrl': `../login/login?id=${this.data.detailId}&page=detail`
      })
      return
    }
    let id = e.currentTarget.dataset.id
    let isZan = that.data.detaileData.isZan
    let tx = app.globalData.loginInfo.userFace

   
    if (isZan) {
      wx.showToast({
        title: '你已经点赞过了~',
      })
    } else {
    
      let zanNum = that.data.detaileData.zanNum
      let zanTx = that.data.detaileData.zanTx
      zanNum++
      zanTx.push({ 'roleImg': tx })
      that.setData({
        'detaileData.isZan': true,
        'detaileData.animate': true,
        'detaileData.zanTx': zanTx,
        'detaileData.zanNum': zanNum
      })
    }
    let methodName ='PHSocket_SetTopic_Sup';
    let params = util.requestParam(methodName, { topicId: id, siteId: app.globalData.loginInfo.siteId, userName: app.globalData.loginInfo.userName });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        if (res.MessageList.code == 1000) {
          // that.setData({
          //   isAdd: 1,
          // })
        }
      }
    });
  },
  // 关闭登录弹窗
  closeLogin: function () {
    this.setData({
      showLogin: false
    })
  }
  
})