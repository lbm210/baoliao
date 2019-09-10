//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../config/api.js')
const common = require('../../public/common.js');
Page({
  data: {
    navbarTit: '',//头部导航标题
    navbarBack: 'false',//头部导航图标：back是返回上一页，home是返回首页,false则无图标
    isEnd:false,
    isLoad: true,
    is_login: true,
    navIndex: 0,
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
    userInfo: {},
    isLogin:false, //登录组件开关
    hasUser:{
      phone: '',
      userTx: '../../images/user-tx-d.png',
      loginUrl:'../login/login'
    },
    siteName:'',
    holdBot: { //上拉加载样式
      show: true,
      text: '正在加载,请稍后',
      loading: true
    },
    page: { //分页
      loadStatus: true,
      index: 1,
      size: 10,
      type:'0' // 爆料类别
    },
    banner:'',//banenr图
    //奖励播报
    broadcast:[],
    // 爆料频道
    labelList:[],
    // 爆料列表
    infoList:[],
    //没有爆料信息
    nodata:false,
    //点赞效果
    animations:[],
    //微信手机登录开关
    phoneBtnShow:true
  },
  onLoad: function (option) {

    //小程序码参数
    if (option) {
      var scene = decodeURIComponent(option.scene);
      console.log("scene:" + scene);
      let shareUserID = 0;
      if (scene != undefined && scene != "" && scene != "undefined") {
        shareUserID = scene.replace('shareUserID=', '');
        wx.setStorageSync('shareUserID', shareUserID); //分享人id
      }
    }
    //wx.setStorageSync('shareUserID', 59032304); //分享人id  测试

    //站点信息
    let siteName = wx.getStorageSync('siteName');
    let areaName = wx.getStorageSync('areaName');
    if (siteName.length == 0) {
      this.GetBaoLiaoConfig();
      siteName = wx.getStorageSync('siteName');
      areaName = wx.getStorageSync('areaName');
    }
    // wx.setNavigationBarTitle({
    //   title: areaName + '新鲜事爆料'
    // })

    this.setData({
      navbarTit: areaName + '新鲜事爆料'//自定义导航标题
    })

    console.log(wx.getStorageSync('squareIsOpen'))
    console.log(wx.getStorageSync('auditOpen'))
    //广场关闭时，跳转到发布页
    if (wx.getStorageSync('squareIsOpen')){
      if (wx.getStorageSync('squareIsOpen') == 0 || wx.getStorageSync('auditOpen') == 1) {
        wx.redirectTo({
          url: '../fabu/fabu',
        })
      }
    }
    
    if (app.globalData.loginInfo.userId == 0 ) {
      common.getLoginUserInfo();
    }
    
    //底部菜单
    if (wx.getStorageSync('squareIsOpen')){
      let squareIsOpen = wx.getStorageSync('squareIsOpen');
      let rankIsOpen = wx.getStorageSync('rankIsOpen');
      let auditOpen = wx.getStorageSync('auditOpen');
      if (auditOpen == 1) {
        squareIsOpen = 0;
        rankIsOpen = 0;
      }
      this.setData({
        'footer[0].isOpen': squareIsOpen,
        'footer[1].isOpen': rankIsOpen,
      })
    }
  
    this.setData({
      siteName: wx.getStorageSync('siteName'),
      banner: wx.getStorageSync('squareBanner'),
      isEnd: wx.getStorageSync('isEnd'),
    })

    //判断用户授权
    common.userIsAuth(this, app.globalData.loginInfo.session_key);

    let that = this
    // util.isLogin(that,app)
    this.GetBaoLiaoSquareTopInfo();
    this.GetBaoLiaoSquareBottomList(this)
    common.addXcxUserHitLog();
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
      common.getUserInfo(e,that);
      common.onLaunch(function () {
        that.setData({
          is_login: true
        })
      });
    }
  },
  FnPhoneBtnShow:function(){
    this.setData({
      phoneBtnShow:false
    })
  },
  FnPhoneBtnHide:function(){
    this.setData({
      phoneBtnShow:true
    })
  },
  //获取广场上部信息
  GetBaoLiaoSquareTopInfo: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoSquareTopInfo";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        if (res.MessageList.code == 1000) {
  
          that.setData({
            siteName: res.ServerInfo.SiteName,
            banner: res.ServerInfo.Banner,
            broadcast: res.ServerInfo.RewardList,
            labelList: res.ServerInfo.CateList,
          })

        }

      }
    });

  },
  //获取配置信息
  GetBaoLiaoConfig: function () {

    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoRankSetInfo";
    var params = util.requestParam(methodName, { siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {

        if (res.MessageList.code == 1000) {
          app.globalData.loginInfo.siteName = res.ServerInfo.SiteName;
          app.globalData.loginInfo.areaName = res.ServerInfo.AreaName;
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

          //底部菜单
          if (res.ServerInfo.AuditOpen == 1) {
            that.setData({
              // shieldIsOpen: res.ServerInfo.ShieldIsOpen,
              isEnd: res.ServerInfo.IsEnd,
              'footer[0].isOpen': 0,
              'footer[1].isOpen': 0,
            })
          }else{
            that.setData({
              // shieldIsOpen: res.ServerInfo.ShieldIsOpen,
              isEnd: res.ServerInfo.IsEnd,
              'footer[0].isOpen': wx.getStorageSync('squareIsOpen'),
              'footer[1].isOpen': wx.getStorageSync('rankIsOpen'),
            })
          }

          // wx.setNavigationBarTitle({
          //   title: res.ServerInfo.AreaName + '新鲜事'
          // })

          that.setData({
            navbarTit: res.ServerInfo.AreaName + '新鲜事'//自定义导航标题
          })

          if (wx.getStorageSync('squareIsOpen') == 0 || wx.getStorageSync('auditOpen') == 1) {
            wx.redirectTo({
              url: '../fabu/fabu',
            })
          }

        }

      }
    });

  },
  // 切换爆料列表
  getBaoliaoTpye:function(e){
    let that = this
    let type = e.currentTarget.dataset.id
    that.setData({
      'holdBot.show': false,
      'page.type':type,
      'page.index': 1,
      infoList:[]
    })
    wx.showLoading({
      title: '加载中',
    })
    that.GetBaoLiaoSquareBottomList(this)
  },
  // 点赞
  thumbsUp:function(e){
    let that = this
    let phone = app.globalData.loginInfo.phone
    if (!phone) {
      this.setData({
        isLogin:true
      })
      return
    }
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    let infoList = this.data.infoList
    infoList = infoList.map(function (item) {
      if(item.isZan) 
        item['animate'] = true
      else item['animate'] = false
      return item
    })

    if (!infoList[index].isZan){
      infoList[index].isZan = true
      infoList[index].zan++
      infoList[index].animate = true
    }else{
      wx.showToast({
        title: '您已经点赞过了~',
      })
      return
    }
    console.log(infoList)
    that.setData({
      infoList: infoList
    })

    let methodName = 'PHSocket_SetTopic_Sup';
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
  //获取爆料列表
  GetBaoLiaoSquareBottomList: function (that) {
    var that = that
    if (!that.data.page.loadStatus) return
    
    let methodName = "PHSocket_XCX_GetBaoLiaoSquareBottomList";
    var params = util.requestParam(methodName, { page: that.data.page.index, cateId: that.data.page.type, siteID: app.globalData.loginInfo.siteId, userID: app.globalData.loginInfo.userId });
    util.request({
      url: api.ApiRootUrl,
      data: { param: params },
      error: function (err) {
      },
      success: function (res) {
        that.setData({
          'holdBot.show': true,
          'page.loadStatus': false
        })
        let index = that.data.page.index
        if (res.MessageList.code == 1000) {
          if (res.ServerInfo == null){
            if (index == 1 && that.data.page.type > 0) {
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 暂无此类内容~',
                'page.loadStatus': true
              })
            } else {
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 没有更多内容了~',
                'page.loadStatus': true
              })
            }
            return;
          }
          if (res.ServerInfo.length > 0) {
            index++
            if (index == 2) {
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                infoList: res.ServerInfo
              })
            } else {
              that.setData({
                'page.loadStatus': true,
                'page.index': index,
                'holdBot.text': '正在加载,请稍后',
                infoList: that.data.infoList.concat(res.ServerInfo)
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
            if (index == 1 && that.data.page.type > 0) {
              that.setData({
                'holdBot.loading': false,
                'holdBot.text': ' 暂无此类内容~',
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
        if (that.data.infoList.length == 0){
          that.setData({
            nodata:true
          })
        }
      },
      complete:function(){
        that.setData({
          isLoad: false
        })
        wx.hideLoading()
      }
    });

  },
  //翻页请求
  onReachBottom: function () {
    this.GetBaoLiaoSquareBottomList(this)
  },
  //跳转爆料详情
  linkBaoliaoDetail:function(e){
    let id = e.currentTarget.dataset.id
    wx.setStorageSync('detaileId', id)
    wx.navigateTo({
      url: '../baoliaoDetail/baoliaoDetail?id=' + id,
    })
  },
  //关闭登录
  closeLogin:function(){
    this.setData({
      isLogin:false
    })
  }
})
