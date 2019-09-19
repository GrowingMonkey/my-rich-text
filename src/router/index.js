import Vue from 'vue'
import Router from 'vue-router'
import appLoad from '@/components/appLoad'
import DraftBox from '@/components/DraftBox'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect:'/appload'
    },
    {
      path:'/draftbox',
      name:'DraftBox',
      component:DraftBox
    },
    {
      path:'/appload',
      name:'appLoad',
      component:appLoad
    }
  ]
})
