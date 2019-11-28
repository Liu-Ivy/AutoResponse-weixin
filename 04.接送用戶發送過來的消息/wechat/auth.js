/* 驗證服務器有效性的模塊*/

const sha1 = require("sha1");
//insert config
const config = require("../config");

module.exports = () => {
  return (req, res, next) => {
    //微信服務器提交的參數
    const { signature, echostr, timestamp, nonce } = req.query;
    const { token } = config;

    const sha1Str = sha1([timestamp, nonce, token].sort().join(""));

    /*
    微信服務器會發送兩種類型的消息給開發者服務器
    1.GET請求
    -驗證服務器的有效性
    2.POST請求
    -微信服務器會將用戶發送的數據以POST請求的方式轉發到開發者服務器上
    */
    if (req.method === "GET") {
      if (sha1Str === signature) {
        res.send(echostr);
      } else {
        res.end("error");
      }
    } else if (req.method === "POST") {
      //微信服務器會將用戶發送的數據以POST請求的方式轉發到開發者服務器上
      //驗證消息來自於微信服務器
      if (sha1Str !== signature) {
        //說明消息不是微信服務器
        res.end("error");
      }
      console.log(req.query);

      /*
      { signature: '31d26c9a38cada43b57ea37939a2d3a1db1be0c6',
        timestamp: '1574959760',
        nonce: '852656027',
        openid: 'oRCTp0hQ61FV_AE_XT-MLs21uCDo' }//用戶的微信id
      */
    } else {
      res.end("error");
    }
  };
};
