// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: null, // 1: 年度会员   2：单月训练营会员
    docId: '',
    wid: '',
    nickName: '',
    group: '',
    gender: '',
    role: '',
    profession: '',
    region: [],
    age: '',
    profile: '',
    courses: [],
    reasons: [
      { name: '单纯喜欢写作，希望提升写作技能', value: '1' },
      { name: '对写作课的课程内容或主题感兴趣', value: '2' },
      { name: '被弘丹老师吸引，向榜样近距离学习', value: '3' },
      { name: '想要通过写作变现', value: '4' },
      { name: '实现出书梦想', value: '5' },
      { name: '通过写作打造个人品牌', value: '6' },
      { name: '朋友推荐', value: '7' },
      { name: '其他原因', value: '8' }
    ],
    firstSubmit: true,
    genderList: [
      { name: '男', value: '男' },
      { name: '女', value: '女' },
    ],
    groupList: [
      { name: 'VIP1', value: 'VIP1' },
      { name: 'VIP2', value: 'VIP2' },
      { name: 'VIP3', value: 'VIP3' },
      { name: 'VIP4', value: 'VIP4' }
    ],
    roleList: [
      { name: '职场员工', value: '职场员工' },
      { name: '宝妈', value: '宝妈' },
      { name: '学生', value: '学生' },
      { name: '企业高管', value: '企业高管' },
      { name: '创业者', value: '创业者' },
      { name: '自由职业者', value: '自由职业者' },
      { name: '其他', value: '其他' },
    ],
    ageList: [
      { name: '18岁以下', value: '18岁以下' },
      { name: '18-25', value: '18-25' },
      { name: '26-30', value: '26-30' },
      { name: '31-40', value: '31-40' },
      { name: '41-50', value: '41-50' },
      { name: '51-60', value: '51-60' },
      { name: '60岁以上', value: '60岁以上' }
    ],
    reasonList: [
      { name: '单纯喜欢写作，希望提升写作技能', value: '1' },
      { name: '对写作课的课程内容或主题感兴趣', value: '2' },
      { name: '被弘丹老师吸引，向榜样近距离学习', value: '3' },
      { name: '想要通过写作变现', value: '4' },
      { name: '实现出书梦想', value: '5' },
      { name: '通过写作打造个人品牌', value: '6' },
      { name: '朋友推荐', value: '7' },
      { name: '其他原因', value: '8' },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const type = options.type ? parseInt(options.type) : null  
    this.setData({
      type, 
    })
    if (type === 2) {
      this.getActiveCourses();
    }
    this.getMemberInfo();
  },

  getActiveCourses: function () {
    const db = wx.cloud.database()
    db.collection('courses').field({
      name: true,
    }).where({
      status2: 1,
    }).orderBy('createDate', 'asc').get().then(res => {
      this.setData({
        courses: res.data.map(item => ({
          name: item.name,
          value: item.name
        }))
      })
    });
  },

  getMemberInfo: function () {
    const db = wx.cloud.database()
    db.collection('members').field({
      wid: true,
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
        const { wid, nickName, group, gender, role, profession, region, age, courses, profile, reasons, _id: docId } = res.data[0];
        this.setData({
          wid,
          nickName,
          group,
          gender,
          role,
          profession,
          region,
          age,
          courses: courses && this.data.courses ? this.data.courses.map(item => {
            const found = courses.find(ele => ele === item.value)
            return {
              ...item,
              checked: found ? true : false
            }
          }) : [],
          profile,
          reasons: reasons && this.data.reasons ? this.data.reasons.map(item => {
            const found = reasons.find(ele => ele === item.value)
            return {
              ...item,
              checked: found ? true : false
            }
          }) : [],
          docId,
          firstSubmit: false,
        });
      } else {
        this.setData({
          firstSubmit: true,
        })
      }
    });
  },

  validate: function (data) {
    const keys = Object.keys(data);
    let errMsg = '';
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'wid' && data[keys[i]].length === 0) {
        errMsg = '请输入微信号';
        break;
      };
      if (this.data.type === 2 && keys[i] === 'courses' && data[keys[i]].length === 0) {
        errMsg = '请选择报名的训练营';
        break;
      };
      if (data[keys[i]].length === 0) {
        errMsg = '请填写所有选项';
        break;
      }
    }
    if (errMsg.length > 0) {
      wx.showModal({
        title: '提示',
        content: errMsg,
      });
      return false;
    }
    return true;
  },

  bindFormSubmit: function (e) {
    if (!this.validate(e.detail.value))
      return;
    const { wid, nickName, group, gender, role, profession, region, age, courses, profile, reasons } = e.detail.value;
    if (this.data.firstSubmit) {
      this.createMember(wid, nickName, group, gender, role, profession, region, age, courses, profile, reasons);
    } else {
      this.updateMember(wid, nickName, group, gender, role, profession, region, age, profile, reasons);
    }
  },

  createMember: function (wid, nickName, group, gender, role, profession, region, age, courses, profile, reasons) {
    const db = wx.cloud.database();
    db.collection('members').add({
      data: {
        type: this.data.type,
        wid,
        nickName,
        group,
        gender,
        role,
        profession,
        region,
        age,
        courses,
        profile,
        reasons,
        createTime: db.serverDate(),
      },
      success: res => {
        wx.showToast({
          title: '提交成功',
          duration: 2000
        });
        wx.redirectTo({
          url: `../home/home?type=${this.data.type}`,
        })
      },
      fail: err => {
        wx.showToast({
          title: `提交失败`,
          duration: 2000
        })
      }
    })
  },

  updateMember: function (wid, nickName, group, gender, role, profession, region, age, profile, reasons) {
    const db = wx.cloud.database();
    db.collection('members').doc(this.data.docId).update({
      data: {
        wid, nickName, group, gender, role, profession, region, age, profile, reasons,
        updateTime: db.serverDate(),
      },
      success: res => {
        wx.showModal({
          title: '提示',
          content: '提交成功',
          showCancel: false,
        });
        wx.redirectTo({
          url: `../home/home?type=${this.data.type}`,
        })
      },
      fail: err => {
        wx.showModal({
          title: '提示',
          content: '提交失败，请联系管理员',
          showCancel: false,
        });
      }
    })
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  bindShowWid: function (e) {
    wx.previewImage({
      urls: ['cloud://wwcrm-lkmfq.7777-wwcrm-lkmfq-1301103298/wid.jpeg'], // 当前显示图片的http链接
    })
  }
})