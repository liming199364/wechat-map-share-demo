// map.js
let districtData = require('../../resources/district')
const app = getApp();
Page({
  data: {
    longi: '113.324520',
    lati: '23.099994',
    markers: [],
    coverImage: '../../resources/aim.svg',
    wxmap: {}
  },
  onLoad: function() {
    console.log('地图定位！')
    const _this = this;
    app.globalData.wxmap = wx.createMapContext("wxmap");
    _this.initialize();
    _this.wxmap = app.globalData.wxmap;
    this.setData({
      markers: this.getDistrictMarkers()
    })
  },
  resetCen(e) {
    console.log("in")
    this.wxmap.moveToLocation();
  },
  initialize: function() {
    wx.getLocation({
      success: (res) => {
        var coordinate = {
          longitude: res.longitude,
          latitude: res.latitude
        };
        this.setScreenCentre(coordinate);
        this.setCentre(coordinate);
      }
    });
  },
  setCentre: function(coordinate) {
    // this.setData({
    //   'markers[0].latitude': coordinate.latitude,
    //   'markers[0].longitude': coordinate.longitude
    // });
  },
  setScreenCentre: function(coordinate) {
    this.setData({
      longi: coordinate.longitude,
      lati: coordinate.latitude,
    });
  },
  regionchange(e) {
    // if (e.type == 'end') {
    //   this.wxmap.getCenterLocation({
    //     success: (res) => {
    //       this.setCentre({
    //         longitude: res.longitude,
    //         latitude: res.latitude
    //       });
    //     }
    //   });
    // }
  },
  markertap(e) {
    let name = this.data.markers[e.markerId].name;
    wx.navigateTo({
      url: '/pages/gallery/gallery?name=' + name
    })
  },
  getDistrictMarkers() {
    let markers = [];
    let index = 0;
    for (let item of districtData) {
      // for (let district of item.children) {
      let marker = this.createMarker(item, index)
      index++;
      markers.push(marker)
      // }
    }
    return markers;
  },
  createMarker(point, index) {
    var str = point.centerPoint.split(",")
    let latitude = str[1];
    let longitude = str[0];
    let marker = {
      iconPath: "/images/location.png",
      id: index,
      name: point.name || '',
      latitude: latitude,
      longitude: longitude,
      width: 40,
      height: 40
    };
    return marker;
  }
})