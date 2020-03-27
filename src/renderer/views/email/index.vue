<template lang='pug'>
  div.email-index-root
    el-card.email-index-card
      div.card-header(slot='header') 
        h1 账号列表
        el-button(
          type='primary' 
          size='mini'
          @click='toggleLogin'
        ) 新增账号

      div.card-list(v-if='userList')
        template(v-if='userList.length')
          div.card-list-item(v-for='(item, index) in userList' :key='item._id')
            div.item-l {{item.email}}

            div.item-r
              el-button(@click='deleteUser(item)' type='danger' size='mini') 删除
              el-button(@click='toSend(item)' type='primary' size='mini') 使用

        template(v-else)
          h2 暂无账号, 请添加~~

    el-dialog(
      :visible.sync="isLoginDialog"
    ) 
      el-form(:model='currentUser' :rules='rules' ref='dialogForm')
        el-form-item(label='邮箱地址: ' prop='email')
          el-input(v-model='currentUser.email' placeholder='请输入邮箱地址~~')
        el-form-item(label='授权码/密码:' prop='pwd')
          el-input(show-password v-model='currentUser.pwd' placeholder='请输入授权码/密码~~')
        el-form-item.mt10
          el-button(type='primary' @click='confirm') 确定
</template>

<script>
const DB_EMAIL_KEY = 'email'
export default {
  name: 'email-index',
  data () {
    return {
      userList: null,

      // 新增/更新账号
      isLoginDialog: false,
      currentUser: {
        email: '',
        pwd: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        pwd: [{
          required: true, message: '请输入密码', trigger: 'blur'
        }]
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 检测本地是否登录邮箱
    init () {
      this.$loading({
        lock: true,
        text: '检测本地账号中...'
      })
      this.$db.find({
        key: DB_EMAIL_KEY
      }, (err, data) => {
        this.$loading().close()
        if (err) {
          return this.$message.error(err)
        }
        this.userList = data
      })
    },
    toggleLogin () {
      this.isLoginDialog = !this.isLoginDialog
      this.currentUser = {
        email: '',
        pwd: ''
      }
    },
    deleteUser (item) {
      const {_id} = item
      this.$db.remove({_id}, {}, (err, data) => {
        if (err) {
          return this.$message.error(err)
        }
        this.userList = this.userList.filter(t => t._id !== _id)
      })
    },
    confirm () {
      this.$refs.dialogForm.validate(bol => {
        if (bol) {
          this.$db.insert(
            {...this.currentUser, key: DB_EMAIL_KEY},
            (err, newDoc) => {
              if (err) {
                return this.$message.error(err)
              }
              this.toggleLogin()
              this.init()
            }
          )
        }
      })
    },
    toSend (item) {
      const {_id} = item
      this.$router.push({
        name: 'email-send',
        query: {
          id: _id
        }})
    }
  }
}
</script>

<style lang="scss" scoped> 
.email-index-root {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .email-index-card {
    width: 500px;
    min-height: 400px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-list {
      &-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0 ;
        box-sizing: border-box;
        border-bottom: 1px solid #f5f5f5;
      }
    }

  }
}

</style>