<template>
  <div class="edit-container">
    <header class="upload-header">
      <div class="left" @click="returnPage">
        <i></i>
      </div>
      <div class="center">编辑</div>
      <div class="right">保存</div>
    </header>
    <div class="title-edit">
      <input type="text" v-model="htmlObj.title" />
    </div>
    <div
      v-html="htmlObj.content"
      spellcheck=false
      class="content-edit"
      contenteditable="true"
      @input="editChange"
      ref="editor"
      @paste="pasteText"      
    >
      <!-- <p>{{htmlObj.content}}</p> -->
    </div>
    <!-- <new-edit></new-edit> -->
    <div class="edit-tool">
      <div class="left">
        <input class="bold" :class="{ active: iconList[0].choose }" value="B" type="button" @click="iconClick($event, 'bold', 'style')"/>
        <input class="bias" :class="{ active: iconList[1].choose }" value="I" type="button" @click="iconClick($event, 'italic', 'style')"/>
        <input class="underline" :class="{ active: iconList[2].choose }" value="U" type="button" @click="iconClick($event, 'underline', 'style')"/>
      </div>
      <div class="right">
        <button style="background:rgba(110,110,110,1);" :class="{ active: iconList[3].choose }" @click="iconClick($event, 'foreColor1', 'style')"></button>
        <button style="background:rgba(241,89,108,1);"  :class="{ active: iconList[4].choose }" @click="iconClick($event, 'foreColor2', 'style')"></button>
        <button style="background:rgba(241,223,3,1);"  :class="{ active: iconList[5].choose }" @click="iconClick($event, 'foreColor3', 'style')"></button>
        <button style="background:rgba(80,227,194,1);" :class="{ active: iconList[6].choose }" @click="iconClick($event, 'foreColor4', 'style')"></button>
      </div>
    </div>
  </div>
</template>

<script>
import NewEdit from './NewEdit'
export default {
  name: "EditModule",
  components:{
    NewEdit,
  },
  data() {
    return {
      innerText:'',
      htmlObj: {
        title: "",
        content: ""
      },
      selectedRange: '',
      iconList: [
        {
          // hover名字
          name: '粗体',
          // 点击事件处理
          type: 'bold',
          // 是否被选中
          canChoose: true,
          choose: false
        },
        {
          name: '斜体',
          type: 'italic',
          canChoose: true,
          choose: false
        },
        {
          name: '下划线',
          type: 'underline',
          canChoose: true,
          choose: false
        },
        {
          name: '字体颜色',
          type: 'foreColor1',
          canChoose: true,
          drop:true,
          choose: false
        },
        {
          name: '字体颜色',
          type: 'foreColor2',
          drop:true,
          canChoose: true,
          choose: false
        },
        {
          name: '字体颜色',
          type: 'foreColor3',
          drop:true,
          canChoose: true,
          choose: false
        },
        {
          name: '字体颜色',
          type: 'foreColor4',
          drop:true,
          canChoose: true,
          choose: false
        },
      ]
    };
  },
  mounted() {
    window.localStorage.setItem(
      "moduleList",
      '[{"type":1,"title":"12","content":"13333"}]'
    );
    this.htmlObj = JSON.parse(window.localStorage.getItem("moduleList"))[0];
  },
  methods: {
    changeStyle(type) {
      switch (type) {
        case 'bold':
          document.execCommand('bold', false)
          break
        case 'underline':
          document.execCommand('underline', false)
          break
        case 'italic':
          document.execCommand('italic', false)
          break
        case 'foreColor1':
          document.execCommand('foreColor', 0 ,"rgba(110,110,110,1)")
          break
        case 'foreColor2':
          document.execCommand('foreColor', 0 ,"rgba(241,89,108,1)")
          break
        case 'foreColor3':
          document.execCommand('foreColor', 0 ,"rgba(241,223,3,1)")
          break
        case 'foreColor4':
          document.execCommand('foreColor', 0 ,"rgba(80,227,194,1)")
          break
        default:
          console.log('none')
      }
    },
    iconClick (event, type, dropType) {
      event.preventDefault()
      this.$refs.editor.focus()
      // let $el=this.$refs.editor;
      // this.keepLastIndex($el);
      // 恢复光标
      this.restoreSelection()
      // 修改所选区域的样式
      this.changeStyle(type)
      // this.$nextTick(() => {
        // if (dropType) {
        //   type = dropType
        // }
        var arr = JSON.parse(JSON.stringify(this.iconList))
        arr = arr.map((val, index) => {
          if (type === val.type && val.canChoose) {
            val.choose = val.choose ? false : true
          }else {
            if (val.drop) {
              val.choose = false
            }
          }
          return val
        })
        // if (type === 'clear') {
        //   var a = this.getSelect()
        //   if (a.startOffset === a.endOffset) {
        //     document.execCommand('insertHTML', false, '&nbsp')
        //     // return false
        //   }
        //   arr = arr.map((val, index) => {
        //     val.choose = false
        //     return val
        //   })
        // }
        this.iconList = arr
      // })
    },
    restoreSelection() {
      var selection = window.getSelection()
      if (this.selectedRange) {
        try {
          selection.removeAllRanges() /*清空所有Range对象*/
        } catch (ex) {
          /*IE*/
          document.body.createTextRange().select()
          document.selection.empty()
        }
        /*恢复保存的范围*/
        selection.addRange(this.selectedRange)
      }
    },
    returnPage() {
      this.$router.go(-1);
    },
    editChange() {
      console.log(this.$refs.editor.children);
      let that = this;
      if (this.$refs.editor.children.length == 0) {
        this.$refs.editor.value = `<p></p>`;
        // setTimeout(() => {
        //   that.keepLastIndex(e.target);
        // }, 5);
      }
    },
    //获取光标
    getCaret() {},
    //设置光标
    setCaret() {},
    //保存光标
    saveCaret() {},
    //插入节点
    insertHtmlAtCaret(html) {
      let sel, range;
      if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);

          range.deleteContents();

          // Range.createContextualFragment() would be useful here but is

          // non-standard and not supported in all browsers (IE9, for one)

          let el = document.createElement("div");

          el.innerHTML = html;

          let frag = document.createDocumentFragment(),
            node,
            lastNode;

          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }

          range.insertNode(frag);

          // Preserve the selection

          if (lastNode) {
            range = range.cloneRange();

            range.setStartAfter(lastNode);

            range.collapse(true);

            sel.removeAllRanges();

            sel.addRange(range);
          }
        }
      } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
      }
    },
    //光标定位在末尾
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
    },
    //粘贴事件处理
    pasteText(e) {
      console.log(e);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-edit i{
  font-style: italic !important;
}
.content-edit b{
  font-weight: bold !important;
}
.upload-header {
  width: 100%;
  box-sizing: border-box;
  padding: 43px 58px 31px 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.upload-header div {
  width: 156px;
  font-size: 52px;
}
.upload-header i {
  width: 37px;
  height: 69px;
  display: block;
  background: url("../../static/fanhui.svg") no-repeat;
  background-size: 100%;
}
.upload-header .center{
  text-align: center;
}
.upload-header .right{
  text-align: right;
}
.title-edit {
  padding: 54px 58px 48px 58px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
  font-size: 42px;
  font-weight: 600;
  color: rgba(54, 54, 54, 1);
}
.title-edit input {
  font-weight: 600;
  color: rgba(54, 54, 54, 1);
  width: 100%;
  border: none;
}
.content-edit {
  height: 718px;
  padding: 48px 58px;
  box-sizing: border-box;
  overflow-y: scroll;
  font-size: 42px;
  color: rgba(73, 73, 73, 1);
}
.content-edit * {
  font-size: 42px;
  color: rgba(73, 73, 73, 1);
}
.edit-tool {
  padding: 0 58px;
  box-sizing: border-box;
  width: 100%;
  height: 144px;
  display: flex;
  justify-content: space-between;
  border: 1px solid rgba(218, 218, 218, 1);
  border-left: none;
  border-right: none;
}
.edit-tool .left .active{
  color:blue;
}
.edit-tool .right .active{
  border: 1px solid #c8c8c8;
}
.edit-tool .left,
.edit-tool .right {
  height: 144px;
  display: flex;
  align-items: center;
}
.edit-tool .left input {
  display: block;
  width: 40px;
  padding: 14px 55px;
  border:none;
  background: none;
}
.edit-tool .left input:nth-child(1) {
  padding: 14px 55px;
  padding-left: 14px;
}
.underline {
  text-decoration: underline;
}
.edit-tool .right button {
  display: block;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 24px;
  border:none;
}
.edit-tool .right .active{
  border:1px solid #c8c8c8;
}
</style>
