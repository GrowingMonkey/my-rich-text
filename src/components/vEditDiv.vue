<template>
  <div
    class="edit-div"
    v-html="innerText"
    :contenteditable="canEdit"
    @focus="focusE"
    ref="edit"
    @blur="blurE"
    @input="changeText"
    @onpropertychange="this.scrollTop = this.scrollHeight "
  ></div>
</template>
<script type="text/ecmascript-6">
export default {
  name: "editDiv",
  props: {
    value: {
      type: String,
      default: ""
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      innerText: this.value,
      isLocked: false
    };
  },
  watch: {
    value() {
      if (!this.isLocked || !this.innerText) {
        this.innerText = this.value;
      }
    }
  },
  methods: {
    changeText() {
      console.log(1);
      this.$emit("input", this.$el.innerHTML);
    },
    focusE() {
      // alert(2);
      window.scrollTo(0, 0);
      this.isLocked = true;
      console.log(this.$refs.edit);
      this.keepLastIndex(this.$refs.edit);
      console.log(this.$refs.edit.scrollHeight);
      this.$refs.edit.scrollTop = this.$refs.edit.scrollHeight;
    },
    blurE() {
      // alert(3);
      window.scrollTo(0, 0);
      this.isLocked = false;
    },
    keepLastIndex(obj) {
      console.log(obj);
      console.log(window.getSelection);
      console.log(document.selection);
      if (window.getSelection) {
        //ie11 10 9 ff safari
        obj.focus(); //解决ff不获取焦点无法定位问题
        var range = window.getSelection(); //创建range
        range.selectAllChildren(obj); //range 选择obj下所有子内容
        range.collapseToEnd(); //光标移至最后
      } else if (document.selection) {
        //ie10 9 8 7 6 5
        var range = document.selection.createRange(); //创建选择对象
        //var range = document.body.createTextRange();
        range.moveToElementText(obj); //range定位到obj
        range.collapse(false); //光标移至最后
        range.select();
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.edit-div {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  overflow: auto !important;
  word-break: break-all !important;
  font-size: 42px !important;
  outline: none !important;
  user-select: text !important;
  white-space: pre-wrap !important;
  // text-align: left;
  &[contenteditable="true"] {
    user-modify: read-write-plaintext-only;
    &:empty:before {
      content: attr(placeholder);
      display: block !important;
      color: #ccc !important;
    }
  }
}
.edit-div .img-box {
  width: 100% !important;
  text-align: center !important;
}
.edit-div .img-box img {
  padding: 55px 0 !important;
  width: 100% !important;
  color: #000 !important;
}
.edit-div>p{
  line-height: 2 !important;
  letter-spacing: .5px !important;
}
.edit-div  span {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
.edit-div p img{
  display: block !important;
  margin: 0 auto !important;
}
.edit-div  h1 {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
.edit-div  h2 {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
.edit-div  h3 {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
.edit-div  h4 {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
.edit-div  div {
  font-size: 42px !important;
  line-height: 2 !important;
  color: #000 !important;
}
</style>