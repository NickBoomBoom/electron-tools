import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/views/index.vue'
// email tool routers
import EmailIndex from '@/views/email/index.vue'
import EmailSend from '@/views/email/send.vue'

Vue.use(Router)

export default new Router({

  routes: [
    // email routers
    {
      path: '/email/index',
      name: 'email-index',
      component: EmailIndex
    },
    {
      path: '/email/send',
      name: 'email-send',
      component: EmailSend
    },

    // base
    {
      path: '/index',
      name: 'index',
      component: Index
    },
    {
      path: '/',
      component: EmailIndex
    },
    {
      path: '*',
      component: Index
    }
  ]
})
