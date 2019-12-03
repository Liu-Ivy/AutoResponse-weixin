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
          xmlData += data.toString();
        })
        .on("end", () => {
          resolve(xmlData);
        });
    });
  },
  parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, { trim: true }, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject("parseXMLAsync方法出了問題: " + err);
        }
      });
    });
  },
  formatMessage(jsData) {
    let message = {};
    jsData = jsData.xml;
    if (typeof jsData === "object") {
      for (let key in jsData) {
        let value = jsData[key];
        if (Array.isArray(value) && value > 0) {
          message[key] = value[0];
        }
      }
    }
    return message;
  }
};
