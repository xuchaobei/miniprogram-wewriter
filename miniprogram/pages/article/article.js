// pages/article/article.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    docId: null,
    id: null,
    title: '',
    platform: '',
    link: '',
    date: '',
    fee: '',
    articles: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options && options.id) {
      const db = wx.cloud.database()
      db.collection('members').field({
        _id: true,
        articles: true,
      }).get().then(res => {
        const {
          _id,
          articles
        } = res.data[0];
        const curArticle = articles.filter((item) => {
          return item.id === options.id
        })[0];
        this.setData({
          docId: _id,
          id: articles.id,
          title: curArticle.title || '',
          platform: curArticle.platform || '',
          link: curArticle.link || '',
          date: curArticle.date || '',
          fee: curArticle.fee || '',
          articles: articles,
        })
      })
    } else if (options && options.docId) {
      this.setData({
        docId: options.docId,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '系统出错，请重启小程序尝试',
        showCancel: false,
      });
    }
  },

  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },

  validate: function(data) {
    const keys = Object.keys(data);
    let errMsg = '';
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'title' && data[keys[i]].length === 0) {
        errMsg = '请填写文章标题';
        break;
      };
      if (keys[i] === 'platform' && data[keys[i]].length === 0) {
        errMsg = '请填写上稿平台';
        break;
      };
      if (keys[i] === 'date' && data[keys[i]].length === 0) {
        errMsg = '请选择上稿时间';
        break;
      };
    }
    if (errMsg.length > 0) {
      wx.showModal({
        title: '提示',
        content: errMsg,
        showCancel: false,
      });
      return false;
    }
    return true;
  },

  bindFormSubmit: function(e) {
    if (!this.validate(e.detail.value))
      return;
    const {
      title,
      platform,
      date,
      link,
      fee
    } = e.detail.value;
    this.saveArticle(title, platform, date, link, fee);
  },


  saveArticle: function(title, platform, date, link, fee) {
    const db = wx.cloud.database();
    const _ = db.command;

    if (this.data.id) {
      db.collection('members').doc(this.data.docId).update({
        data: {
          articles: _.pull({
            id: this.data.id
          })
        }
      });
    }

    const article = {
      id: Date.now(),
      title,
      platform,
      date,
      link,
      fee
    }
    
    db.collection('members').doc(this.data.docId).update({
      data: {
        articles: _.push({
          each: [article],
          sort: {
            date: -1
          },
        }),
        updateTime: db.serverDate(),
      },
      success: res => {
        wx.showModal({
          title: '提示',
          content: '保存成功',
          showCancel: false,
          success() {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      },
      fail: err => {
        wx.showModal({
          title: '提示',
          content: '保存失败，请联系管理员',
          showCancel: false,
        });
      }
    })
  }

})