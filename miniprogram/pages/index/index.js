//index.js
import { $wuxLoading } from '../../lib/index'

const app = getApp()

Page({
  data: {
    userInfo: {},
    loading: true,
    type: null,
  },

  onLoad: function () {
    this.$wuxLoading = $wuxLoading();
    this.$wuxLoading.show({
      text: '数据加载中',
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.wxUserInfo = res.userInfo;
              this.checkIfRegistered();
            }
          })
        } else {
          this.$wuxLoading.hide();
          this.setData({
            loading: false
          })
        }
      },
      fail: (error) => {
        this.$wuxLoading.hide();
        this.setData({
          loading: false
        })
      }
    })

  },

  checkIfRegistered: function () {
    const db = wx.cloud.database();
    db.collection('members').field({
      wid: true,
      type: true,
    }).get().then(res => {
      if (res.data.length > 0 && res.data[0].type !== null) {
        const userInfo = res.data[0];
        wx.redirectTo({
          url: `../home/home?type=${userInfo.type}`,
        })
      } else {
        this.$wuxLoading.hide();
        this.setData({
          loading: false
        })
      }
    });
  },

  bindChange: function (e) {
    this.setData({
      type: e.detail.value
    })
  },

  bindGetUserInfo: function (e) {
    if(this.data.type === null) {
      wx.showModal({
        title: '提示',
        content: '请先选择登记类型',
        showCancel: false,
      });
      return;
    }
    if (e.detail.userInfo) {
      app.globalData.wxUserInfo = e.detail.userInfo;
      wx.navigateTo({
        url: `../register/register?type=${this.data.type}`,
      })
    }
  },

})
