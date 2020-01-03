import Vue from 'vue'
import Router from 'vue-router'
import appLoad from '@/components/appLoad'
import DraftBox from '@/components/DraftBox'
import ModuleDrag from '@/components/ModuleDrag.vue'
import NewLoad from '@/components/NewLoad.vue'
import EditModule from '@/components/EditModule.vue'
import PreView from '@/components/PreView.vue'
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
    },
    {
      path:'/moduledrag',
      name:'moduledrag',
      component:ModuleDrag
    },
    {
      path:'/newload',
      name:'NewLoad',
      component:NewLoad
    },
    {
      path:'/edit',
      name:'EditModule',
      component:EditModule
    },
    {
      path:'/preview',
      name:'PreView',
      component:PreView
    }
  ]
})
