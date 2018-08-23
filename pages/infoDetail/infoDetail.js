var WxParse = require('../../utils/wxParse/wxParse.js');
import http from "../../utils/http-service.js"
Page({
  data: {
    id: "",
    infoDetail: {
      icon: "../../images/test/icon01.png",
      origin: "来自微博@蔡徐坤姐姐团_Kunsland",
      color: "#e9b54e",
      text: "180609-180616 第二期 KUN周刊",
      content: "",
      description: "作者：柚子\n链接：https://www.zhihu.com/question/answer/420331542 \n来源：知乎",
      media: [
        { imageUrl: "../../images/test/infoflow01.png", type: "img" }
      ]
    },
    previewBool: false,
    toHomeBool: true
  },
  getInfoDetail:function(){
    let self = this;
    //console.log(self.data.id);
    this.setData({
      previewBool: true
    })
    http.GET({
      params:{},
      url:"/api/article/"+self.data.id,
      success: (res)=>{
        //console.log(res)
        var article = res.data.data.correctContent;
        var that = this;
        WxParse.wxParse('content', 'html', article, that, 0);
        console.log(this.data.content);
        this.data.content.nodes.unshift();
        self.setData({
          infoDetail: res.data.data,
          previewBool: false,
          content: this.data.content
        })
      }
    })
  },
  toHome: function () {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  onShareAppMessage: function (res) {
    let self = this;
    return {
      title: "KUN周刊",
      path: "pages/infoDetail/infoDetail?id="+self.data.id,
      success: (res) => { 

      }
    }
  },
  onLoad: function (options) {
    if (options.from == "index") {
      this.setData({
        toHomeBool: false,
      })
    }
    if(options.share){
      this.setData({
        id: options.share
      })
    }
    this.setData({
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: "TA说"
    })
  },
  onShow: function () {
    this.getInfoDetail();
  }
})