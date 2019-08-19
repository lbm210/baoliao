const util = require('../utils/util.js');
const trim = (string) => {
  return string.replace(/(^\s*)|(\s*$)/g, '');
}
/** 获取验证码 */
const getVerifyingCode = (that) => {
  var that = that;
  let phone = that.data.phone;
  let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
  if (phone == '' || !reg.test(phone)) {
    wx.showToast({
      title: '手机号码不正确请重新输入',
      mask: true,
      icon: 'none'
    })
  } else {
    let s = 120;
    let stimer = setInterval(function () {
      s--;
      that.setData({
        text: s + '秒后可重发',
        disabled: true
      })
      if (s == 0) {
        clearInterval(stimer);
        that.setData({
          text: '重新获取',
          disabled: false
        })
        s = 120
      }
    }, 1000);
    var params = util.requestParam("PHSocket_SetPhoneBindSendCode", { siteID: wx.getStorageSync('siteId'), userName: wx.getStorageSync('userName'), phone: phone }, 0);
    util.request({
    url: util.API_net,
    data: { param: params },
    error: function (err) { wx.showToast({ title: '获取数据失败', icon: "none" }); },
    success: function (res) {
        if (res.MessageList.code == "1000") {     
          wx.showToast({
            title: '发送成功~',
            icon:'success'
          })
        }else{
          wx.showToast({
            title: res.MessageList.message,
            icon:'none'
          })
        }
      }      
    });
  }
}
module.exports = {
  trim: trim,
  getVerifyingCode: getVerifyingCode
};