# electron-tools

> An electron-vue project

## 初衷: 想写个邮件群发助手,写完后发现是有个厂商白名单的,功能可用,但是群发过多,会被邮箱拉黑, 一封一封发也不行,头痛



## 技术栈: vue-electron + element-ui + xlsx + nodemailer + nedb（node: 10.16.0）



## 功能: 

1. 本地存储账户信息 nedb 

2. 解析Excel中的邮箱

3. 添加邮件附件

4. 群发邮件

5. 富文本插件 tinymce（号称宇宙最强）

   

## [问题集锦](https://segmentfault.com/a/1190000019487488)

## ![GIF演示](https://github.com/Nick-QI/electron-tools/blob/master/static/electron.gif?raw=true)

#### Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:9080
yarn run dev

# build electron application for production
yarn run build

# run unit & end-to-end tests
yarn test


# lint all JS/Vue component files in `src/`
yarn run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
