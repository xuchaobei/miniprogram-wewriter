
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
      url: app.globalData.server + "/mini/record/" + encodeURIComponent(option.user),
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
  }
})