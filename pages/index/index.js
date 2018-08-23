import http from "../../utils/http-service.js"
var WxParse = require('../../utils/wxParse/wxParse.js');
Page({
  data: {
    imgUrls: [
      '../../images/slider.png',
      '../../images/slider.png',
      '../../images/slider.png'
    ],
    bannerImg:"",
    swiperImgList:["","",""],
    interval: 4000,
    swiperIndex: 1,
    indicatorColor: "#e3e3e3",
    indicatorActiveColor:"#f6dfa6",
    qrcodeBool: false,
    qrcodeImgUrl: "",
    qrcodeTipBool: false,
    qrcodeSaveBool:true,
    infoLoadBool:false,
    pageNum: 1,
    infoList: [],
    total:0,
    pageCount:0,
    noMoreInfoBool: false,
    pageSize: 6,
    weeklyTop:null,
    settingButtonBool: false
  },
  //底图数据获取
  getBannerImg(){
    let self = this;
    http.GET({
      params:{},
      url:"/api/cover-picture-page",
      success: (res)=>{
        //console.log(res)
        self.setData({
          bannerImg: res.data.data[0].imageUrl
        })
      }
    })
  },
  getSwiperImg(){
    let self = this;
    http.GET({
      params:{},
      url:"/api/carousel-picture-page",
      success:(res)=>{
        self.setData({
          swiperImgList: res.data.data
        })
      }
    })
  },
  //获取二维码链接
  getQrcodeImg(){
    let self = this;
    http.GET({
      params:{},
      url:"/api/crowd-page",
      success:(res)=>{
        //console.log(res);
        self.setData({
          qrcodeImgUrl: res.data.data[0].codeImageUrl   
        })
      }
    })
  },
  //获取信息流
  getInfoList(){
    let self = this;
    this.setData({
      infoLoadBool: true
    })
    http.GET({
      params: {
        pageNum: self.data.pageNum,
        pageSize: self.data.pageSize
      },
      url: "/api/article-page",
      success: (res)=>{
        for(let i=0;i<res.data.data.length;i++){
          res.data.data[i].videoTrue = false
        }
        let infoList;
        if(self.data.pageNum>1){
          infoList = self.data.infoList.concat(res.data.data)
        }else{
          infoList = res.data.data
        }
        if(res.data.data.length<self.data.pageSize){
          self.setData({
            noMoreInfoBool: true
          })
        }
        self.setData({
          infoList: infoList,
          infoLoadBool: false,
          total: res.data.pageParams.total,
          pageCount: Math.ceil(res.data.pageParams.total / res.data.pageParams.pageSize)
        })
      }
    })
  },
  //获取周刊
  getWeeklyTop: function () {
    let self = this;
    http.GET({
      url: "/api/weekly-top",
      success: (res) => {
        self.setData({
          weeklyTop: res.data.data
        })
        //console.log(self.data.weeklyTop);
      }
    })
  },
  toWeeklyDetail: function(e){
    wx.navigateTo({
      url: '../weekly/weekly?from=index&&tab=' + e.currentTarget.dataset.id
    })
  },
  //上拉加载
  onReachBottom: function(){
    this.data.pageNum++;
    if(this.data.pageNum<=this.data.pageCount){
      this.setData({
        pageNum: this.data.pageNum
      })
      this.getInfoList()
    }else{
      this.setData({
        noMoreInfoBool: true
      })
    }
  },
  //打开保存二维码
  showQrcode(){
    this.setData({
      qrcodeBool: !this.data.qrcodeBool,
      qrcodeImgUrl: ""
    })
    if (this.data.qrcodeBool) {
      this.getQrcodeImg()
    }
  },
  openQrcode(){
    this.setData({
      qrcodeBool: true
    })
  },
  saveQrcodeImg(){
    let self = this;
    self.setData({
      settingButtonBool: false
    })
    wx.downloadFile({
      url: self.data.qrcodeImgUrl,
      success: (res) => {
        //console.log(res);
        if (res.tempFilePath) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              //console.log(res);
              if (res.errMsg == "saveImageToPhotosAlbum:ok") {
                self.setData({
                  qrcodeTipBool: true,
                  qrcodeSaveBool: true,
                  qrcodeBool: false
                });
                let timer = setTimeout(() => {
                  self.setData({
                    qrcodeTipBool: false
                  });
                  clearTimeout("timer")
                }, 1000)
              }
            },
            fail(err) {
              self.setData({
                qrcodeTipBool: true,
                qrcodeSaveBool: false,
                qrcodeBool: false
              })
              let timer = setTimeout(() => {
                self.setData({
                  qrcodeTipBool: false
                });
                clearTimeout("timer")
              }, 1000)
            }
          })
        }
      }
    })
  },
  //保存二维码
  saveQrcodeImgSetting(){
    let self = this;
    wx.getSetting({
      success: (res)=>{
        //console.log(res)
        if (res.authSetting.hasOwnProperty("scope.writePhotosAlbum")){
          if (res.authSetting["scope.writePhotosAlbum"]) {
            self.saveQrcodeImg()
          } else {
            self.setData({
              settingButtonBool: true
            })
            wx.showToast({
              title: '您未授权，请再次点击按钮重新授权。',
              icon: "none",
              duration: 2000
            })
          }
        }else{
          self.saveQrcodeImg()
        }
      }
    })
  },
  swiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },
  toCategory(e) {
    let index = e.currentTarget.dataset.index;
    //console.log(index);
    //console.log(this.data.swiperImgList[index]);
    if (this.data.swiperImgList[index].type == "introduce") {
      wx.navigateTo({
        url: '../daySign/daySign?from=index&&mark=aa'
      })
    } else if (this.data.swiperImgList[index].type == "weekly") {
      let weeklyId;
      if (this.data.swiperImgList[index].weeklyId){
        weeklyId = this.data.swiperImgList[index].weeklyId
      }else{
        weeklyId = 0
      }
      wx.navigateTo({
        url: '../weekly/weekly?from=index&&tab=' + weeklyId
      })
    } else if (this.data.swiperImgList[index].type == "album"){
      let albumId;
      if (this.data.swiperImgList[index].albumId) {
        albumId = this.data.swiperImgList[index].albumId
      } else {
        albumId = 0
      }
      wx.navigateTo({
        url: '../atlas/atlas?from=index&&tab=' + albumId
      })
    }
  },
  toInfoDetail: function(e){
    wx.navigateTo({
      url: '../infoDetail/infoDetail?id='+e.currentTarget.dataset.id+'&&from=index',
    })
  },
  //预览图片
  imgPreview: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.infoList[e.currentTarget.dataset.index].imageUrlList
    })
  },
  //开始播放视频，替换图片
  palyVideo: function(e){
    for(let i = 0;i < this.data.infoList.length;i++){
      this.data.infoList[i].videoTrue = false;
    }
    this.data.infoList[e.currentTarget.dataset.idx].videoTrue = true;
    this.setData({
      infoList: this.data.infoList
    })
  },
  onLoad: function () {
    this.getBannerImg();
    this.getSwiperImg();
    this.getInfoList();
    this.getWeeklyTop();
  },
  onShow: function () {
    this.setData({
      settingButtonBool: false
    })
  },
  onPullDownRefresh: function(){
    let self = this;
    this.setData({
      infoLoadBool: true,
      infoList: [],
      pageNum: 1
    })
    http.GET({
      url: "/api/weekly-top",
      success: (res) => {
        self.setData({
          weeklyTop: res.data.data
        })
        http.GET({
          params: {
            pageNum: 1,
            pageSize: self.data.pageSize
          },
          url: "/api/article-page",
          success: (res) => {
            if (res.data.data.length < self.data.pageSize) {
              self.setData({
                noMoreInfoBool: true
              })
            }
            self.setData({
              infoList: res.data.data,
              infoLoadBool: false,
              total: res.data.pageParams.total,
              pageCount: Math.ceil(res.data.pageParams.total / res.data.pageParams.pageSize)
            })
            wx.stopPullDownRefresh()
          }
        })
      }
    })
  }
})