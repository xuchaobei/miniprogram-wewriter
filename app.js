//app.js
App({
  onLaunch: function () {

  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (result) {
          if(result.code) {
            wx.request({
              url: that.globalData.server + '/user/login',
              data: {
                code: result.code
              },
              success: function(res) {        
                if(res.data.userId) {
                  wx.getUserInfo({
                    success: function (res2) {
                      that.globalData.userInfo = res2.userInfo;
                      that.globalData.userInfo.userId = res.data.userId;
                      typeof cb == "function" && cb(that.globalData.userInfo)
                    }
                  })

                }else {
                  wx.showToast({
                    title: "获取用户ID失败，请尝试重新打开",
                    duration: 3000
                  })
                }
              }
            });
          }
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    server:"https://wewriter.xin"
    // server: "http://172.16.47.237:3000"
  }
})