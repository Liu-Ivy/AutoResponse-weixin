/* 驗證服務器有效性的模塊*/

const sha1 = require("sha1");
//insert config
const config = require("../config");

module.exports = () => {
  return (req, res, next) => {
    const { signature, echostr, timestamp, nonce } = req.query;
    const { token } = config;
    const arr = [timestamp, nonce, token];
    const arrSort = arr.sort();
    console.log(arrSort);
    const str = arr.join("");
    console.log(str);
    const sha1Str = sha1(str);
    console.log(sha1Str);
    if (sha1Str === signature) {
      res.send(echostr);
    } else {
      res.end("error");
    }
  };
};
