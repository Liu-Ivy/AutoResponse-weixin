const express = require("express");
const auth = require("./wechat/auth");

const app = express();

app.use(auth());
app.listen(3000, () => console.log("Connecting to the port"));
