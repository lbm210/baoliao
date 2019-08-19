const app = getApp()
const api = require('../config/api.js')
const utilTwo = require('/utilTwo.js')
//.net接口服务器
var API_net = 'https://xcxapi.bccoo.cn/appserverapi.ashx';
//const API_net = "http://appnewv5.bccoo.cn/appserverapi.ashx";
//const API_net = 'http://localhost:52511/appserverapi.ashx';

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 去除前后空格
const trim = string => {
  return string.replace(/(^\s*)|(\s*$)/g, '');
}
// 获取用户信息并保存
const isLogin = (that,app) =>{
  var phone = wx.getStorageSync('phone')
  console.log(phone)
  if(phone){
    that.setData({
      'hasUser.phone': phone
    })
  }
}
// 手机验证
const phoneReg = phone =>{
  let reg = /^1[3-9]\d{9}$/
  if(reg.test(phone)){
    return true
  }else{
    return false
  }
}
// 提示框
const showToast = txt =>{
  wx.showToast({
    title: txt,
    icon: 'none',
    duration: 1500
  })
}
//接口请求参数封装--短信接口
function requestParamSms(method, params, apitype) {
  var requestTime = formatTime(new Date());
  var key = '32csd44fgdwertgyusdfsd1ewwejhhalsc1z5aWea2=';
  var sign = utilTwo.hexMD5(key + method + requestTime);
  var ParData = function () {
    return {
      customerID: 8004,
      customerKey: sign,
      requestTime: requestTime,
      appName: "CcooCity",
      version: "5.3",
      Method: method,
      Param: params,
      ApiType: 0,
    };
  }
  console.log(JSON.stringify(ParData()))
  return JSON.stringify(ParData());
}
//接口请求参数封装
function requestParam(method, params, apitype) {
  var requestTime = formatTime(new Date());
  var key = '+6Hp9X5zR39SOI6oP0685Bk77gG56m7PkV89xYvl86A=';
  var sign = utilTwo.hexMD5(key + method + requestTime);
  var ParData = function () {
    return {
      customerID: 8001,
      customerKey: sign,
      requestTime: requestTime,
      appName: "CcooCity",
      version: "5.3",
      Method: method,
      Param: params,
      ApiType: 0,
    };
  }
  console.log(JSON.stringify(ParData()))
  return JSON.stringify(ParData());
}
//接口请求
const request = function (option) {
  let R_url = option.url || API_net;
  let R_data = option.data || {};
  let R_method = option.method || "GET";
  let R_type = option.type || "application/json";
  let R_token = wx.getStorageSync('token');
  wx.request({
    url: R_url,
    data: R_data,
    method: R_method,
    header: {
      'Content-Type': R_type,
      'X-Nideshop-Token': R_token
    },
    success: function (res) {
      console.log(res)
      if (option.success && res.statusCode == 200) option.success(res.data);
      else if (option.error) option.error(res.statusCode);
    },
    fail: function (err) {
      console.log(err)
      if (option.error) option.error(err);
    },
    complete: function () {
      if (option.complete) option.complete();
    }
  });
}
// 获取手机号码
// const getPhoneNumber(e) {
//   console.log(e.detail.errMsg)
//   console.log(e.detail.iv)
//   console.log(e.detail.encryptedData)
// }
const getphonenumber =(event,that,app,cb)=>{
 
  // if (event.detail.encryptedData) {
  //   let methodName = '解析手机号信息方法'
  //   var params = requestParam(methodName, { detail: event.detail,siteID: app.globalData.loginInfo.siteId, uid: app.globalData.loginInfo.uid });
  //   request({
  //     url: api.ApiRootUrl,
  //     data: { param: params },
  //     error: function (err) {
  //     },
  //     success: function (res) {
  //       console.log(res)
  //       if (res.code == 1000) {
  //         wx.setStorageSync('phone', res.data.phone)
  //         console.log('phone: '+res.data.phone)
  //         that.setData({
  //           'hasUser.phone': res.data.phone
  //         })
  //         if (cb && (typeof cb == 'function')){
  //           cb(res)
  //         }
  //       }
  //     }
  //   })
  // }else{
  //   wx.showToast({
  //     title: '登录失败',
  //     icon:'none'
  //   })
  // }
}

//获取小程序二维码
function GetXCXInfoQRCode(scene, page, siteId, fn) {
  var url = '';
  let methodName = "PHSocket_GetXCXInfoQRCode";
  var params = requestParam(methodName, { scene: scene, page: page, siteId: siteId, id: 19 });
  request({
    url: API_net,
    data: { param: params },
    error: function (err) {
    },
    success: function (res) {
      if (res.MessageList.code == 1000) {
        url = res.ServerInfo.msg;
        console.log('url: ' + url);
      }
      fn && fn(url)
    }
  });
  return url;
}

module.exports = {
  formatTime,
  formatTime2,
  isLogin,
  trim,
  requestParamSms,
  requestParam,
  request,
  getphonenumber,
  phoneReg,
  showToast,
  GetXCXInfoQRCode,
  API_net
}
