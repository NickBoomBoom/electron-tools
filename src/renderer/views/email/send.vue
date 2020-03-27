<template lang='pug'>
div.email-send-root
  el-page-header(
    @back='$router.go(-1)'
    content='群发邮件'
  )

  el-form.send-header.mt20(
    :model='formData' 
    :rules='rules'
    ref="ruleForm" 
    label-width="70px"
  )
    el-form-item(label='收件人:' prop='emails')
      div.send-header__ads
        el-input(
          autosize
          placeholder='请输入邮件地址,多个邮箱请用分号隔开'
          :value='formData.emails'
          @input='handleInput'
          type="textarea"
        )
        el-button(
          type="text"
          @click="toggleUpload('excel')"
        ) 文件导入
    
    el-form-item(label='主题:' prop='title')
      el-input(
        v-model='formData.title'
        placeholder='请输入主题'
      )
  div.send-main
    Editor(
      v-model='formData.content'
      :init="editorInit"
    )
    div.mt10
      el-button(type='primary' @click='toggleUpload') 上传附件
      template(v-if='formData.fileList.length')
        el-tag.mr10.ml10(v-for='(item, index) in formData.fileList' :key='index' closable @close="handleCloseFile(index)") {{item.path}}
  
  el-divider

  div.send-footer.mt20
    el-button(@click='beforeSend' type='primary')  发送
    
  //- excel 读取弹窗
  el-dialog(
    :title='uploadConfig.title'
    :visible.sync="isUpload"
    :close-on-click-modal='false'
    :before-close="handleClose"
  )
    el-upload.upload-demo(
      drag
      action=''
      :multiple='uploadConfig.multiple'
      :before-upload='uploadConfig.handler'
      :accept='uploadConfig.accept'
    )
      i.el-icon-upload
      div.el-upload__text 将文件拖到此处，或
        em 点击上传
</template>

<script>
import xlsx from 'xlsx'

import tinymce from 'tinymce/tinymce'
import 'tinymce/themes/silver/theme'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/code'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/colorpicker'
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/paste'

import nodemailer from 'nodemailer'

let globalcounter = 0
const EMAIL_REG = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/

/*
  文件导入: 只会截取所有符合 email 正则的邮箱地址
 */
export default {
  name: 'email-send',
  components: {
    Editor
  },
  data () {
    return {
      formData: {
        title: '',
        emails: '',
        content: '',
        fileList: [] // 上传附件列表
      },

      rules: {
        title: [
          {
            type: 'string',
            required: true,
            message: '请输入主题',
            trigger: 'blur'
          }
        ],
        emails: [
          {
            type: 'string',
            required: true,
            message: '请输入 email 地址',
            trigger: 'blur'
          }
        ]
      },

      editorInit: {
        language_url: 'static/tinymce/zh_CN.js',
        language: 'zh_CN',
        plugins: 'link autoresize lists image code table colorpicker textcolor wordcount contextmenu paste',
        paste_text_sticky: true,
        paste_convert_word_fake_lists: false,
        paste_data_images: true,
        paste_preprocess: function (plugin, args) {
          if (/^(\\<img\\ssrc\\=\\"(blob\\:)?.+\\"\\>)+$/.test(args.content)) {
            args.content = args.content.replace(/\\<img src\\=\\"/g, '<img id="pasted_image_' + parseInt(globalcounter) + '" width="100%" src="')
            ++globalcounter
          }
          // 不用section,因为无法设置居中
          args.content = args.content.replace(/\\<section/g, '<div').replace(/\\<\/section\\>/g, '</div>')
        },
        skin_url: 'static/tinymce/skins/ui/oxide',
        min_height: 700,
        branding: false
      },

      transporter: null, // 发件人信息

      // 上传配置
      isUpload: false,
      uploadType: '',
      dialogUpdalodOpt: {
        'excel': {
          multiple: false,
          title: '导入邮箱地址 - Excel',
          accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
          handler: this.handleExcel
        },
        'all': {
          multiple: true,
          title: '上传附件',
          accept: '',
          handler: this.handleFile
        }
      }
    }
  },
  computed: {
    uploadConfig () {
      return this.dialogUpdalodOpt[this.uploadType] || this.dialogUpdalodOpt.all
    }
  },
  mounted () {
    tinymce.init({})
    this.init()
  },
  methods: {
    init () {
      const {id} = this.$route.query
      this.$db.findOne({
        _id: id
      }, (err, data) => {
        if (err) {
          return console.error(err)
        }
        this.transporter = data
      })
    },
    toggleUpload (type) {
      this.isUpload = !this.isUpload
      this.uploadType = type
    },

    handleClose () {
      this.toggleUpload()
    },

    handleInput (val) {
      val = val.replace('；', ';').trim()
      this.formData.emails = val
    },

    handleExcel (file) {
      const {path} = file
      const workbook = xlsx.readFileSync(path)
      // console.log(workbook)
      const worksheets = workbook.Sheets
      /*
       {
        "v": "单元格的原始值",
        "w": "单元格格式化之后的文本",
        "t": "数据类型",
        "f": "cell formula",
        "r": "富文本",
        "h": "富文本的HTML表示形式",
        "c": "注释",
        "z": "数字格式化模板",
        "l": "如果当前单元格内容是超链接，这里存储了超链接内容",
        "s": "单元格样式"
      }
      */
      let emails = []
      for (let key in worksheets) { // 查所有表
        const item = worksheets[key] // 表数据
        for (let _k in item) {
          if (!_k.includes('!')) { // 过滤非表格数据
            const _t = item[_k] // 格数据
            emails.push(_t.v) // push
          }
        }
      }

      if (this.formData.emails && !this.formData.emails.endsWith(';')) {
        this.formData.emails += ';'
      }

      const res = emails.reduce((total, currentValue) => {
        if (EMAIL_REG.test(currentValue)) {
          total += `${currentValue};`
        }
        return total
      }, '')
      this.formData.emails += res

      this.toggleUpload()
      return false
    },

    handleFile (file) {
      this.formData.fileList.push(file)
      this.toggleUpload()
    },

    handleCloseFile (index) {
      this.formData.fileList.splice(index, 1)
    },

    beforeSend () {
      const {content} = this.formData
      this.$refs.ruleForm.validate(bol => {
        if (bol && content) {
          this.send()
        }
      })
    },

    /*
      发送规则: 不使用群发功能,每封邮件都单独发送,生成一个 promise 队列
    */
    async send () {
      const {title, content, emails, fileList} = this.formData
      const {email, pwd} = this.transporter
      const emailList = emails.split(';').filter(t => t).map(t => t.trim())

      console.log(this.transporter)
      // 发送者
      const transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'QQex', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: email,
          pass: pwd// 这里密码不是qq密码，是你设置的smtp授权码
        }
      })

      // 发送数据
      const baseMailOptions = {
        from: email, // sender address
        subject: title, // Subject line
        html: content, // html body
        attachments: fileList.map(item => {
          return {
            filename: item.name,
            path: item.path
          }
        })
      }

      let sendErrorList = [] // 发送失败数据

      const _SEND = (mailOptions) => {
        return new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => { // send mail with defined transport object
            if (error) {
              sendErrorList.push(mailOptions.to)
              return reject(error)
            }
            console.log('Message sent: %s', info.messageId)
            resolve(info)
          })
        })
      }

      const sendStack = emailList.map(item => {
        let arg = {}
        Object.assign(arg, {...baseMailOptions, to: item})
        return arg
      })

      this.$loading({
        lock: true,
        text: '发送中',
        spinner: 'el-icon-loading',
        customClass: 'email-send-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      await Promise.all(sendStack.map(arg => _SEND(arg)))

      this.$loading().close()

      if (sendErrorList.length) {
        const content = sendErrorList.toString().replace(',', ';')
        this.$alert(content, '发送失败邮箱')
      } else {
        this.$message({
          message: '发送成功!',
          type: 'success'
        })
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.header-label {
  min-width: 4em;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
}
.email-send-root {
  padding: 0  10px;
  .send-header {
    &__ads {
    display: flex;
    align-items: center;
      .el-textarea {
        margin-right: 10px;
        word-break: break-all;
      }
    }
  }

  .send-main {

  }

  .send-footer {
    display: flex;
    justify-content: center;
  }


}
</style>

<style>
.email-send-loading .el-icon-loading {
  font-size: 40px;
  margin-bottom: 10px;
}
</style>