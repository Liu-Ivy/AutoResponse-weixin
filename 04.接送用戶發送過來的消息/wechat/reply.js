const rp = require("request-promise-native");
const Theaters = require("../model/Theaters");
const { url } = require("../config");

module.exports = async message => {
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: "text"
  };

  let content = "您在说什么，我听不懂？";
  if (message.MsgType === "text") {
    if (message.Content === "热门") {
      //全匹配
      const data = await Theaters.find(
        {},
        { title: 1, summary: 1, posterKey: 1, doubanId: 1, _id: 0 }
      );
      content = [];
      options.msgType = "news";
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        content.push({
          title: item.title,
          description: item.summary,
          picUrl: `http://peicjnx2h.bkt.clouddn.com/${item.posterKey}`,
          url: `${url}/detail/${item.doubanId}`
        });
      }
    } else if (message.Content === "首页") {
      options.msgType = "news";
      content = [
        {
          title: "硅谷电影预告片首页",
          description: "这里有最新的电影预告片~",
          picUrl: "http://www.atguigu.com/images/logo.jpg",
          url: `${url}/movie`
        }
      ];
    } else {
      const url = "https://api.douban.com/v2/movie/search";
      const data = await rp({
        method: "GET",
        url,
        json: true,
        qs: { q: message.Content, count: 8 }
      });
      const subjects = data.subjects;
      console.log(data);
      if (subjects && subjects.length) {
        content = [];
        options.msgType = "news";
        for (let i = 0; i < subjects.length; i++) {
          let item = subjects[i];
          content.push({
            title: item.title,
            description: `电影评分为：${item.rating.average}`,
            picUrl: item.images.small,
            url: item.alt
          });
        }
      } else {
        content = "暂时没有相关的电影信息";
      }
    }
  } else if (message.MsgType === "voice") {
    console.log(message.Recognition);
    const url = "https://api.douban.com/v2/movie/search";
    const { subjects } = await rp({
      method: "GET",
      url,
      json: true,
      qs: { q: message.Recognition, count: 8 }
    });
    if (subjects && subjects.length) {
      content = [];
      options.msgType = "news";
      for (let i = 0; i < subjects.length; i++) {
        let item = subjects[i];
        content.push({
          title: item.title,
          description: `电影评分为：${item.rating.average}`,
          picUrl: item.images.small,
          url: item.alt
        });
      }
    } else {
      content = "暂时没有相关的电影信息";
    }
  } else if (message.MsgType === "event") {
    if (message.Event === "subscribe") {
      content =
        "欢迎您关注硅谷电影公众号~ \n" +
        "回复 首页 查看硅谷电影预告片 \n" +
        "回复 热门 查看最热门的电影 \n" +
        "回复 文本 搜索电影信息 \n" +
        "回复 语音 搜索电影信息 \n" +
        "也可以点击下面菜单按钮，来了解硅谷电影公众号";
    } else if (message.Event === "unsubscribe") {
      console.log("无情取关~");
    } else if (message.Event === "CLICK") {
      content =
        "您可以按照以下提示来进行操作~ \n" +
        "回复 首页 查看硅谷电影预告片 \n" +
        "回复 热门 查看最热门的电影 \n" +
        "回复 文本 搜索电影信息 \n" +
        "回复 语音 搜索电影信息 \n" +
        "也可以点击下面菜单按钮，来了解硅谷电影公众号";
    }
  }

  options.content = content;

  return options;
};
