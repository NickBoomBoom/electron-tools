<template lang='pug'>
div#app 
  router-view
  //- i.el-icon-s-home(v-if='notHome' @click='toHome')
</template>

<script>
const HOME_ROUTER_NAME = 'index'
export default {
  name: 'knowyourself-tools',
  computed: {
    notHome () {
      return this.$route.name !== HOME_ROUTER_NAME
    }
  },
  methods: {
    toHome () {
      const { name } = this.$route
      if (name !== HOME_ROUTER_NAME) {
        this.$router.push({ name: HOME_ROUTER_NAME })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.el-icon-s-home {
  position: fixed;
  bottom: 30px;
  right: 20px;
  font-size: 40px;
}
</style>
