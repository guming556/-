import http from "../../utils/http-service.js"
Page({
  data: {
    daySignData:{},
    toHomeBool: true,
    loadImgBool: false
  },
  getDaySign: function(){
    let self = this;
    http.GET({
      params:{},
      url:"/api/introduce-page",
      success:(res)=>{
        console.log(res);
        self.setData({
          daySignData: res.data.data[0]
        })
        wx.setNavigationBarTitle({
          title: res.data.data[0].name
        })
      }
    })
  },
  loadImg: function(e){
    this.setData({
      loadImgBool: true
    })
  },
  toHome: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.daySignData.name,
      path: "pages/daySign/daySign",
      success: (res) => {}
    }
  },
  onLoad: function (options) {
    if (options.from == "index") {
      this.setData({
        toHomeBool: false
      })
    }
    this.getDaySign()
  }
})