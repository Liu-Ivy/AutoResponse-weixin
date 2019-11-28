/*
獲取access_token
What is?是微信調用接口的全局唯一憑據

特點：
1.唯一的  2.有效期為2小時,提前5分鐘請求again  3.接口權限 每天最多2000次
請求地址:https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
請求方式：GET

設計思路,
1.首次本地沒有，發送請求獲取access_token. 保存下來（本地文件）
2.after 
-先去本地讀取文件，判斷他是否過期
  -過期了：重新請求獲取access_token. 保存下來覆蓋之前的文件（保証文件是唯一的）
  -沒過期：直接使用

整理思路,
讀取本地文件(readAccessToken)
  -本地有文件  
    判斷他是否過期(isValidAccessToken)
    -過期了：重新請求獲取access_token(getAccessToken). 保存下來覆蓋之前的文件（保証文件是唯一的）(saveAccessToken)
    -沒過期：直接使用
  -本地沒有文件
    -發送請求獲取access_token(getAccessToken). 保存下來（本地文件(saveAccessToken)）,直接使用
 */

//只需要引入request-promise-native
const rp = require("request-promise-native");
//引入fs模塊
const { writeFile, readFile } = require("fs");
//引入config文件
const { appID, appsecret } = require("../config");

//定義類，獲取access_token
class Wechat {
  constructor() {}
  /**
   * 用來獲取access_token
   */
  getAccessToken() {
    //定義請求的地址
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    //發送請求
    /*
    request
    request-promise-native 返回值是一個promise對象
    */
    return new Promise((resolve, reject) => {
      rp({ method: "GET", url: url, json: true })
        .then(res => {
          console.log(res);
          /*
         { access_token:
         '27_cIz0jEnmODAiN-ntVVfc_vs7djPoqylg5PUwy0f2YGmHfvh1Dn7sEYhjFCurn8XI-TEQM45dEI_OEks9RrwTmBOUaUCn6CDpEGQbmY4CnPp75aeq8YB-zkbuFVNdKKQkuzFgzB7KA85k-tR2COVhAIAXJQ',
          expires_in: 7200 }
         */
          //設置access_Token過期時間
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000; // 5min * 60s = 300(提醒重啟); *1000 從秒轉化成分
          //將promise對象狀態改成成功的狀態
          resolve(res);
        })
        .catch(err => {
          console.log(err);
          //將promise對象狀態改成失敗的狀態
          reject("err found in getAccessToken method" + err);
        });
    });
  }
  /**
   * 用來保存access_token
   * param - accessToken要來保存的憑據
   */
  saveAccessToken(accessToken) {
    //accessToken 是[obj, obj],所以須轉化成json字符串才有辦法保存成功
    accessToken = JSON.stringify(accessToken);
    //將access_token保存一個文件(writeFile是異步保存方法，需用promise保起來確認有保存才執行)
    return new Promise((resolve, reject) => {
      writeFile("./accessToken.txt", accessToken, err => {
        if (!err) {
          console.log("文件保存成功");
          resolve();
        } else {
          reject("err found in saveAccess method" + err);
        }
      });
    });
  }
  /**
   * 用來讀取access_token
   * param - accessToken要來保存的憑據
   */
  readAccessToken() {
    //讀取本地文件中的access_token(readFile是異步保存方法，需用promise保起來確認有保存才執行)
    return new Promise((resolve, reject) => {
      readFile("./accessToken.txt", (err, data) => {
        if (!err) {
          console.log("文件讀取成功");
          //將data的json字符串轉化成js對象
          data = JSON.parse(data);
          resolve(data);
        } else {
          reject("err found in readAccess method" + err);
        }
      });
    });
  }
  /**
   * 用來檢測access_token是否有效的
   * param - accessToken = data
   */
  isValidAccessToken(data) {
    //檢測傳入的參數是否是有效的
    if (!data && !data.access_token && !data.expires_in) {
      //代表access_token無效的
      return false;
    }
    // //檢測access_token是否在有效期內
    // if (data.expires_in < Date.now()) {
    //   //過期了！
    //   return false;
    // } else {
    //   //沒有過期
    //   return true;
    // }
    return data.expires_in > Date.now();
  }
}

//模擬測試
const w = new Wechat();
//w.getAccessToken(); check one
/*
讀取本地文件(readAccessToken)
  -本地有文件  
    判斷他是否過期(isValidAccessToken)
    -過期了：重新請求獲取access_token(getAccessToken). 保存下來覆蓋之前的文件（保証文件是唯一的）(saveAccessToken)
    -沒過期：直接使用
  -本地沒有文件
    -發送請求獲取access_token(getAccessToken). 保存下來（本地文件(saveAccessToken)）,直接使用
*/
new Promise((resolve, reject) => {
  w.readAccessToken()
    .then(res => {
      //本地有文件  判斷他是否過期(isValidAccessToken)
      if (w.isValidAccessToken(res)) {
        //有效的
        resolve(res);
      } else {
        //無效的
        //發送請求獲取access_token(getAccessToken).
        w.getAccessToken().then(res => {
          //保存下來（本地文件(saveAccessToken)）,直接使用
          w.saveAccessToken(res).then(() => {
            resolve(res);
          });
        });
      }
    })
    .catch(err => {
      //本地沒有文件
      //發送請求獲取access_token(getAccessToken).
      w.getAccessToken().then(res => {
        //保存下來（本地文件(saveAccessToken)）,直接使用
        w.saveAccessToken(res).then(() => {
          resolve(res);
        });
      });
    });
});
