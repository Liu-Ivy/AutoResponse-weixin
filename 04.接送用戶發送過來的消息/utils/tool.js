/*
工具函數包
 */
//引入xml2js,將xml數據轉化成js對象 -- xml to js
const { parseString } = require("xml2js");

module.exports = {
  getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
      let xmlData = "";
      req
        .on("data", data => {
          //當流逝數據傳遞過來時，會觸發當前事件，會將數據注入到回調函數中
          //讀取的數據是buffer,需要將其轉化成字符串
          xmlData += data.toString();
        })
        .on("end", () => {
          //當數據接受完畢時，會觸發當前
          resolve(xmlData);
        });
    });
  },
  parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      // trim -- 去除前後空格; data -- 解析後的data
      parseString(xmlData, { trim: true }, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject("parseXMLAsync方法出了問題: " + err);
        }
      });
    });
  }
};
