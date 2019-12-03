const express = require("express");
const auth = require("./wechat/auth");

const app = express();

app.use(auth());
app.listen(3000, () => console.log("服務器連接成功"));
