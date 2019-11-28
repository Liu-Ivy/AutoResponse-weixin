//insert express
const express = require("express");
//insert auth
const auth = require("./wechat/auth");

//app apply
const app = express();

//接受處理所有消息
app.use(auth());
//監聽端口號
app.listen(3000, () => console.log("服務器連接成功"));
