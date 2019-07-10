//index.js
var util = require('../../utils/util.js');

//获取应用实例
var app = getApp();
Page({
  data: {
    user: app.globalData.userId,
    name: '',
    date: util.formatDate(new Date()),
    title: '',
    word_count: '',
    article_link: '',
    term: '',
    hidden: 'hidden',
    authorized: app.globalData.authorized
  },

  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        user: userInfo.userId,
        name: userInfo.nickName,
        authorized: app.globalData.authorized
      })
    });
    // wx.request({
    //   url: app.globalData.server + '/camp',
    //   method: 'GET',
    //   success: function (res) {
    //     if (res.data.term) {
    //       that.setData({
    //         term: res.data.term,
    //         hidden: ''
    //       });
    //     }
    //   },
    //   fail: function (res) {
    //     // fail
    //     wx.showModal({
    //       title: '提示',
    //       content: res.errMsg,
    //       showCancel: false,
    //     })
    //   },
    // })
  },

  onGotUserInfo: function (e) {
    var userInfo = e.detail.userInfo
    //用户未同意授权
    if(!userInfo){
      return;
    }
    app.globalData.authorized = true;
    app.globalData.userInfo = userInfo;
    app.globalData.userInfo.userId = app.globalData.userId;
    this.setData({
      user: app.globalData.userId,
      name: userInfo.nickName,
      authorized: true
    });
  },

  register: function () {
    var that = this;
    wx.showLoading({
      title: '请稍后...',
      mask: true
    });

    wx.request({
      url: app.globalData.server + '/camp/register',
      data: { user: that.data.user },
      method: 'POST',
      success: function (res) {
        if (res.data.message) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
          })
        } else if (res.data.code === "2000") {
          wx.showModal({
            title: '提示',
            content: '注册成功，打卡模式已开启',
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        // fail
        wx.showModal({
          title: '提示',
          content: '注册失败:' + res.errMsg,
          showCancel: false,
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  formSubmit: function (e) {
    if(!this.validate(e.detail.value)) {
      return;
    }
    wx.showLoading({
      title: '请稍后...',
      mask: true
    });
    wx.request({
      url: app.globalData.server + "/record",
      data: e.detail.value,
      method: 'POST',
      // header: {}, // 设置请求的 header
      success: function (res) {
        // success
        if (res.data && res.data.code == "2000") {
          wx.navigateTo({
            url: '../feedback/feedback?user=' + e.detail.value.user
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
          })
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: res.errMsg,
          showCancel: false,
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },

  validate(data) {
    var title = data.title;
    var wordCount = data.word_count;
    if(!title || title.length === 0 || !wordCount || wordCount.length === 0) {
      wx.showModal({
        title: '提示',
        content: '标题和字数不能为空',
        showCancel: false,
      })
      return false;
    }
    return true;
  },

  getSharePic: function() {
    wx.showLoading({
      title: '请稍后...',
      mask: true
    });
    app.getUserInfo(function (userInfo) {
      wx.request({
        url: app.globalData.server + '/share/picture',
        data: {
          userId: userInfo.userId
        },
        method: 'GET',
        success: function (res) {
          if (res.data.message) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
            })
          } else if (res.data.code === 2000) {
            wx.previewImage({
              current: '', // 当前显示图片的http链接
              urls: [res.data.url] // 需要预览的图片http链接列表
            })
          }
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: res.errMsg,
            showCancel: false,
          })
        },
        complete: function (res) {
          wx.hideLoading();
        }
      })
    });
    
  }

})
