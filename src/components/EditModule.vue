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
      spellcheck="false"
      class="content-edit"
      contenteditable="true"
      @input="editChange"
      ref="editor"
      @paste="pasteText"
      @click="onClick($event)"
    >
      <!-- <p>{{htmlObj.content}}</p> -->
    </div>
    <!-- <new-edit></new-edit> -->
    <div class="edit-tool">
      <div class="left">
        <input
          class="bold"
          :class="{ active: iconList[0].choose }"
          value="B"
          type="button"
          @click="iconClick($event, 'bold', 'style')"
        />
        <input
          class="bias"
          :class="{ active: iconList[1].choose }"
          value="I"
          type="button"
          @click="iconClick($event, 'italic', 'style')"
        />
        <input
          class="underline"
          :class="{ active: iconList[2].choose }"
          value="U"
          type="button"
          @click="iconClick($event, 'underline', 'style')"
        />
      </div>
      <div class="right">
        <div>
          <button
            style="background:rgba(110,110,110,1);"
            :class="{ active: iconList[3].choose }"
            @click="iconClick($event, 'foreColor1', 'style')"
          ></button>
        </div>
        <div>
          <button
            style="background:rgba(241,89,108,1);"
            :class="{ active: iconList[4].choose }"
            @click="iconClick($event, 'foreColor2', 'style')"
          ></button>
        </div>
        <div>
          <button
            style="background:rgba(241,223,3,1);"
            :class="{ active: iconList[5].choose }"
            @click="iconClick($event, 'foreColor3', 'style')"
          ></button>
        </div>
        <div>
          <button
            style="background:rgba(80,227,194,1);"
            :class="{ active: iconList[6].choose }"
            @click="iconClick($event, 'foreColor4', 'style')"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NewEdit from "./NewEdit";
export default {
  name: "EditModule",
  components: {
    NewEdit
  },
  data() {
    return {
      innerText: "",
      htmlObj: {
        title: "",
        content: ""
      },
      selectedRange: "",
      iconList: [
        {
          // hover名字
          name: "粗体",
          // 点击事件处理
          type: "bold",
          // 是否被选中
          canChoose: true,
          choose: false
        },
        {
          name: "斜体",
          type: "italic",
          canChoose: true,
          choose: false
        },
        {
          name: "下划线",
          type: "underline",
          canChoose: true,
          choose: false
        },
        {
          name: "字体颜色",
          type: "foreColor1",
          canChoose: true,
          drop: true,
          choose: false
        },
        {
          name: "字体颜色",
          type: "foreColor2",
          drop: true,
          canChoose: true,
          choose: false
        },
        {
          name: "字体颜色",
          type: "foreColor3",
          drop: true,
          canChoose: true,
          choose: false
        },
        {
          name: "字体颜色",
          type: "foreColor4",
          drop: true,
          canChoose: true,
          choose: false
        }
      ],
      activeIconList: []
    };
  },
  mounted() {
    window.localStorage.setItem(
      "moduleList",
      '[{"type":1,"title":"12","content":"<p>11111</p>"}]'
    );
    this.htmlObj = JSON.parse(window.localStorage.getItem("moduleList"))[0];
  },
  methods: {
    onClick(event) {
      let that = this;
      console.log(event);
      if (event.target.tagName == "DIV") {
        return false;
      }
      this.activeIconList = [];
      let target = event.target;
      this.changeTagStyle(target);
      let newArr = this.activeIconList.filter(function(x, index, self) {
        return self.indexOf(x) === index;
      });
      for (let i = 0; i < this.iconList.length; i++) {
        if (newArr[i] === "B") {
          this.iconList[0].choose = true;
        } else if (newArr[i] === "U") {
          this.iconList[2].choose = true;
        } else if (newArr[i] === "I") {
          this.iconList[1].choose = true;
        } else {
          this.iconList[i].choose = false;
        }
      }
    },
    isToolTag(el) {
      if (el.tagName == "B") return true;
      else return false;
    },
    changeTagStyle(el) {
      if (
        el.tagName == "B" ||
        el.tagName == "I" ||
        el.tagName == "U" ||
        el.tagName == "FONT"
      ) {
        this.activeIconList.push(el.tagName);
        console.log(el.parentNode.tagName);
      } else if (el.tagName == "DIV") {
        return;
      }
      this.changeTagStyle(el.parentNode);
    },
    changeStyle(type) {
      switch (type) {
        case "bold":
          if (window.navigator.userAgent.indexOf("AppleWebKit") > -1) {
            this.setBold();
          } else {
            document.execCommand("bold", false);
          }
          // document.execCommand("insertHtml", 'a',false);
          break;
        case "underline":
          if (window.navigator.userAgent.indexOf("AppleWebKit") > -1) {
            this.setUnderline();
          } else {
            document.execCommand("underline", false);
          }
          break;
        case "italic":
          if (window.navigator.userAgent.indexOf("AppleWebKit") > -1) {
            this.setItalic();
          } else {
            document.execCommand("italic", false);
          }
          break;
        case "foreColor1":
          document.execCommand("foreColor", 0, "rgba(110,110,110,1)");
          break;
        case "foreColor2":
          document.execCommand("foreColor", 0, "rgba(241,89,108,1)");
          break;
        case "foreColor3":
          document.execCommand("foreColor", 0, "rgba(241,223,3,1)");
          break;
        case "foreColor4":
          document.execCommand("foreColor", 0, "rgba(80,227,194,1)");
          break;
        default:
      }
    },
    // insertAfter(newNode, curNode) {
    //   console.log(curNode.parentNode);
    //   curNode.parentNode.insertBefore(newNode, curNode.nextElementSibling);
    // },
    setBold() {
      if (document.queryCommandState("bold")) {
        document.execCommand("bold", false, null);
        document.execCommand("insertHTML", false, "&zwnj;");
      } else {
        document.execCommand("bold", false, null);
      }
    },
    setUnderline(){
      if (document.queryCommandState("underline")) {
        document.execCommand("underline", false, null);
        document.execCommand("insertHTML", false, "&zwnj;");
      } else {
        document.execCommand("underline", false, null);
      }
    },
    setItalic(){
      if (document.queryCommandState("italic")) {
        document.execCommand("italic", false, null);
        document.execCommand("insertHTML", false, "&zwnj;");
      } else {
        document.execCommand("italic", false, null);
      }
    },
    iconClick(event, type, dropType) {
      event.preventDefault();
      console.log(event);
      this.$refs.editor.focus();
      // let $el=this.$refs.editor;
      // this.keepLastIndex($el);
      this.selectedRange = this.getSelect();
      if (event.target.classList.contains("active")) {
        //解决safari中文光标位置
        //获取光标所在位置的节点,
        console.log(
          window.getSelection().getRangeAt(0).startContainer.parentElement
        );
        let el = window.getSelection().getRangeAt(0).startContainer
          .parentElement;
        // let span=document.createElement('span');
        // this.insertAfter(span,el);
        // console.log(el);
        // el.focus();
        // var selection = window.getSelection();
        // let span = document.createElement("span");
        // let range = document.createRange();
        // range.collapse(false);
        // range.insertNode(span);
        // selection.removeAllRanges(); /*清空所有Range对象*/
        // range.setStart(
        //   span,
        //   0
        // );
        // range.setEnd(
        //    span,
        //     1
        // );
        // selection.addRange(range);
        // this.placeCaretAtEnd(span);
      }
      // 恢复光标
      // this.restoreSelection();
      // 恢复光标
      // this.restoreSelection();
      // 修改所选区域的样式
      this.changeStyle(type);
      this.$nextTick(() => {
        // if (dropType) {//下拉菜单的type
        //   type = dropType
        // }
        //改变当前元素的样式
        let sourceArr = JSON.parse(JSON.stringify(this.iconList));
        let arr = sourceArr.map((val, index) => {
          if (type === val.type && val.canChoose) {
            val.choose = val.choose ? false : true;
          }
          // else {
          //   if (val.drop) {
          //     val.choose = false;
          //   }
          // }
          return val;
        });

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
        this.iconList = arr;
      });
    },
    //获取选中
    getSelect() {
      if (window.getSelection) {
        /*主流的浏览器，包括chrome、Mozilla、Safari*/
        var sel = window.getSelection();
        console.log(sel.getRangeAt(0));
        if (sel.rangeCount > 0) {
          return sel.getRangeAt(0);
        }
      } else if (document.selection) {
        /*IE下的处理*/
        return document.selection.createRange();
      }
      return null;
    },
    placeCaretAtEnd(el) {
      //传入光标要去的jq节点对象
      el.focus();
      if (
        typeof window.getSelection != "undefined" &&
        typeof document.createRange != "undefined"
      ) {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    },
    restoreSelection() {
      var selection = window.getSelection();
      console.log(this.selectedRange);
      let range = document.createRange();
      if (this.selectedRange) {
        try {
          selection.removeAllRanges(); /*清空所有Range对象*/
          range.setStart(
            this.selectedRange.startContainer,
            this.selectedRange.startOffset
          );
          range.setEnd(
            this.selectedRange.endContainer,
            this.selectedRange.endOffset
          );
        } catch (ex) {
          /*IE*/
          document.body.createTextRange().select();
          document.selection.empty();
        }
        /*恢复保存的范围*/
        selection.addRange(this.selectedRange);
      }
    },
    returnPage() {
      this.$router.go(-1);
    },
    editChange() {
      // console.log(this.$refs.editor.children);
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
    async pasteText(e) {
      e.stopPropagation();
      e.preventDefault();
      let text;
      if (navigator.clipboard) {
        text = await navigator.clipboard.readText();
      } else {
        text = e.clipboardData.getData("text/plain");
      }
      let self = this;

      // 在等待一段时间后，在当前光标位置，粘贴处理后的文本
      setTimeout(function() {
        let selection = document.getSelection();
        let cursorPos = selection.anchorOffset;
        let oldContent = selection.anchorNode.nodeValue;
        // 通过 Dom 去除所有样式
        // let oDiv = document.createElement("div");
        // oDiv.innerHTML = pasteData;
        let toInsert = text;
        let newContent =
          oldContent.substring(0, cursorPos) +
          toInsert +
          oldContent.substring(cursorPos);
        selection.anchorNode.nodeValue = newContent;
        // if(window.navigator.userAgent.indexOf('AppleWebKit')>-1){
        let rag = document.createRange();
        rag.selectNodeContents(selection.anchorNode); //必须传node
        rag.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rag);

        // }
        // console.log(selection);
        // let range=selection.getRangeAt(0);
        // range.setStart(range.startContainer,parseInt(cursorPos+toInsert.length));
        // console.log(range);
      }, 200);
      return false;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-edit i {
  font-style: italic !important;
}
.content-edit b {
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
.upload-header .center {
  text-align: center;
}
.upload-header .right {
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
  -webkit-user-select: text;
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
.edit-tool .left .active {
  color: blue;
}
.edit-tool .right .active {
  border: 1px solid #c8c8c8;
}
.edit-tool .left {
  height: 144px;
  display: flex;
  align-items: center;
}
.edit-tool .right > div {
  float: left;
  overflow: hidden;
  margin-top: 15px;
}
.edit-tool .left input {
  display: block;
  width: 40px;
  padding: 14px 55px;
  border: none;
  font-size: 64px;
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
  padding: 0;
  display: block;
  overflow: hidden;
  width: 60px;
  height: 60px;
  border-radius: 100% 100% 100% 100%;
  -webkit-appearance: none;
  margin: 24px 24px;
  border: none;
}
.edit-tool .right .active {
  border: 10px solid #c8c8c8;
}
</style>
