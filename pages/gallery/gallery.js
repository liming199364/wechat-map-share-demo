let page = 0;
Page({
  data: {
    images: [], //瀑布流图片
    Arr1: [], //左列
    Arr2: [], //右列
    picture: "",
    name: "",
    show: false
  },
  //页面加载执行
  onLoad: function(options) {
    console.log(options.name)
    this.data.name = options.name;
    let This = this;
    // This.getFromMongoFirst();
  },
  onShow: function() {
    console.log("hello")
    this.refresh();
  },
  onHide: function() {
    console.log("下拉");
    page = 0;
    this.data.Arr1 = [];
    this.data.Arr2 = [];
  },
  /**
   * 上拉加载
   * */
  lower: function(e) {
    console.log("上拉");
    wx.showToast({
      title: '刷新中~',
      icon: 'loading',
      duration: 5000,
      mask: true
    })
    this.getFromMongo();
  },
  refresh: function(e) {
    console.log("下拉");
    wx.showToast({
      title: '刷新中~',
      icon: 'loading',
      duration: 5000,
      mask: true
    })
    page = 0;
    this.data.Arr1 = [];
    this.data.Arr2 = [];
    this.getFromMongoFirst();
  },
  /**
   * 页面隐藏事件
   * */
  onUnload: function() {},
  /**
   * 页面上拉触底事件的处理函数
   * */
  onReachBottom: function() {
    // onReachBottom: 上拉触底
    // 监听用户上拉触底事件。
    // 可以在app.json的window选项中或页面配置中设置触发距离onReachBottomDistance。
    // 在触发距离内滑动期间，本事件只会被触发一次。
  },
  subFormData: function() {
    wx.navigateTo({
      url: '/pages/pictureDisplay/pictureDisplay?name=' + this.data.name
    })
  },

  getFromMongo: function() {
    /**
     * 原理相同
     * 这儿的数组也是获取已有的数组进行push增加
     **/

    const db = wx.cloud.database()
    db.collection('districtInfo')
      .where({
        name: this.data.name, // 填入当前用户 openid
      })
      .skip(page * 10) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(10) // 限制返回数量为 10 条
      .orderBy("due", "desc")
      .get()
      .then(res => {
        var images = [];
        console.log(res.data)
        if (res.data === undefined || res.data.length == 0 || page == 0) {
          wx.hideToast();
          wx.showToast({
            icon: 'none',
            title: '没有数据，快去上传吧'
          })
          return;
        }
        // data建立数组col1 和 col2
        let {
          Arr1,
          Arr2
        } = this.data
        if (res.data) { //这是后台取出的数据，数组
          for (let i = 0; i < res.data.length; i++) { //在这里获取后台的数组
            if (i % 2 == 0) { //这里进行获取的 奇数偶数来进行数据分开
              Arr1.push(res.data[i]); //数组添加数据
            } else {
              Arr2.push(res.data[i]); //数组添加数据
            }
          }
          this.setData({
            Arr1, //这里在进行数据赋值
            Arr2 //这里在进行数据赋值
          });
          page++;
        }
        wx.hideToast();
      })
      .catch(err => {
        console.error(err)
      })
  },

  //关闭规则提示
  hideRule: function () {
    this.setData({
      show: false
    })
  },
  tapPicture: function(e){
    this.data.picture = e.currentTarget.dataset.path;
    this.setData({
      show: true
    })
  },

  getFromMongoFirst: function() {
    /**
     * 原理相同
     * 这儿的数组也是获取已有的数组进行push增加
     **/

    const db = wx.cloud.database()
    db.collection('districtInfo')
      .where({
        name: this.data.name, // 填入当前用户 openid
      })
      .limit(10) // 限制返回数量为 10 条
      .orderBy("due", "desc")
      .get()
      .then(res => {
        var images = [];
        console.log(res.data)
        if (res.data === undefined || res.data.length == 0) {
          wx.hideToast();
          wx.showToast({
            icon: 'none',
            title: '没有数据，快去上传吧'
          })
          return;
        }
        // data建立数组col1 和 col2
        let {
          Arr1,
          Arr2
        } = this.data
        if (res.data) { //这是后台取出的数据，数组
          for (let i = 0; i < res.data.length; i++) { //在这里获取后台的数组
            if (i % 2 == 0) { //这里进行获取的 奇数偶数来进行数据分开
              Arr1.push(res.data[i]); //数组添加数据
            } else {
              Arr2.push(res.data[i]); //数组添加数据
            }
          }
          this.setData({
            Arr1, //这里在进行数据赋值
            Arr2 //这里在进行数据赋值
          });
          page = 1;
          wx.hideToast()
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
});