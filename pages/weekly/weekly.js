import http from "../../utils/http-service.js"
Page({
  data: {
    currentTab: 0, //预设当前项的值
    weeklyList: [],
    weeklyData:{},
    toHomeBool: true,
    weeklyId:0,
    imgLoadBool: false
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    console.log(e.detail.current);
    this.setData({
      currentTab: e.detail.current,
      weeklyId: this.data.weeklyList[e.detail.current].id,
      weeklyData: {},
      imgLoadBool: false
    });
    this.checkCor();
    this.getWeekly()
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur,
      })
    }
  },
  loadImg: function(e){
    this.setData({
      imgLoadBool: true
    })
  },
  toHome: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  onShareAppMessage: function (res) {
    return {
      path: "pages/weekly/weekly",
      success: (res) => {}
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab >= 3) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  getWeeklyList: function(){
    let self = this;
    http.GET({
      params:{},
      url:"/api/weekly-category",
      success: (res)=>{
        //console.log(res);
        let arr = res.data.data.reverse();
        let weeklyId = parseInt(self.data.weeklyId);
        if (!weeklyId){
          self.setData({
            weeklyList: arr,
            weeklyId: arr[0].id
          })
        }else{
          let index = arr.findIndex((obj) => {
            return obj.id == self.data.weeklyId
          })
          if(index!=-1){
            self.setData({
              weeklyList: arr,
              currentTab: index
            })
          }
        }
        self.getWeekly()
      }
    })
  },
  getWeekly: function(){
    let self = this;
    let criteria = {
      categoryId: self.data.weeklyId
    }
    http.GET({
      params:{
        criteria: criteria
      },
      url:"/api/weekly",
      success: (res)=>{
        if (res.data.data){
          self.setData({
            weeklyData: res.data.data[0],
          })
        }
        console.log(self.data.weeklyData)
      }
    })
  },
  onLoad: function (options) {
    if (options.from == "index") {
      this.setData({
        toHomeBool: false,
        weeklyId: options.tab
      })
    }
    this.getWeeklyList()
  },
  onShow: function () {

  }
})