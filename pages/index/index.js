//index.js
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();
Page({
  data: {
    user: '',
    name: '',
    date: util.formatDate(new Date()),
    title: '',
    word_count: '',
    term: '',
    hidden: 'hidden',
  },
  register: function() {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
      mask: true
    });
    wx.request({
      url: app.globalData.server + '/camp/register',
      data: { user: that.data.user},
      method: 'POST',
      success: function(res){
        if(res.data.message) {
           wx.showToast({
            title: res.data.message,
            icon: 'success',
            duration: 3000,
          })
        }else if(res.data.code) {
           wx.showToast({
            title: '注册成功，打卡模式已开启',
            icon: 'success',
            duration: 3000,
          })
        }
      },
      fail: function(res) {
        // fail
         wx.showToast({
            title: '注册失败'+res.errMsg,
            icon: 'success',
            duration: 3000,
          })
      },
      complete: function(res) {
        // complete
      }
    })
  },
  formSubmit: function(e) {
    wx.showLoading({
      title: '请稍后...',
       mask: true
    });
    wx.request({
      url: app.globalData.server + "/record",
      data: e.detail.value,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        wx.hideLoading();
        if(res.data && res.data.code == "2000") {
          wx.redirectTo({
            url: '../feedback/feedback?user=' + e.detail.value.user
          })
        }else {
          wx.showToast({
            title: res.data.message,
            icon: 'success',
            duration: 3000,
          })
        }
      },
      fail: function(res) {
        // fail
        wx.showToast({
          title: res.errMsg,
          icon: 'success',
          duration: 3000
        })
      },
    })
  },
  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        name:userInfo.nickName,
        user:userInfo.userId
      })
    });
    wx.request({
      url: app.globalData.server + '/camp',
      method: 'GET',
      success: function(res){
        if(res.data.term) {
          that.setData({
            term: res.data.term,
            hidden: ''
          });
        }
      },
      fail: function(res) {
        // fail
        wx.showToast({
          title: res.errMsg,
          icon: 'success',
          duration: 3000,
        })
      },
      complete: function(res) {
        // complete
      }
    })
  }
})
