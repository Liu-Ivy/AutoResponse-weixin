//insert express
const express = require("express");
const sha1 = require("sha1");
//app apply
const app = express();
//驗證服務器的有效性
/*
1.微信服務器知道開發者服務器是哪個
  -測試管理頁面上寫url開發者服務器地址
    -使用ngrok內網穿透 將本地端口號開啟的服務映射外網跨域訪問一個網址
    -ngrok http 3000
  -填寫token
    -參與微信簽名加密的一個參數
2.開發者服務器 - 驗證消息是否來自於微信服務器
  目的：機算出signature微信加密簽名，和微信傳遞過來的signature進行對比，如果一樣，說明是來自微信服務器。若不同則不是來自於微信服務器
  1.將參與微信加密的三個參數（timestamp,nonce,token)按照字典續排序並組合在一起形成一個組數
  2.將數組裡所有參數拼接成一個字符串，進行sha1加密
  3.加密完成就成了一個signature和微信發送過來的進行比對
    如果一樣，說明消息來自於微信服務器，返回echostr給微信服務器
    如果不一樣，說明消息不是來自於微信服務器，返回error
 */
//定義配置對象
const config = {
  token: "lumisa145",
  appID: "wx20991e4c042c3882",
  appsecret: "ed7cae4149aea58c7ee6aec9ce9de031"
};

//接受處理所有消息
app.use((req, res, next) => {
  //微信服務器提交的參數
  // console.log(req.query);
  /*
  { signature: '6fb1ee289753c718c1d0c126aec003c979d22a8e', //微信的加密簽名
  echostr: '715297702060996318',//微信的隨機字串符號
  timestamp: '1574872264',//微信的發送請求時間戳
  nonce: '1370387758' } //微信的隨機數字
  */
  const { signature, echostr, timestamp, nonce } = req.query;
  const { token } = config;

  //1.將參與微信加密的三個參數（timestamp,nonce,token)按照字典續排序並組合在一起形成一個組數
  const arr = [timestamp, nonce, token];
  const arrSort = arr.sort();
  console.log(arrSort);
  //2.將數組裡所有參數拼接成一個字符串，進行sha1加密
  const str = arr.join("");
  console.log(str);
  const sha1Str = sha1(str);
  console.log(sha1Str);
  //3.加密完成就成了一個signature和微信發送過來的進行比對
  if (sha1Str === signature) {
    res.send(echostr);
  } else {
    res.end("error");
  }
});
//監聽端口號
app.listen(3000, () => console.log("服務器連接成功"));
