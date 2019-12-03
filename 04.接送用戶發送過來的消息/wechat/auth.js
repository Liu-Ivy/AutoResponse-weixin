/* 驗證服務器有效性的模塊*/

const sha1 = require("sha1");
//insert config
const config = require("../config");
//insert tool
const {
  getUserDataAsync,
  parseXMLAsync,
  formatMessage
} = require("../utils/tool");

module.exports = () => {
  return async (req, res, next) => {
    //微信服務器提交的參數
    const { signature, echostr, timestamp, nonce } = req.query;
    const { token } = config;

    const sha1Str = sha1([timestamp, nonce, token].sort().join(""));

    /*
    微信服務器會發送兩種類型的消息給開發者服務器
    1.GET請求-驗證服務器的有效性
    2.POST請求-微信服務器會將用戶發送的數據以POST請求的方式轉發到開發者服務器上
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
      console.log("The req.query:", req.query);

      /*
      { signature: '31d26c9a38cada43b57ea37939a2d3a1db1be0c6',
      timestamp: '1574959760',
      nonce: '852656027',
      openid: 'oRCTp0hQ61FV_AE_XT-MLs21uCDo' }//用戶的微信id
      */

      //接收請求體中的數據,適合流式數據而非JSON,需定義特殊方法
      const xmlData = await getUserDataAsync(req);
      console.log("xmlData:", xmlData);
      /*
      <xml><ToUserName><![CDATA[gh_1dcd20e97049]]></ToUserName> 開發者ID
      <FromUserName><![CDATA[oRCTp0hQ61FV_AE_XT-MLs21uCDo]]></FromUserName> 用戶openid
      <CreateTime>1575023729</CreateTime>  發送的時間戳
      <MsgType><![CDATA[text]]></MsgType>  發送消息類型
      <Content><![CDATA[244]]></Content>   發送內容
      <MsgId>22548921314912241</MsgId>     消息id微信服務器會默認寶3天用戶發送的數據，通過此id三天內就能找到消息數據，三天後就被銷毀
      </xml>
      */
      //將xml數據解析為js對象
      const jsData = await parseXMLAsync(xmlData);
      console.log("jsData:", jsData);
      /*
      { xml:
        { ToUserName: [ 'gh_1dcd20e97049' ],
          FromUserName: [ 'oRCTp0hQ61FV_AE_XT-MLs21uCDo' ],
          CreateTime: [ '1575026270' ],
          MsgType: [ 'text' ],
          Content: [ '666' ],
          MsgId: [ '22548952177860548' ] } }
      */
      //格式化js數據方便以後使用
      const message = formatMessage(jsData); //是同步的方法，不用加await
      console.log("format-message:", message);

      //簡單的自動回覆文本內容
      /*
      一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”
        1、开发者在5秒内未回复任何内容 
        2、开发者回复了异常数据，比如JSON数据，字符串，xml數據中有多餘的空格....等
       */
      let content = "I don't understand";
      //判斷用戶發送的消息是否是文本消息
      if (message.MsgType === "text") {
        //判斷用戶發送的消息內容具體是什麼
        if (message.Content === "1") {
          content = "Great one!";
        } else if (message.Content === "2") {
          content = "Great two!";
        } else if (message.Content.match("a")) {
          content = "It has an A";
        }
      }
      console.log("Message", message.MsgType);
      //最終回覆用戶消息
      let replyMessage = `<xml><ToUserName><![CDATA[${
        message.FromUserName
      }]></ToUserName><FromUserName><![CDATA[${
        message.ToUserName
      }]]></FromUserName><CreateTime>${Date.now()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`;

      //返回響應給微信伺服器
      res.send(replyMessage);
      console.log("replyMessage", replyMessage);

      //如果開發者服務器沒有返回響應給微信服務器，微信服務器會發送三次請求
      //res.end(""); //停止發送三次請求
    } else {
      res.end("error");
    }
  };
};
