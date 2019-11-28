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

//引入config文件
const { appID, appsecret } = require("../config");
//只需要引入request-promise-native
const rp = require("request-promise-native");
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
    rp({ method: "GET", url: url, json: true })
      .then(res => {
        console.log(res);
        /*
        { access_token:
        '27_cIz0jEnmODAiN-ntVVfc_vs7djPoqylg5PUwy0f2YGmHfvh1Dn7sEYhjFCurn8XI-TEQM45dEI_OEks9RrwTmBOUaUCn6CDpEGQbmY4CnPp75aeq8YB-zkbuFVNdKKQkuzFgzB7KA85k-tR2COVhAIAXJQ',
         expires_in: 7200 }
        */
       //設置access_Token過期時間
       res.expires_in = Date.now() + （res.expires_in - 300）＊1000; // 5min * 60s = 300(提醒重啟)

      })
      .catch(err => {
        console.log(err);
      });
  }
}

//模擬測試
const w = new Wechat();

w.getAccessToken();
