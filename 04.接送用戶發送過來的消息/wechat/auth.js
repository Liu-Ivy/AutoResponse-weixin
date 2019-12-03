/* 驗證服務器有效性的模塊*/

const sha1 = require("sha1");
const config = require("../config");
const {
  getUserDataAsync,
  parseXMLAsync,
  formatMessage
} = require("../utils/tool");

module.exports = () => {
  return async (req, res, next) => {
    const { signature, echostr, timestamp, nonce } = req.query;
    const { token } = config;

    const sha1Str = sha1([timestamp, nonce, token].sort().join(""));
    if (req.method === "GET") {
      if (sha1Str === signature) {
        res.send(echostr);
      } else {
        res.end("error");
      }
    } else if (req.method === "POST") {
      if (sha1Str !== signature) {
        res.end("error");
      }
      console.log("The req.query:", req.query);

      const xmlData = await getUserDataAsync(req);
      console.log("xmlData:", xmlData);
      據解析為js對象;
      const jsData = await parseXMLAsync(xmlData);
      console.log("jsData:", jsData);
      const message = formatMessage(jsData);
      console.log("format-message:", message);

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
      let replyMessage = `<xml><ToUserName><![CDATA[${
        message.FromUserName
      }]></ToUserName><FromUserName><![CDATA[${
        message.ToUserName
      }]]></FromUserName><CreateTime>${Date.now()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${content}]]></Content></xml>`;

      res.send(replyMessage);
      console.log("replyMessage", replyMessage);

      //res.end(""); //停止發送三次請求
    } else {
      res.end("error");
    }
  };
};
