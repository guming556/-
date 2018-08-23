var token;
var httpConfig = {
  baseUrl: "https://ma.caixukunkun.club",
  header: {
    AppId: "star"
  },
  requestUrl: "https://ma.caixukunkun.club/star"
}

var requestHandler = {
  params: {},
  url: "",
  success: function (res) {
    // success
  },
  fail: function () {
    // fail
  },
}

//GET请求
function GET(requestHandler) {
  request('GET', requestHandler)
}
//POST请求
function POST(requestHandler) {
  request('POST', requestHandler)
}
//DELETE请求
function DELETE(requestHandler) {
  request('DELETE', requestHandler)
}
//PUT请求
function PUT(requestHandler) {
  request('PUT', requestHandler)
}

function request(method, requestHandler) {
    var user = wx.getStorageSync('user');
    if (user && user.token) {
      token = user.token;
    } else {
      token = ""
    }
    httpConfig.header.Authorization = token;
    wx.request({
      url: httpConfig.baseUrl + "/" + httpConfig.header.AppId + requestHandler.url,
      data: requestHandler.params,
      method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: httpConfig.header,
      success: function (res) {
        requestHandler.success(res)
      },
      fail: function () {
        requestHandler.fail()
      },
      complete: function (res) {
      }
    })
}

module.exports = {
  GET: GET,
  POST: POST,
  DELETE: DELETE,
  PUT: PUT,
  httpConfig: httpConfig
}