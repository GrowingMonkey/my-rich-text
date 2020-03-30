<template>
  <div class="vue-slim-popup">
    <transition :name="maskTransition">
      <div
        v-show="show"
        class="vue-slim-popup__mask"
        :style="maskStyle"
        @click="maskClick"
        @touchmove="preventDefault($event, 'Mask')" ></div>
    </transition>

    <transition :name="popupTransition || (popupPosition === 'center'? 'slim-scale-center': `slim-slide-${popupPosition}`)">
      <div
        v-show="show"
        ref="popup"
        class="vue-slim-popup__popup vue-slim-popup__popup-center popup"
        :style="popupStyle"
        @click.self="popupClick"
        @touchmove="preventDefault($event, 'Popup')">
        <slot v-if="popupBodyRenderState" />
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
/**
 * 阻止滚动穿透
 * @param {Boolean} isPrevent 是否阻止
 */
const preventRollingThrough = (() => {
  let scrollTop
  return (isPrevent = true) => {
    if (isPrevent) {
      scrollTop = document.body.scrollTop || document.documentElement.scrollTop
      // position fixed会使滚动位置丢失，所以利用top定位
      document.body.style.position = 'fixed'
      document.body.style.left = 0
      document.body.style.right = 0
      document.body.margin = 'auto'
      document.body.style.top = `-${scrollTop}px`
    } else {
      // 恢复时，需要还原之前的滚动位置
      document.body.style.position = 'static'
      document.body.style.top = '0px'
      window.scrollTo(0, scrollTop)
    }
  }
})()
export default {
  name: 'SlimPopup',
  components: {},
  props: {
    show: {
      // .sync 是否显示
      type: Boolean,
      default: false,
    },
    hideOnMaskClick: {
      // 点击遮罩是否关闭弹窗
      type: Boolean,
      default: false,
    },
    forceRenderOnShow: {
      // 显示的时候是否重新渲染
      type: Boolean,
      default: false,
    },
    maskTransition: {
      // 遮罩动画
      type: String,
      default: 'slim-fade',
    },
    popupTransition: {
      // 弹窗动画，内置 'slim-scale-center', 'slim-zoom-center', 'slim-slide-top', 'slim-slide-bottom', 'slim-slide-left', 'slim-slide-right'。为空则根据 popupPosition 选用默认动画
      type: String,
      default: null,
    },
    maskClass: {
      // 遮罩的样式类
      type: Array,
      default: null,
    },
    popupClass: {
      // 弹窗的样式类
      type: Array,
      default: null,
    },
    maskStyle: {
      // 遮罩样式
      type: Object,
      default: null,
    },
    popupStyle: {
      // 弹窗样式
      type: Object,
      default: null,
    },
    popupPosition: {
      // 弹窗位置，可选 'center', 'top', 'bottom', 'left', 'right'
      type: String,
      default: 'center',
    },
    preventMaskTouchmove: {
      // 阻止遮罩 touchmove 事件，阻止移动端滚动穿透
      type: Boolean,
      default: true,
    },
    preventPopupTouchmove: {
      // 阻止弹窗 touchmove 事件，阻止移动端滚动穿透（同时会导致弹窗区域无法滚动）
      type: Boolean,
      default: true,
    },
    preventBodyScroll: {
      // 阻止 body 滚动，以间接的阻止滚动穿透（不会影响弹窗区域滚动）。开启此选项，关闭 preventPopupTouchmove，可达到弹窗区域可滚动，同时阻止滚动穿透的效果
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      popupBodyRenderState: true, // 弹窗内容渲染状态
    }
  },
  watch: {
    async show (val) {
      // forceRenderOnShow
      if (this.forceRenderOnShow && val) {
        this.popupBodyRenderState = false
        await this.$nextTick()
        this.popupBodyRenderState = true
      }
      // preventBodyScroll
      if (this.preventBodyScroll) val ? preventRollingThrough(true) : preventRollingThrough(false)
    },
  },
  mounted () {
    this.init()
  },
  methods: {
    // 初始化
    init () {},
    // 隐藏
    hide () {
      this.$emit('update:show', false)
    },
    // 遮罩点击 handle
    maskClick () {
      this.$emit('maskClick')
      this.hideOnMaskClick && this.hide()
    },
    // 弹窗点击 handle
    popupClick () {
      this.$emit('popupClick')
    },
    // 阻止默认事件
    preventDefault (e, type) {
      if (this[`prevent${type}Touchmove`]) e.preventDefault()
    },
    // 阻止滚动穿透
    preventRollingThrough,
  },
}
</script>

<style >
.popup {
    width: 80%;
    min-height: 200px;
    border-radius: 16px;
    text-align :center;
    background: #fff;
    display :flex;
    align-items :center;
    flex-direction: column;
    justify-content :space-around;
}
.popup .scroll {
      height :200px;
      overflow-y: scroll;
      -webkit-overflow-scrolling :touch;
    }
/* @import './stylus/index.styl' */

.vue-slim-popup__mask {
  position: fixed;
  z-index: 999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  touch-action: none;
}
.vue-slim-popup__popup {
  position: fixed;
  z-index: 1000;
  margin: auto;
}
.vue-slim-popup__popup-center {
  top: 50%;
  right: auto;
  bottom: auto;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  transform-origin: left top;
}
.vue-slim-popup__popup-top {
  top: 0;
  bottom: auto;
  left: 50%;
  right: auto;
  transform: translate3d(-50%, 0, 0);
}
.vue-slim-popup__popup-bottom {
  top: auto;
  bottom: 0;
  left: 50%;
  right: auto;
  transform: translate3d(-50%, 0, 0);
}
.vue-slim-popup__popup-left {
  top: 50%;
  bottom: auto;
  left: 0;
  right: auto;
  transform: translate3d(0, -50%, 0);
}
.vue-slim-popup__popup-right {
  top: 50%;
  bottom: auto;
  left: auto;
  right: 0;
  transform: translate3d(0, -50%, 0);
}
   /* 动画 */
 .vue-slim-popup .slim-fade-enter-active,
.vue-slim-popup .slim-fade-leave-active {
  opacity: 1;
  transition: opacity ease-in 0.2s;
}
.vue-slim-popup .slim-fade-enter,
.vue-slim-popup .slim-fade-leave-to {
  opacity: 0;
}
.vue-slim-popup .slim-scale-center-enter-active {
  animation: scaleIn 0.4s;
}
.vue-slim-popup .slim-scale-center-leave-active {
  animation: scaleOut 0.2s;
}
.vue-slim-popup .slim-zoom-center-enter-active {
  opacity: 1;
  transition: all ease 0.4s;
}
.vue-slim-popup .slim-zoom-center-leave-active {
  opacity: 1;
  transition: all ease 0.2s;
}
.vue-slim-popup .slim-zoom-center-enter,
.vue-slim-popup .slim-zoom-center-leave-to {
  transform: scale(0.6) translate3d(-50%, -50%, 0);
  opacity: 0;
}
.vue-slim-popup .slim-slide-top-enter-active,
.vue-slim-popup .slim-slide-bottom-enter-active,
.vue-slim-popup .slim-slide-left-enter-active,
.vue-slim-popup .slim-slide-right-enter-active {
  opacity: 1;
  transition: all ease 0.4s;
}
.vue-slim-popup .slim-slide-top-leave-active,
.vue-slim-popup .slim-slide-bottom-leave-active,
.vue-slim-popup .slim-slide-left-leave-active,
.vue-slim-popup .slim-slide-right-leave-active {
  opacity: 1;
  transition: all ease 0.2s;
}
.vue-slim-popup .slim-slide-top-enter {
  transform: translate3d(-50%, -100%, 0);
  opacity: 1;
}
.vue-slim-popup .slim-slide-top-leave-to {
  transform: translate3d(-50%, -100%, 0);
  opacity: 0;
}
.vue-slim-popup .slim-slide-bottom-enter {
  transform: translate3d(-50%, 100%, 0);
  opacity: 1;
}
.vue-slim-popup .slim-slide-bottom-leave-to {
  transform: translate3d(-50%, 100%, 0);
  opacity: 0;
}
.vue-slim-popup .slim-slide-left-enter {
  transform: translate3d(-100%, -50%, 0);
  opacity: 1;
}
.vue-slim-popup .slim-slide-left-leave-to {
  transform: translate3d(-100%, -50%, 0);
  opacity: 0;
}
.vue-slim-popup .slim-slide-right-enter {
  transform: translate3d(100%, -50%, 0);
  opacity: 1;
}
.vue-slim-popup .slim-slide-right-leave-to {
  transform: translate3d(100%, -50%, 0);
  opacity: 0;
}
@-moz-keyframes scaleIn {
  0% {
    transform: scale(1.4) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
}
@-webkit-keyframes scaleIn {
  0% {
    transform: scale(1.4) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
}
@-o-keyframes scaleIn {
  0% {
    transform: scale(1.4) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
}
@keyframes scaleIn {
  0% {
    transform: scale(1.4) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
  100% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
}
@-moz-keyframes scaleOut {
  0% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.6) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
}
@-webkit-keyframes scaleOut {
  0% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.6) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
}
@-o-keyframes scaleOut {
  0% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.6) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
}
@keyframes scaleOut {
  0% {
    transform: scale(1) translate3d(-50%, -50%, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.6) translate3d(-50%, -50%, 0);
    opacity: 0;
  }
}

</style>