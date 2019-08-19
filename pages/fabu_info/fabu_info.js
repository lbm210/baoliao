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
    isLoad: true,
    is_login: true,
    navIndex: 2,
    footer: [{
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
    hasUser: {
      phone: '',
      userTx: '../../images/user-tx-d.png',
      loginUrl: ''
    },
    siteName: '',
    dialog: {
      show: false,
      tit: '爆料成功，将在管理员采纳后显示',
      txt1: '我们将在采纳后根据您的爆料价值',
      txt2: '给予不同程度的现金奖励'
    },
    xyShow: true, // 协议开关
    tatShow:true, //问问框显示开关
    chooseImgShow: true,
    releaseBanner: '../../images/fabu2.jpg',
    fabuData: {
      label: '',
      labelId: '',
      tit: '',
      txt: '',
      address: '',
      imgUrlData: [],
      videoUrlList: [],
      date: '',
      phone: ''
    },
    happenDate: '',
    imgUrlData: [],
    videoUrlList: [],
    treatyList: [],
    userInfo: {},
    ERR_OK: false,
    isUp: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
      'footer[1].isOpen': rankIsOpen,
    })

    console.log(options)
    // 获取爆料标签
    console.log(wx.getStorageSync('labelTit'))
    console.log(wx.getStorageSync('labelId'))
    this.setData({
      'fabuData.label': wx.getStorageSync('labelTit'),
      'fabuData.labelId': wx.getStorageSync('labelId'),
      siteName: wx.getStorageSync('siteName'),
      releaseBanner: wx.getStorageSync('releaseBanner'),
    })

    // this.setData({
    //   userInfo: app.globalData.userInfo,
    //   siteName: wx.getStorageSync('siteName'),
    //   'hasUser.loginUrl': `../login/login?id=${options.id}&tit=${options.tit}&page=fabu`
    // })
    //设置初始时间
    let date = util.formatTime2(new Date())
    this.setData({
      happenDate: date,
      'fabuData.date': date
    })
    let that = this
    //util.isLogin(that, app)
    if (app.globalData.loginInfo.userId == 0 || app.globalData.loginInfo.phone.length == 0) {
      that.setData({
        'hasUser.phone': '',
        // 'hasUser.phone': '234',
        'hasUser.loginUrl': `../login/login?id=${options.id}&tit=${options.tit}&page=fabu`
      })
    } else {
      that.setData({
        'fabuData.phone': app.globalData.loginInfo.phone,
        'hasUser.phone': app.globalData.loginInfo.phone,
        'hasUser.loginUrl': ''
      })
    }
    that.setData({
      isLoad: false
    })

    this.GetBaoLiaoTreatyList();

  },
  //获取手机号
  getphonenumber: function(e) {
    console.log(e)
    common.getPhoneNumber(e, this, );
  },
  //获取爆料协议
  GetBaoLiaoTreatyList: function() {
    var that = this
    let methodName = "PHSocket_XCX_GetBaoLiaoTreatyList";
    var params = util.requestParam(methodName, {
      siteID: app.globalData.loginInfo.siteId
    });
    util.request({
      url: api.ApiRootUrl,
      data: {
        param: params
      },
      error: function(err) {},
      success: function(res) {
        if (res.MessageList.code == 1000) {
          that.setData({
            treatyList: res.ServerInfo
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
  // 设置输入框
  iptBlur: function(event) {
    let val = util.trim(event.detail.value)
    let key = event.currentTarget.dataset.type
    if (key == 'tit') {
      this.setData({
        'fabuData.tit': val
      })
    } else if (key == 'txt') {
      this.setData({
        'fabuData.txt': val
      })
    } else if (key == 'address') {
      this.setData({
        'fabuData.address': val
      })
    }
  },
  txtareaIpt: function (event){
    let val = util.trim(event.detail.value)
    console.log(val)
    this.setData({
      'fabuData.txt': val
    })
  },
  /** 选择上传图片 */
  chooseImg: function() {
    let that = this;
    if (!that.data.imgUrlData) {
      var imgData = []
    } else {
      var imgData = that.data.imgUrlData;
    }
    if (imgData.length == 9) {
      wx.showToast({
        title: '图片最多选择9张',
        icon: 'none',
        duration: 2000
      })
      return
    }
    var length = imgData.length
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        for (var i = 0; i < tempFilePaths.length; i++) {
          let j = i + length
          if (j > 8) return;
          imgData.push({
            imgUrl: tempFilePaths[i],
            show: true,
            isLoad: true,
            progress: 0,
            upImgUrl: ''
          });
          that.setData({
            imgUrlData: imgData
          });
          let scUrl = 'http://up9.pccoo.cn/upload.ashx?filesrc=wap_baoliao&siteid=' + app.globalData.loginInfo.siteId + '&uid=' + app.globalData.loginInfo.uid + '&source=1&audit=1&print=2&frmpage=' + wx.getStorageSync('siteUrl');
          console.log(scUrl)
          that.upload_file_server(scUrl, that, tempFilePaths, i, j, imgData)
        }
      }
    });
  },
  /** 选择上传视频 */
  chooseVideo: function() {
    let that = this;
    if (!that.data.videoUrlList) {
      var videoData = []
    } else {
      var videoData = that.data.videoUrlList;
    }
    if (videoData.length == 3) {
      wx.showToast({
        title: '视频最多选择3个',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.chooseVideo({
      sourceType: ["album"], // 可以指定来源是相册还是相机，默认二者都有
      maxDuration: 30,
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为video标签的src属性显示图片
        let tempFilePath = res.tempFilePath;
        if (res.duration > 30 || res.size > 20971520) {

          wx.showToast({
            title: '上传视频时间超出或者过大，请重新选择',
            icon: 'none',
            duration: 2000
          })
          return
        }
        videoData.push({
          videoUrl: tempFilePath,
          videoScale: `${res.width},${res.height}`,
          type: 1,
          videoSize: res.size,
          videoTime: res.duration,
          isHidden:true
        });
        wx.showLoading({
          title: '视频上传中',
        })
        // that.setData({
        //   videoUrlList: videoData
        // });
        let scUrl = 'http://up9.pccoo.cn/upload.ashx?filesrc=wap_baoliao&siteid=' + app.globalData.loginInfo.siteId + '&uid=' + app.globalData.loginInfo.uid + '&source=1&audit=1&print=2&frmpage=' + wx.getStorageSync('siteUrl');
        that.upload_Video_server(scUrl, that, tempFilePath, videoData)
      }
    });
  },
  /** 删除照片、视频 */
  deleteImgVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let type = e.currentTarget.dataset.type
    let imgData = this.data.imgUrlData
    let videoData = this.data.videoUrlList
    if (type == 'img') {
      imgData.splice(index, 1)
      let imgUrlArr = imgData.map(function(item) {
        return item.upImgUrl
      })
      that.setData({
        imgUrlData: imgData
      });
    } else {
      videoData.splice(index, 1)
      that.setData({
        videoUrlList: videoData
      });
    }
  },
  // 查看大图
  showBigPic: function(e) {
    let index = e.currentTarget.dataset.index;
    let arrUrl = this.data.imgUrlData.map(function(item) {
      return item.imgUrl
    })
    wx.previewImage({
      current: this.data.imgUrlData[index].imgUrl, // 当前显示图片的http链接
      urls: arrUrl // 需要预览的图片http链接列表
    })
  },
  //图片上传方法
  upload_file_server: function(url, that, upload_picture_list, i, j, imgData) {
    var params = util.requestParam("PHSocket_ImageUpload", { url: url, type: 1 }, 0);
    console.log(api.ApiRootUrl)
    //上传返回值
    let upload_task = wx.uploadFile({
      url: api.ApiRootUrl, //需要用HTTPS，同时在微信公众平台后台添加服务器地址  
      formData: { param: params },
      filePath: upload_picture_list[i], //上传的文件本地地址    
      name: 'iamges',
      // formData: {
      //   'num': j
      // },
      //附近数据，这里为路径     
      success: function(res) {
        let data = JSON.parse(res.data)
        if (res.statusCode == 200 && data.MessageList.code == 1000) {
          imgData[j].upImgUrl = data.Extend
          imgData[j].type = 0
          console.log(data.Extend)
          let imgUrlArr = imgData.map(function(item) {
            return item.upImgUrl
          })
          that.setData({
            imgUrlData: imgData,
          })
        }
      }
    })
    //上传 进度方法
    upload_task.onProgressUpdate((res) => {
      imgData[j].progress = res.progress
      that.setData({
        imgUrlData: imgData
      });
      if (res.progress == 100) {
        imgData[j].isLoad = false;
        that.setData({
          imgUrlData: imgData
        })
      }
    });
  },
  //视频上传方法
  upload_Video_server: function(url, that, file_Path, videoData) {
    var length = videoData.length
    var params = util.requestParam("PHSocket_VideoUpload", { url: url}, 0);
    //上传返回值
    let upload_task = wx.uploadFile({
      url: api.ApiRootUrl, //需要用HTTPS，同时在微信公众平台后台添加服务器地址  
      formData: { param: params },
      filePath: file_Path, //上传的文件本地地址    
      name: 'file',
      // formData: {
      //   'type': 'video'
      // },
      //附近数据，这里为路径     
      success: function(res) {
        console.log(res)
        let data = JSON.parse(res.data)
        if (res.statusCode == 200 && data.MessageList.code == 1000) {
        
          var length = videoData.length
          videoData[length - 1].videoUrl = data.Extend
          let wh = videoData[length - 1].videoScale.replace(',','*')
          // 获取视频封面
          common.getVideoPicUrl(data.Extend, wh,function(res){
            wx.hideLoading({
              complete: function () {
                wx.showToast({
                  title: '视频上传成功',
                  icon: 'none',
                  duration: 1500
                })
              }
            })
            console.log(res)
            videoData[length - 1].imgUrl = res
            that.setData({
              videoUrlList: videoData,
            });
          })
        }
      }
    })
  },
  //选择日期
  bindDateChange: function(event) {
    let val = event.detail.value
    this.setData({
      'fabuData.date': val
    })
  },
  // 手机验证
  regPhone: function(e) {
    let value = util.trim(e.detail.value);
    this.regPhoneFun(value, this)
  },
  regPhoneFun: function(value, that) {
    let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    console.log(reg.test(value));
    if (!reg.test(value)) {
      wx.showToast({
        title: "手机号码格式不正确",
        icon: "none",
        mask: true
      });
      that.setData({
        ERR_OK: false,
      });
    }
    that.setData({
      'fabuData.phone': value
    });
  },
  // 上传视频图片数据处理
  setImgVideoData: function() {
    let imgData = this.data.imgUrlData
    let videoData = this.data.videoUrlList
    //console.log(imgData, videoData)
    let imgArr = imgData.map(function(item) {
      return `{"type": ${item.type},"imgUrl": "${item.upImgUrl}"}`
    })
    let videoArr = videoData.map(function(item) {
      return JSON.stringify(item)
    })
    let mediaArr = imgArr.concat(videoArr)
    return mediaArr.join('|')
  },
  // 发布
  fabu: function() {
    this.isOK(this.data, this)
    if (!this.data.ERR_OK || this.data.isUp) return
    this.setData({
      isUp: true
    })
    let methodName = 'PHSocket_XCX_AddBaoLiaoInfo'
    let that = this
    let pics = that.setImgVideoData(); //视频和图片的json
    // pics = pics.replace(/\n/g, '');
    // pics = pics.replace(/\s+/g, '');
    console.log(pics)
    let shareUserID = wx.getStorageSync('shareUserID'); //分享人id
    if (!shareUserID) {
      shareUserID = 0;
    }
    // console.log(shareUserID+"||"+that.data.fabuData.label + '||' + that.data.fabuData.labelId);
    // console.log(that.data.fabuData.tit + "||" + that.data.fabuData.txt);
    // console.log(that.data.fabuData.address);
    // console.log('pics-'+pics);
    // console.log(that.data.fabuData.date + '||' + that.data.fabuData.phone);

    var params = util.requestParam(methodName, {
      siteID: app.globalData.loginInfo.siteId, 
      uid: app.globalData.loginInfo.uid,
      userID: app.globalData.loginInfo.userId,
      title: that.data.fabuData.tit,
      address: that.data.fabuData.address,
      time: that.data.fabuData.date,
      content: that.data.fabuData.txt,
      pics: pics, //  媒体文件
      cateId: that.data.fabuData.labelId,
      shareUserID: shareUserID,
      tel: that.data.fabuData.phone,
    });
    util.request({
      url: api.ApiRootUrl,
      method: 'POST',
      type: 'application/x-www-form-urlencoded',
      data: {
        param: params
      },
      success: function(res) {
        //成功
        if (res.MessageList.code == 1000) {
          that.setData({
            'dialog.show': true,
            tatShow: false
          })
        } else {
          wx.showToast({
            title: res.MessageList.message,
            icon: 'none',
            duration: 2000
          })
        }
        that.setData({
          isUp: false
        })
      }
    })
  },
  isOK: function(data, that) {
    let arr = []
    let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
    if (!data.fabuData.tit || data.fabuData.tit.length < 5) {
      arr.push('请输入爆料标题（5-50个字内）')
    } else if (!data.fabuData.txt) {
      arr.push('输入爆料内容（500字内）')
    } else if (data.imgUrlData.length == 0 && data.videoUrlList.length == 0) {
      arr.push('视频和图片两项必须填写一项')
    } else if (!data.fabuData.phone) {
      arr.push('请输入手机号码！')
    } else if (!reg.test(data.fabuData.phone)) {
      arr.push('手机号码错误请重新输入！')
    }
    if (arr.length) {
      wx.showToast({
        title: arr[0],
        icon: "none",
        mask: true
      });
      that.setData({
        ERR_OK: false
      })
    } else {
      that.setData({
        ERR_OK: true
      })
    }
  },
  // 继续爆料
  linkFabu: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  // 我的爆料
  linkBaoliaoList: function() {
    wx.redirectTo({
      url: '../baoliaoList/baoliaoList',
    })
  },
  //协议开关
  openXY: function() {
    this.setData({
      xyShow: false,
      tatShow:false
    })
  },
  xyClose: function() {
    this.setData({
      xyShow: true,
      tatShow:true
    })
  },

  //定位方法
  getUserLocation: function() {
    var _this = this;

    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权

        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          //未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function(res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      _this.geo();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          _this.geo();
        } else {
          console.log('授权成功')
          //调用wx.getLocation的API
          _this.geo();
        }
      }
    })
  },
  // 获取定位城市
  geo: function () {
    var _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        
        let methodName = "PHSocket_XCX_GetUserMap";
        let mapUrl = 'http://api.map.baidu.com/geocoder/v2/?ak=1E7670740d40d583e602638e191f5f9a&location=' + res.latitude + ',' + res.longitude + '&output=json';
        var params = util.requestParam(methodName, { url: mapUrl });
        util.request({
          url: api.ApiRootUrl,
          data: { param: params },
          error: function (err) {
          },
          success: function (res) {
            console.log(res)
            if (res.MessageList.code == 1000) {

              _this.setData({
                'fabuData.address': res.ServerInfo.address
              })

            }else{
                wx.showModal({
                  title: '信息提示',
                  content: '请求失败',
                  showCancel: false,
                  confirmColor: '#f37938'
                });
            }

          }
        });
       
        // wx.request({
        //   url: 'http://api.map.baidu.com/geocoder/v2/?ak=1E7670740d40d583e602638e191f5f9a&location=' + res.latitude + ',' + res.longitude + '&output=json',
        //   data: {},
        //   header: { 'Content-Type': 'application/json' },
        //   success: function (ops) {
        //     // console.log('定位城市：', ops.data.result.addressComponent.city)
        //     console.log('定位城市：', ops)
        //     console.log('adress:'+ops.data.result.formatted_address)
        //     _this.setData({
        //       'fabuData.address': ops.data.result.formatted_address
        //     })
        //   },
        //   fail: function (resq) {
        //     wx.showModal({
        //       title: '信息提示',
        //       content: '请求失败',
        //       showCancel: false,
        //       confirmColor: '#f37938'
        //     });
        //   },
        //   complete: function () {
        //   }
        // })

      }
    })
  },
  // 播放视频
  playVideo:function(e){
    let index = e.currentTarget.dataset.index
    let videoCont = wx.createVideoContext(`video${index}`, this)
    let videoList = this.data.videoUrlList
    videoList[index].isHidden = false
    this.setData({
      videoUrlList: videoList
    })
    videoCont.play()
  },
  // 关闭登录弹窗
  closeLogin: function () {
    wx.navigateBack({
      delta:1
    })
  }
})