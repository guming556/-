var http = require("../../utils/http-service.js")
var util = require('../../utils/util.js');
Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    imgCurrentTab: 0,
    scrollLeft: 0, //tab标题的滚动条位置
    tabList: [],
    list: [],
    imgLoadList:[],
    leftHeight: 0,
    rightHeight: 0,
    length: 10,
    pageNo: 1,
    descHeight: 0, //图片文字描述的高度
    pageStatus: true,
    leftImgList:[],
    rightImgList:[],
    leftImgLoadNum:8,
    rightImgLoadNum:8,
    leftImgH: 0,
    rightImgH: 0,
    sharedBool: false,
    toHomeBool: true,
    imgCurrent: "",
    imgLast:"",
    imgDetailBool: false,
    atlasId: 0,
    pageNum: 1,
    total: 0,
    pageCount:0,
    atlasLoadBool: false,
    atlasNextBool: false,
    noMoreInfoBool: false,
    imgDetailInfo:{},
    loadedNum: 0,
    loadImgNum:0
  },
  toHome: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  onShareAppMessage: function(res){
    wx.showShareMenu({
      withShareTicket: true
    })
    let self = this;
    return {
      title: "KUN图集",
      path: "pages/atlas/atlas",
      success: (res)=>{
        //console.log(res);
        if(self.data.sharedBool||self.data.currentTab==0){
        }else{
          if (res.shareTickets.length != 0) {
            wx.setStorageSync("sharedStorage", true);
            self.setData({
              sharedBool: true
            })
            self.getImgList()
          } else {
            wx.showToast({
              title: '请分享到群！',
              icon: "none",
              duration: 2000
            })
          }
        }
      }
    }
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current,
      atlasId: this.data.tabList[e.detail.current].id,
      leftImgList: [],
      rightImgList: [],
      leftImgH: 0,
      rightImgH: 0,
      imgLoadList: [],
      pageNum:1,
      list: [],
      atlasLoadBool: false,
      noMoreInfoBool: false,
      loadedNum: 0,
      leftImgLoadNum: 8,
      rightImgLoadNum: 8
    });
    this.checkCor();
    this.getImgList()
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur,
        loadedNum: 0
      })
    }
  },
  //切换详情图
  switchImgTab: function(e){
    let self = this;
    let listIdx = this.data.list.findIndex((obj) => {
      return obj.id == self.data.imgLoadList[e.detail.current].id
    })
    this.data.list[listIdx].newMark = false;
    this.setData({
      list: this.data.list
    })
    let newImgStorage = wx.getStorageSync("newImg");
    let idx = newImgStorage.newImgLooked.findIndex((id) => {
      return id == self.data.imgLoadList[e.detail.current].id
    })
    if (idx == -1) {
      newImgStorage.newImgLooked.push(self.data.imgLoadList[e.detail.current].id);
      wx.setStorageSync("newImg", newImgStorage);
    }
    this.setData({
      imgCurrentTab: e.detail.current
    })
  },
  imgDetail: function (e) {
    let self = this;
    let newImgStorage = wx.getStorageSync("newImg");
    let idx = newImgStorage.newImgLooked.findIndex((id) => {
      return id == e.currentTarget.dataset.id
    })
    if(idx==-1){
      newImgStorage.newImgLooked.push(e.currentTarget.dataset.id);
      wx.setStorageSync("newImg", newImgStorage);
    }
    let listIdx = this.data.leftImgList.findIndex((obj) => {
      return obj.id == e.currentTarget.dataset.id
    })
    if(listIdx==-1){
      let listIdx = this.data.rightImgList.findIndex((obj) => {
        return obj.id == e.currentTarget.dataset.id
      })
      this.data.rightImgList[listIdx].newMark = false;
      this.setData({
        rightImgList: self.data.rightImgList
      })
    }else{
      this.data.leftImgList[listIdx].newMark = false;
      this.setData({
        leftImgList: self.data.leftImgList
      })
    }
    http.GET({
      url:"/api/get-picture-all/"+self.data.atlasId,
      success: (res)=>{
        wx.previewImage({
          current: e.currentTarget.dataset.url,
          urls: res.data.data
        })
      }
    })
  },
  //获取tab栏列表
  getTabList: function(){
    let self = this;
    http.GET({
      url:"/api/album-page",
      success: (res)=>{
        self.setData({
          tabList: res.data.data
        });
        let atlasId = parseInt(self.data.atlasId);
        if (!atlasId) {
          self.setData({
            tabList: res.data.data,
            atlasId: res.data.data[0].id
          })
          this.getImgList()
        } else {
          let index = res.data.data.findIndex((obj) => {
            return obj.id == self.data.atlasId
          })
          if(index!=-1){
            self.setData({
              tabList: res.data.data,
              currentTab: index
            })
          }
          this.getImgList()
        }
      }
    })
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
  //获取当前tab图片列表
  getImgList: function(){
    let self = this;
    let sharedStorage = wx.getStorageSync("sharedStorage");
    if (self.data.atlasId != self.data.tabList[0].id && !sharedStorage){
      return
    }
    let criteria = {
      albumId: self.data.atlasId
    };
    http.GET({
      params:{
        criteria: criteria,
        pageNum: self.data.pageNum,
        pageSize: 16
      },
      url: "/api/picture-page",
      success:(res)=>{
        let imgList;
        if (res.data.data.length != 0) {
          let newImgStorage = wx.getStorageSync("newImg");
          for (let i = 0; i < res.data.data.length; i++) {
            let time = util.formatTime(new Date(res.data.data[i].createTime));
            if (time == self.data.time) {
              let idx = newImgStorage.newImgLooked.findIndex((id) => {
                return id == res.data.data[i].id
              })
              if (idx == -1) {
                res.data.data[i].newMark = true
              } else {
                res.data.data[i].newMark = false
              }
            } else {
              res.data.data[i].newMark = false
            }
          }
          if (self.data.pageNum > 1) {
            imgList = self.data.list.concat(res.data.data)
          } else {
            imgList = res.data.data
          }

          if (self.data.pageNum==1){
            self.setData({
              atlasLoadBool: true
            })
          }
        } 
        self.typeImage(res.data.data);
        self.setData({
          list: imgList,
          total: res.data.pageParams.total,
          pageCount: Math.ceil(res.data.pageParams.total / res.data.pageParams.pageSize),
          //atlasNextBool: false
        })
      }
    })
  },
  getNextPage: function () {
    this.data.pageNum++;
    if (this.data.pageNum <= this.data.pageCount) {
      this.setData({
        pageNum: this.data.pageNum,
        atlasNextBool: true
      })
      this.getImgList()
    }else {
      this.setData({
        atlasNextBool: false,
        noMoreInfoBool: true
      })
    }
  },
  typeImage: function(imgArr){
    for (let i = 0; i < imgArr.length; i++) {
      if (i%2==0) {
        this.data.leftImgList.push(imgArr[i])
      } else {
        this.data.rightImgList.push(imgArr[i])
      }
      this.setData({
        leftImgList: this.data.leftImgList,
        rightImgList: this.data.rightImgList
      })
    }
  },
  waterImage: function (imgArr) {
    let waterImgArr;
    let self = this;
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    for(let i = 0;i<imgArr.length;i++){
      let detail;
      wx.getImageInfo({
        src: imgArr[i].imageUrl,
        success:(res)=>{
          let height = (windowWidth / 2 - 10) / res.width * res.height;
          if (this.data.leftImgH <= this.data.rightImgH) {
            this.data.leftImgH = this.data.leftImgH + height;
            this.data.leftImgList.push(imgArr[i])
          } else {
            this.data.rightImgH = this.data.rightImgH + height;
            this.data.rightImgList.push(imgArr[i])
          }
          this.setData({
            leftImgH: this.data.leftImgH,
            rightImgH: this.data.rightImgH,
            leftImgList: this.data.leftImgList,
            rightImgList: this.data.rightImgList
          })
        }
      })
    }
  },
  loadImage: function(e){
    let windowWidth = wx.getSystemInfoSync().windowWidth;
    let height = (windowWidth / 2 - 2) / e.detail.width * e.detail.height;
    let index = this.data.leftImgList.findIndex((obj)=>{
      return obj.id == e.currentTarget.dataset.id
    })
    if(index==-1){
      let index = this.data.rightImgList.findIndex((obj) => {
        return obj.id == e.currentTarget.dataset.id
      })
      this.data.rightImgList[index].height = height;
    }else{
      this.data.leftImgList[index].height = height;
    }
    this.setData({
      leftImgLis: this.data.leftImgList,
      rightImgList: this.data.rightImgList
    })
    if(e.detail){
      this.setData({
        loadedNum: this.data.loadedNum+1
      })
    }
    if(this.data.loadedNum==this.data.list.length){
      this.setData({
        atlasLoadBool: false,
        atlasNextBool: false
      })
    }
  },
  closeImgDetail: function(){
    this.setData({
      imgDetailBool: false
    })
  },
  openImgDetail: function(){
    this.setData({
      imgDetailBool: true
    })
  },
  onLoad: function (options) {
    var time = util.formatTime(new Date());
    this.setData({
      time: time,
      loadedNum: 0
    })
    let newImgStorage = wx.getStorageSync("newImg");
    if(newImgStorage){
      if(newImgStorage.time != time){
        wx.removeStorageSync("newImg");
        let obj = {
          time: time,
          newImgLooked: []
        }
        wx.setStorageSync('newImg', obj);
      }
    }else{
      let obj = {
        time: time,
        newImgLooked: []
      }
      wx.setStorageSync('newImg', obj);
    }
    if (options.from == "index") {
      this.setData({
        toHomeBool: false,
        atlasId: options.tab
      })
    }
    this.getTabList();
    var that = this;
    //  高度自适应
    wx.getSystemInfo({ 
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        that.setData({
          winHeight: calc
        });
      }
    });
  },
  onShow: function(){
    let sharedStorage = wx.getStorageSync("sharedStorage");
    if (sharedStorage) {
      this.setData({
        sharedBool: true
      })
    }
  },
  previewImg: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    var imgArr = [];
    for (let i = 0, l = list.length; i < l; i++) {
      imgArr.push(list[i].url);
    }
    wx.previewImage({
      current: imgArr[index],     //当前图片地址
      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { }
    })
  }
})