/* 驗證服務器有效性的模塊*/

const sha1 = require("sha1");
const config = require("../config");
const {
  getUserDataAsync,
  parseXMLAsync,
  formatMessage
} = require("../utils/tool");
const template = require("./template");
const reply = require("./reply");

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
      // 據解析為js對象;
      const jsData = await parseXMLAsync(xmlData);
      const message = formatMessage(jsData);
      const options = reply(message);

      const replyMessage = template(options);
      console.log(replyMessage);
      res.send(replyMessage);

      //res.end(""); //停止發送三次請求
    } else {
      res.end("error");
    }
  };
};
