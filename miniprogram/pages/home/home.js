Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 'profile',
    type: null,
    userInfo: {},
    wxUserInfo: {},
    courses: [],  //可选课程
    oldCourses: [], //已学课程
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      type: options.type ? parseInt(options.type) : null,
      wxUserInfo: getApp().globalData.wxUserInfo
    });

    const db = wx.cloud.database()
    db.collection('members').field({
      _id: true,
      wid: true,
      type: true,
      nickName: true,
      group: true,
      gender: true,
      role: true,
      profession: true,
      region: true,
      age: true,
      courses: true,
      profile: true,
      reasons: true,
    }).get().then(res => {
      if (res.data.length > 0) {
        this.setData({
          userInfo: res.data[0]
        })
      }
    });
  },

  bindChangeTab: function(e) {
    const tab = e.detail.key;
    if (tab === 'course' && this.data.courses.length === 0) {
      this.getActiveCourses();
    }
    this.setData({
      currentTab: e.detail.key
    })
  },

  getActiveCourses: function() {
    const db = wx.cloud.database()

    db.collection('courses').field({
      name: true,
    }).where({
      status: 1,
    }).orderBy('createDate', 'desc').get().then(res => {
      const activeCourseData = res.data; 
      const oldCourses = this.data.userInfo.courses;
      this.setData({
        courses: activeCourseData.map(item => ({
          name: item.name,
          value: item.name,
          checked: oldCourses && oldCourses.some(c => {
            return item.name === c
          })
        })),
        oldCourses: oldCourses ?
          oldCourses.filter(item => {
            return activeCourseData.every(c => {
              return c.name !== item 
            })
          }) : []
      })
    });
  },

  bindModifyUserInfo: function() {
    const type = this.data.userInfo.type;
    if(type !== null) {
      wx.navigateTo({
        url: `../register/register?type=${type}`,
      })
    }
  },

  bindChangeCourse: function(e) {
    if (e.detail.value.length > 1) {
      wx.showModal({
        title: '提示',
        content: '当前只能选择1门课程',
        showCancel: false,
      })
      const curCourses = this.data.courses.map(item => {
        return e.detail.value.indexOf(item.name) >= 0 && !item.checked ? {
          ...item,
          checked: false
        } : item
      });
      this.setData({
        courses: curCourses
      });
      return;
    }

    let newCourses = [];
    const curCourses = this.data.courses.map(item => {
      if (e.detail.value.indexOf(item.name) >= 0) {
        newCourses.push(item.name);
        return {
          ...item,
          checked: true
        }
      } else {
        return { 
          ...item,
          checked: false
        }
      }
    });
    this.setData({
      courses: curCourses
    })

    const oldCourses = this.data.oldCourses;
    const db = wx.cloud.database();
    db.collection('members').doc(this.data.userInfo._id).update({
      data: {
        courses: [...newCourses, ...oldCourses],
        updateTime: db.serverDate(),
      },
      success: res => {
        if (newCourses.length === 0) {
          wx.showModal({
            title: '提示',
            content: '您已取消选课',
            showCancel: false,
          })
        } else {
          const msg = newCourses.slice().join('，');
          wx.showModal({
            title: '提示',
            content: `选课成功：${msg}`,
            showCancel: false,
          })
        }
      },
      fail: err => {
        wx.showModal({
          title: '提示',
          content: '系统错误，请联系管理员',
          showCancel: false,
        })
      }
    });
  },

  previewCourse: function(e) {
    wx.previewImage({
      current: 'cloud://wewriter-inrjv.7765-wewriter-inrjv-1301437123/course.jpeg', // 当前显示图片的http链接
      urls: ['cloud://wewriter-inrjv.7765-wewriter-inrjv-1301437123/course.jpeg'] // 需要预览的图片http链接列表
    })
  }
})