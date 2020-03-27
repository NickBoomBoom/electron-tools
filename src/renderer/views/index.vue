<template lang='pug'>
el-container.index-root
  el-main 
    el-button(
      v-for='(item,index) in tools'
      :key='index'
      type='primary' 
      @click='item.fn'
    ) {{item.label}}
</template>

<script>
export default {
  name: 'index',
  data () {
    return {
      tools: [
        {
          label: '群发助手',
          fn: this.toEmail
        }
      ]
    }
  },
  methods: {
    toEmail () {
      this.$router.push({name: 'email-index'})
    }
  }
}
</script>

<style lang="sass" scoped>
  
</style>