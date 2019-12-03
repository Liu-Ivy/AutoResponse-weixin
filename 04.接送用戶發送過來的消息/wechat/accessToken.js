const rp = require("request-promise-native");
const { writeFile, readFile } = require("fs");
const { appID, appsecret } = require("../config");

class Wechat {
  constructor() {}
  getAccessToken() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    return new Promise((resolve, reject) => {
      rp({ method: "GET", url: url, json: true })
        .then(res => {
          console.log("RES:", res);
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000; // 5min * 60s = 300(提醒重啟); *1000 從秒轉化成分
          resolve(res);
        })
        .catch(err => {
          console.log(err);
          reject("err found in getAccessToken method" + err);
        });
    });
  }

  saveAccessToken(accessToken) {
    accessToken = JSON.stringify(accessToken);
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

  readAccessToken() {
    return new Promise((resolve, reject) => {
      readFile("./accessToken.txt", (err, data) => {
        if (!err) {
          console.log("文件讀取成功");
          data = JSON.parse(data);
          resolve(data);
        } else {
          reject("err found in readAccess method" + err);
        }
      });
    });
  }

  isValidAccessToken(data) {
    if (!data && !data.access_token && !data.expires_in) {
      return false;
    }

    return data.expires_in > Date.now();
  }

  fetchAccessToken() {
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      });
    }
    return this.readAccessToken() //the return value here is the value from Promise.resolve(res) below
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res);
        } else {
          const res = await this.getAccessToken();
          await this.saveAccessToken(res);
          return Promise.resolve(res);
        }
      })
      .catch(async err => {
        const res = await this.getAccessToken();
        await this.saveAccessToken(res);
        return Promise.resolve(res);
      })
      .then(res => {
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        return Promise.resolve(res);
      });
  }
}

//模擬測試testing
const w = new Wechat();

new Promise((resolve, reject) => {
  w.readAccessToken()
    .then(res => {
      if (w.isValidAccessToken(res)) {
        resolve(res);
      } else {
        w.getAccessToken().then(res => {
          w.saveAccessToken(res).then(() => {
            resolve(res);
          });
        });
      }
    })
    .catch(err => {
      w.getAccessToken().then(res => {
        w.saveAccessToken(res).then(() => {
          resolve(res);
        });
      });
    });
}).then(res => {
  console.log(res);
});
