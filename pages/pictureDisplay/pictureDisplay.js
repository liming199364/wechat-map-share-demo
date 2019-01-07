// pages/index/index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
// var config = require('../../config')
var util = require('../../utils/util.js')
var upFiles = require('../../utils/upFiles.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    upFilesBtn: true,
    upFilesProgress: false,
    maxUploadLen: 1,
    name: "",
    input: ""
  },
  onLoad: function(options) {
    this.data.name = options.name;
    console.log(options.name)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 预览图片
  previewImg: function(e) {
    let imgsrc = e.currentTarget.dataset.presrc;
    let _this = this;
    let arr = _this.data.upImgArr;
    let preArr = [];
    arr.map(function(v, i) {
      preArr.push(v.path)
    })
    //   console.log(preArr)
    wx.previewImage({
      current: imgsrc,
      urls: preArr
    })
  },
  // 删除上传图片 或者视频
  delFile: function(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '您确认删除嘛？',
      success: function(res) {
        if (res.confirm) {
          let delNum = e.currentTarget.dataset.index;
          let delType = e.currentTarget.dataset.type;
          let upImgArr = _this.data.upImgArr;
          let upVideoArr = _this.data.upVideoArr;
          if (delType == 'image') {
            upImgArr.splice(delNum, 1)
            _this.setData({
              upImgArr: upImgArr,
            })
          } else if (delType == 'video') {
            upVideoArr.splice(delNum, 1)
            _this.setData({
              upVideoArr: upVideoArr,
            })
          }
          let upFilesArr = upFiles.getPathArr(_this);
          if (upFilesArr.length < _this.data.maxUploadLen) {
            _this.setData({
              upFilesBtn: true,
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },
  // 选择图片或者视频
  uploadFiles: function(e) {
    var _this = this;
    wx.showActionSheet({
      itemList: ['选择图片'],
      success: function(res) {
        //   console.log(res.tapIndex)
        let xindex = res.tapIndex;
        if (xindex == 0) {
          upFiles.chooseImage(_this, _this.data.maxUploadLen)
        } else if (xindex == 1) {
          upFiles.chooseVideo(_this, _this.data.maxUploadLen)
        }

      },
      fail: function(res) {
        console.log(res.errMsg)
      }
    })
  },
  // 上传文件
  subFormData: function() {
    let _this = this;
    let upData = {};
    let upImgArr = _this.data.upImgArr;
    let upVideoArr = _this.data.upVideoArr;

    if (Object.prototype.toString.call(upImgArr) === '[object Undefined]' || upImgArr.length == 0) {
      wx.showToast({
        title: '您还没选择图片呢~',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return;
    }

    for (let pic of upImgArr) {
      wx.cloud.uploadFile({
        cloudPath: getFileName(pic.path), // 上传至云端的路径
        filePath: pic.path, // 小程序临时文件路径
        success: res => {
          // 返回文件 ID
          console.log(res.fileID)
          insertSQL(_this.data.name, res.fileID, this.data.input)
          wx.showToast({
            title: '上传成功',
            icon: 'none',
            duration: 1000,
            mask: true
          })
          wx.navigateBack({
            
          })
        },
        // fail: console.error
        fail: res => {
          wx.showToast({
            title: '上传失败',
            icon: 'none',
            duration: 1000,
            mask: true
          })
        }
      })
    }

    // for (let video of upVideoArr) {
    //   wx.cloud.uploadFile({
    //     cloudPath: getFileName(video.path), // 上传至云端的路径
    //     filePath: video.path, // 小程序临时文件路径
    //     success: res => {
    //       // 返回文件 ID
    //       console.log(res.fileID)
    //     },
    //     fail: console.error
    //   })
    // }
  },

  /**
   * 监听手机号输入
   */
  listenerInput: function(e) {
    this.data.input = e.detail.value;
  },

  // subFormData: function () {
  // let _this = this;
  // let upData = {};
  // let upImgArr = _this.data.upImgArr;
  // let upVideoArr = _this.data.upVideoArr;
  //   _this.setData({
  //     upFilesProgress: true,
  //   })
  //   upData['url'] = config.service.upFiles;
  //   upFiles.upFilesFun(_this, upData, function (res) {
  //     if (res.index < upImgArr.length) {
  //       upImgArr[res.index]['progress'] = res.progress

  //       _this.setData({
  //         upImgArr: upImgArr,
  //       })
  //     } else {
  //       let i = res.index - upImgArr.length;
  //       upVideoArr[i]['progress'] = res.progress
  //       _this.setData({
  //         upVideoArr: upVideoArr,
  //       })
  //     }
  //     //   console.log(res)
  //   }, function (arr) {
  //     // success
  //     console.log(arr)
  //   })
  // }

})

function insertSQL(district, path, info) {
  const db = wx.cloud.database()
  db.collection('districtInfo').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      name: district,
      info: info,
      due: new Date(),
      url: path
    },
    success: res => {
      // 在返回结果中会包含新创建的记录的 _id
      this.setData({
        counterId: res._id,
        count: 1
      })
      wx.showToast({
        title: '新增记录成功',
      })
      console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
    },
    fail: err => {
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', err)
    }
  })
}

function getFileName(path) {
  var pos1 = path.lastIndexOf('/');
  var pos2 = path.lastIndexOf('\\');
  var pos = Math.max(pos1, pos2)
  if (pos < 0)
    return path;
  else
    return path.substring(pos + 1);
}