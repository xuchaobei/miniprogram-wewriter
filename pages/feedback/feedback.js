var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    continuous_count: '',
    total_count: '',
    total_word: ''
  },
  onLoad: function (option) {
    var that = this;

    wx.request({
      url: app.globalData.server + "/record/mini/" + encodeURIComponent(option.user),
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        that.setData({
            continuous_count: res.data.continuousCount,
            total_count: res.data.totalCount,
            total_word: res.data.totalWords
        })
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },

  onUnload: function() {
    // Do something when page close.
    //wx.navigateBack();
  },

  share: function () {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
      mask: true
    });
    app.getUserInfo(function (userInfo) {
      that.getSharePic(userInfo);
    });
  },

  getSharePic: function (userInfo) {
    wx.request({
      url: app.globalData.server + '/share',
      data: { 
        userId: userInfo.userId,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        date: util.formatDate(new Date()),
      },
      method: 'POST',
      success: function (res) {
        if (res.data.message) {
          wx.showToast({
            title: res.data.message,
            duration: 3000,
          })
        } else if (res.data.code === 2000) {
          wx.hideLoading();
          wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: [res.data.url] // 需要预览的图片http链接列表
          })
        }
      },
      fail: function (res) {
        // fail
        wx.showToast({
          title: res.errMsg,
          duration: 3000,
        })
      },
      complete: function (res) {
        // complete
      }
    })
  }
})