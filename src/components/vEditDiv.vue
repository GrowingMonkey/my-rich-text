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
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: auto;
  word-break: break-all;
  font-size: 42px;
  outline: none;
  user-select: text;
  white-space: pre-wrap;
  // text-align: left;
  &[contenteditable="true"] {
    user-modify: read-write-plaintext-only;
    &:empty:before {
      content: attr(placeholder);
      display: block;
      color: #ccc;
    }
  }
}
.edit-div .img-box {
  width: 100%;
  text-align: center;
}
.edit-div .img-box img {
  padding: 55px 0;
  width: 100%;
}
.edit-div > p {
  line-height: 2;
}
</style>