<template>
    <div class="edit-div"
         v-bind:class="[type]"
         spellcheck=false
         v-html="innerText"
         :contenteditable="canEdit"
         @focus="focus"
         @blur="blur"
         @paste="pasteText"
         @keydown="onKeydown"
         @keypress="onKeypress"
         @click="onClick($event)"
         @input="changeText">
    </div>
</template>
<script type="text/ecmascript-6">
const MaxInputCount = 100; // 填空最长字数
export default {
    name: 'EditDiv',
    props: {
        value: {
            type: String,
            default: '',
        },
        canEdit: {
            type: Boolean,
            default: true,
        },
        setting: {
            type: Object,
        },
        type: {
            type: String,
            default: 'normal', // normal普通输入框, tk_normal 一般填空答案.连词成句句子.完型填空选项 , tk_special 特殊填空答案, tk_subject 主观填空, tk_choiceword 选择填空选项干扰项, option 单选多选排序选项
        },
    },
    data () {
        return {
            innerText: this.value,
            isLocked: false,
        };
    },
    watch: {
        'value' () {
            // console.log('value', !this.isLocked, !this.innerText);
            // if (!this.isLocked || !this.innerText) {
            if (!this.isLocked) {
                this.innerText = this.value;
            }
            if (this.innerText === '' && this.value === '') {
                this.$el.innerHTML = '';
            }
            // 不等的时候等于, 撤销后插入图片再次插入出现
            if (this.$el.innerHTML !== this.value) {
                this.$el.innerHTML = this.value;
            }

            // 特殊填空区判断字符
            if (this.type === 'tk_special') {
                // 处理正则
                if (this.getBLen(this.value) > 2) {
                    this.$message.error('特殊填空区仅能输入两个字符');
                    let str = this.$el.innerHTML;
                    str = str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                    if (str.length >= 2 && this.getBLen(str[0]) === 1 && this.getBLen(str[1]) === 1) {
                        this.$el.innerHTML = str[0] + str[1];
                    } else {
                        this.$el.innerHTML = str[0];
                    }
                    // 回调触发文档修改
                    this.changeText();
                    this.moveCursorEnd();
                }
            } else if (this.type === 'tk_normal') {
                let str = this.$el.innerText;
                if (str.length > MaxInputCount) {
                    this.$message.error('输入的文本最多输入' + MaxInputCount + '个字');
                    this.$el.innerHTML = str.substring(0, MaxInputCount);
                    // 回调触发文档修改
                    this.changeText();
                    this.moveCursorEnd();
                }
            } else if (this.type === 'tk_subject') {
                let str = this.$el.innerHTML.split(new RegExp('(<img[^>]*>)', 'gim'));
                // 没有图片
                if (str.length === 1 && str[0].length > MaxInputCount) {
                    this.$message.error('输入的文本最多输入' + MaxInputCount + '个字');
                    this.$el.innerHTML = str[0].substring(0, MaxInputCount);
                    // 回调触发文档修改
                    this.changeText();
                    this.moveCursorEnd();
                } else if (str.length === 3 && (str[0].length + str[2].length) > MaxInputCount) { // 有图片
                    this.$message.error('输入的文本最多输入' + MaxInputCount + '个字');
                    if (str[0].length >= MaxInputCount) {
                        this.$el.innerHTML = str[0].substring(0, MaxInputCount) + str[1];
                    } else {
                        this.$el.innerHTML = str[0] + str[1] + str[2].substring(0, MaxInputCount - str[0].length);
                    }
                    // 回调触发文档修改
                    this.changeText();
                    this.moveCursorEnd();
                }
            }
        },
    },
    mounted: function () {
    },
    methods: {
        // 点击事件
        onClick: function (e) {
            let target = e.target;
            if (target.tagName === 'IMG') {
                if (target.getAttribute('format') === 'latex') {
                    let selection = window.getSelection();
                    let range = selection.getRangeAt(0);
                    range.selectNode(target);
                    // 保存选区
                    let saveRange = this.$parent.$parent.saveRange || this.$parent.$parent.$parent.saveRange;
                    saveRange();
                    this.$ChoiceFinput(true, target.getAttribute('data'));
                } else {
                    this.blur();
                    // 移动父组件滚动条
                    this.moveParentScroll(target);
                    this.$resizer(target, 'IMG', () => {
                        // 回调触发文档修改
                        this.changeText();
                        // console.log(2222, this.$el.innerHTML, this.innerText);
                    });
                }
            } else if (target.tagName === 'I' && target.parentNode.tagName === 'DATA') {
                let url = target.parentNode.getAttribute('url');
                this.$tcplayer(url);
                // 当前页面所有audio暂停
                let allaudio = document.querySelectorAll('audio');
                for (let i = 0; i < allaudio.length; i++) {
                    allaudio[i].pause();
                }
            } else {
                // 向上循环找到svg
                while (target !== this.$el) {
                    if (target.tagName === 'svg') {
                        // 失去焦点让工具条变灰色
                        this.blur();
                        // 获取工具条的位置并设置到拖动层上方
                        let leftBn = document.querySelector('div.qti_editor .header .left-bn');
                        // 移动父组件滚动条
                        this.moveParentScroll(target);

                        let pos = leftBn.getBoundingClientRect();
                        leftBn.style.top = pos.top + 'px';
                        leftBn.style.left = pos.left + 'px';
                        // 保存svg对象
                        this.setting.svgTarget = target;
                        // 设置浮动按钮位置
                        this.$resizer(target, 'svg', () => {
                            // 回调触发文档修改
                            this.changeText();
                            // svg对象置null
                            this.setting.svgTarget = null;
                            // console.log(2222, this.$el.innerHTML, this.innerText);
                        });
                    }
                    target = target.parentNode;
                }
            }
        },
        // 移动父组件的滚动条
        moveParentScroll: function (target) {
            // 计算父窗口滚动条
            let parentNode = this.$parent.$el;
            var parentPos = parentNode.getBoundingClientRect();
            var targetPos = target.getBoundingClientRect();
            // 当对象高度小于父窗口高度时
            if (targetPos.y < parentPos.y) {
                parentNode.scrollTop = parentNode.scrollTop - (parentPos.y - targetPos.y);
            }
            // 当对象高度大于于父窗口高度时
            if (targetPos.y + targetPos.height > parentPos.y + parentPos.height) {
                parentNode.scrollTop = parentNode.scrollTop - ((parentPos.y + parentPos.height) - (targetPos.y + targetPos.height));
            }
        },
        // 获取焦点
        focus: function () {
            this.isLocked = true;
            this.setting.isFocus = true;
            if (this.type === 'tk_special') {
                this.setting.isTkFocus = false;
                this.setting.isFocus = false;
                this.setting.isTkNormalFocus = false;
                this.setting.isTkCWFocus = false;
            }
            if (this.type === 'tk_subject') {
                this.setting.isTkFocus = true;
                this.setting.isFocus = false;
                this.setting.isTkNormalFocus = false;
                this.setting.isTkCWFocus = false;
            }
            if (this.type === 'tk_normal') {
                this.setting.isTkFocus = false;
                this.setting.isFocus = false;
                this.setting.isTkNormalFocus = true;
                this.setting.isTkCWFocus = false;
            }
            if (this.type === 'tk_choiceword') {
                this.setting.isTkFocus = false;
                this.setting.isFocus = false;
                this.setting.isTkNormalFocus = true;
                this.setting.isTkCWFocus = true;
            }
            if (this.type.includes('option')) {
                this.setting.isOptionFocus = true;
            }
            if (this.type === 'line_option') {
                this.setting.isLineOptionFocus = true;
            }
            // console.log(1111, this.setting.isFocus);
        },
        // 失去焦点
        blur: function () {
            this.isLocked = false;
            this.setting.isFocus = false;
            this.setting.isTkFocus = false;
            this.setting.isTkNormalFocus = false;
            this.setting.isTkCWFocus = false;
            this.setting.isOptionFocus = false;
            this.setting.isLineOptionFocus = false;
            // console.log(2222, this.setting.isFocus);
        },
        changeText () {
            if (this.$el.innerHTML === '<br>') {
                this.$el.innerHTML = '';
            }
            this.$emit('input', this.$el.innerHTML);
        },
        // 过滤html
        cleanWordChr: function (html, type) {
            if (!!type && type === 'text') {
                if (html.indexOf('\n') >= 0) {
                    html = html.replace(new RegExp('^(\\r\\n|\\r|\\n){1,}', 'gim'), '');
                    html = html.replace(new RegExp('(\\r\\n|\\r|\\n){1,}$', 'gim'), '');
                    html = html.replace(new RegExp('(\\r\\n|\\r|\\n)', 'gim'), this.type.indexOf('tk_') >= 0 ? '' : '<br>');
                    // 将全角空格替换为普通空格
                    html = html.replace(new RegExp('(　)', 'gim'), '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
                // 文本格式，直接返回
                return html;
            }
            // 去除本地图片
            // html = html.replace(new RegExp('<img[^>]*\\s+src=\\"file:\\/\\/\\/[^\\"]*\\"[^>]*>', 'gim'), '');

            html = this.dofilterWordTag(html);
            console.log(555, html);
            // html = html.replace(new RegExp('<div ' , "gim") , "<p ");
            // html = html.replace(new RegExp('</div>' , "gim") , "</p>");

            // html = html.replace(/<(?!img|embed).*?>/ig, '');
            // console.log(2333, html.indexOf('\n'));
            // html = html.replace(new RegExp('^(\\r\\n|\\r|\\n){1,}', 'gim'), '');
            // html = html.replace(new RegExp('\\s*(\\r\\n|\\r|\\n){1,}$', 'gim'), '');
            // console.log(555, html.indexOf('\n'));
            // 去掉前后空格
            // html = html.replace(/^\s+|\s+$/gm, '');

            // 去除图片的多余格式
            html = html.replace(new RegExp('<img([^>]*)\\s+src=\\"([^\\"]*)\\"([^>]*)>', 'gim'), '<img src="$2" $1 $3>');
            html = html.replace(new RegExp('<(img\\s+src=\\"[^\\"]*\\")([^>]*)width=\\"([^>]*)\\"([^>]*)>', 'gim'), '<$1 width="$3" $2 $4>');
            html = html.replace(new RegExp('<(img[^>]*width=\\"[^\\"]*\\")[^>]*height=\\"([^>]*)\\"[^>]*>', 'gim'), '<$1 height="$2">');

            // 有无换行
            if (html.indexOf('\n') >= 0) {
                html = html.replace(new RegExp('(\\r\\n|\\r|\\n)', 'gim'), '<br>');
            }
            return html;
        },
        // 过滤word标签
        dofilterWordTag: function (str) {
            console.log(111, str);
            str = str.replace(/<xml>[\s\S]*?<\/xml>/ig, '');
            str = str.replace(/<style>[\s\S]*?<\/style>/ig, '');
            str = str.replace(new RegExp('<(img[^>]*)>', 'gim'), '{##@@$1@@##}');
            str = str.replace(new RegExp('<(img[^>]*format[^>]*)>', 'gim'), '{##@@$1@@##}');
            // 删除style
            str = str.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/g, '');
            // 连线题选项删除音频视频
            if (this.setting.isLineOptionFocus) {
                str = str.replace(/<audio(.*?)\/audio>/g, '');
                str = str.replace(/<data([^>]*?)type="video"([^>]*?)>(.*?)<\/data>/g, '');
            }
            str = str.replace(/<audio(.*?)\/audio>/g, function (match, g1) { return '##audio@@' + encodeURI(match) + '@@audio##'; });

            str = str.replace(/<data([^>]*?)type="video"([^>]*?)>(.*?)<\/data>/g, function (match, g1) { return '##data@@' + encodeURI(match) + '@@data##'; });

            // str = str.replace(/<svg(.*?)\/svg>/g, function (match, g1) { return '##svg@@' + encodeURI(match) + '@@svg##'; });
            str = str.replace(/<svg([^>]*?)data-shape="(.*?)">(.*?)<\/svg>/g, function (match, g1) { return '##svg@@' + encodeURI(match) + '@@svg##'; });

            // str = str.replace(/<span(.*?)class="pinyin(.*?)>(.*?)<\/span>/g, function (match, g1) { return '##pinyin@@' + encodeURI(match) + '@@pinyin##'; });
            str = str.replace(/<span([^>]*?)class="pinyin([^>]*?)>(.*?)<\/span>/g, function (match, g1) { return '##pinyin@@' + encodeURI(match) + '@@pinyin##'; });

            str = str.replace(/<br.*?>/g, '\n');

            str = str.replace(/<\/?[^>]*>/g, '');

            str = str.replace(/<div/g, '\n<div');
            str = str.replace(/<p/g, '\n<p');

            str = str.replace(/##audio@@(.*?)@@audio##/g, function (match, g1) { return decodeURI(g1); });
            str = str.replace(/##data@@(.*?)@@data##/g, function (match, g1) { return decodeURI(g1); });
            str = str.replace(/##svg@@(.*?)@@svg##/g, function (match, g1) { return decodeURI(g1); });
            str = str.replace(/##pinyin@@(.*?)@@pinyin##/g, function (match, g1) { return decodeURI(g1); });

            str = str.replace(new RegExp('{##@@([^@]*)@@##}', 'gim'), '<$1>');

            str = str.replace(/[ | ]*\n/g, '\n');

            str = str.replace(/&nbsp;/ig, '');

            // str = str.replace(/<meta(\n|.)*?>/ig, '');
            // str = str.replace(/<!(\n|.)*?>/ig, '');
            // str = str.replace(/<style[^>]*>(\n|.)*?<\/style>/ig, '');
            // str = str.replace(/<script[^>]*>(\n|.)*?<\/script>/ig, '');
            // str = str.replace(/<w:[^>]+>(\n|.)*?<\/w:[^>]+>/ig, '');
            // str = str.replace(/<xml>(\n|.)*?<\/xml>/ig, '');
            str = str.replace(new RegExp('(\\r\\n|\\r|\\n){1,}', 'gim'), '\n');
            // 去掉前后空格
            str = str.replace(/^\s+|\s+$/gm, '');
            // 结尾是svg加空格
            if (str.lastIndexOf('</svg>') > 0 && str.lastIndexOf('</svg>') === str.length - 6) {
                str = str + ' ';
            }
            // 结尾是data加空格
            if (str.lastIndexOf('</data>') > 0 && str.lastIndexOf('</data>') === str.length - 7) {
                str = str + ' ';
            }
            // 结尾是audio加空格
            if (str.lastIndexOf('</audio>') > 0 && str.lastIndexOf('</audio>') === str.length - 8) {
                str = str + ' ';
            }
            str = str.replace(/<span [^>/]*?class="pinyin" [^>/]*>(.*?)\/span>/g, function (match, g1) {
                // 删除style
                match = match.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/g, '');
                // 删除br
                match = match.replace(new RegExp('<(br[^>]*)>', 'gim'), '');
                // 加空格
                return match + ' ';
            });
            return str;
        },
        // 处理粘贴
        pasteText: function (e) {
            // 图片选中 不能粘贴
            if (this.$isResizer()) {
                e.preventDefault();
                return;
            }
            if (!(e.clipboardData && e.clipboardData.items)) {
                return;
            }

            for (let i = 0, len = e.clipboardData.items.length; i < len; i++) {
                let item = e.clipboardData.items[i];

                if (item.kind === 'string') {
                    e.preventDefault();
                    // let test = (e.originalEvent || e).clipboardData.getData('text');
                    // console.log(111, test);
                    // test = (e.originalEvent || e).clipboardData.getData('text/html');
                    // console.log(222, test);
                    // test = (e.originalEvent || e).clipboardData.getData('text/plain');
                    // console.log(333, test);
                    let text = (e.originalEvent || e).clipboardData.getData('text/html');
                    if (text === '' || this.type.indexOf('tk_') >= 0) { // 填空题答案类 纯文本粘贴
                        text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        console.log('clipboardData.getData("text/html")==""', text);
                        // 粘贴只能用document.execCommand
                        // document.execCommand('insertHTML', false, this.cleanWordChr(text, 'text'));
                        this.$editorInsert(this.cleanWordChr(text, 'text'));
                        return;
                    }
                    // console.log(7777, text);
                    // 创建临时span
                    let tmpspan = document.createElement('span');
                    tmpspan.innerHTML = text;

                    let formathtml = this.cleanWordChr(tmpspan.innerHTML);

                    // 纯标签加空格
                    if (formathtml.replace(/<\/?[^>]*>/g, '') === '') {
                        formathtml = formathtml + ' ';
                    }
                    // 已有的图片(不包含公式, 视频里的图片)
                    let allimg = this.$el.querySelectorAll('img:not([format]):not([type])');
                    // 粘贴板里的图片
                    let imglength = 0;
                    let imgtmp = formathtml.match(/<img([^>]*)>/g);
                    if (imgtmp) {
                        imglength = imgtmp.length;
                        // 不算公式和视频里的
                        imgtmp = formathtml.match(/<(img[^>]*format[^>]*)>/g);
                        if (imgtmp) {
                            imglength = imglength - imgtmp;
                        }
                        imgtmp = formathtml.match(/<(img[^>]*type[^>]*)>/g);
                        if (imgtmp) {
                            imglength = imglength - imgtmp;
                        }
                    }
                    if (this.type === 'normal' && allimg.length + imglength > 5) {
                        this.$message.error('最多添加5张图片');
                        e.preventDefault();
                        return;
                    }
                    if (this.type.includes('option') && allimg.length + imglength > 3) {
                        this.$message.error('最多添加3张图片');
                        e.preventDefault();
                        return;
                    }

                    // 处理音频
                    let allaudio = this.$el.querySelectorAll('audio');
                    // 粘贴板里的音频
                    let audiolength = 0;
                    let audiotmp = formathtml.match(/<audio(.*?)\/audio>/g);
                    if (audiotmp) {
                        audiolength = audiotmp.length;
                    }
                    if (allaudio.length + audiolength > 3) {
                        this.$message.error('最多添加3个音频');
                        e.preventDefault();
                        return;
                    }

                    // 处理视频
                    let allvideo = this.$el.querySelectorAll('data[type]');
                    // 粘贴板里的视频
                    let videolength = 0;
                    let videotmp = formathtml.match(/<data([^>]*?)type="video"([^>]*?)>(.*?)<\/data>/g);
                    if (videotmp) {
                        videolength = videotmp.length;
                    }
                    if (allvideo.length + videolength > 1) {
                        this.$message.error('最多添加1个视频');
                        e.preventDefault();
                        return;
                    }
                    // 粘贴只能用document.execCommand
                    // document.execCommand('insertHTML', false, formathtml);
                    // 替换后忘了上一行注释产生原因, 上一行代码保留
                    this.$editorInsert(formathtml);
                    // tempdiv.outerHTML = this.cleanWordChr(formathtml);
                    return;
                } else if (item.kind === 'file') {
                    e.preventDefault();
                    let f = item.getAsFile();
                    let type = f.type;
                    // 图片
                    if (type.indexOf('image/') >= 0) {
                        let allimg = this.$el.querySelectorAll('img:not([format]):not([type])');
                        if (this.type === 'normal' && allimg.length >= 5) {
                            this.$message.error('最多添加5张图片');
                            e.preventDefault();
                            return;
                        }
                        if (this.type.includes('option') && allimg.length >= 3) {
                            this.$message.error('最多添加3张图片');
                            e.preventDefault();
                            return;
                        }

                        // 保存选区
                        let saveRange = this.$parent.$parent.saveRange || this.$parent.$parent.$parent.saveRange;
                        saveRange();
                        // 查找qtiEditor的uploadFile方法
                        let upload = this.$parent.$parent.uploadFile || this.$parent.$parent.$parent.uploadFile;
                        // 上传图片
                        upload(f, f.name, 'qti/qtiImg');
                    }
                    console.log(222, f);
                }
            }
        },
        // 处理删除键
        onKeydown: function (event) {
            if (navigator.userAgent.indexOf('Firefox') > 0) {
                // delete按键
                if (event && event.keyCode === 46) {
                    let selection = window.getSelection();
                    let nextnode = selection.focusNode.nextElementSibling;
                    if (nextnode && (selection.focusOffset === selection.focusNode.length) && (nextnode.tagName === 'svg' || (nextnode.tagName === 'SPAN' && nextnode.className.indexOf('pinyin') >= 0) || nextnode.tagName === 'DATA')) {
                        nextnode.remove();
                        event.preventDefault();
                        // 回调触发文档修改
                        this.changeText();
                    }
                }
                // 退格键
                if (event && event.keyCode === 8) {
                    let selection = window.getSelection();
                    let prevnode = selection.focusNode.previousSibling;

                    if (prevnode && selection.focusOffset <= 1 && (prevnode.tagName === 'svg' || (prevnode.tagName === 'SPAN' && prevnode.className.indexOf('pinyin') >= 0) || prevnode.tagName === 'DATA' || prevnode.tagName === 'POS' || prevnode.tagName === 'AUDIO')) {
                        prevnode.remove();
                        event.preventDefault();
                        // 回调触发文档修改
                        this.changeText();
                    }

                    if (prevnode && selection.focusNode.tagName === 'DIV') {
                        let node = selection.focusNode.childNodes[selection.focusOffset - 1];
                        if (node && (node.tagName === 'svg' || (node.tagName === 'SPAN' && node.className.indexOf('pinyin') >= 0) || node.tagName === 'DATA' || node.tagName === 'POS' || prevnode.tagName === 'AUDIO')) {
                            node.remove();
                            event.preventDefault();
                            // 回调触发文档修改
                            this.changeText();
                        }
                    }
                }
            } else {
                // 退格键
                if (event && event.keyCode === 8) {
                    let selection = window.getSelection();
                    if (selection.focusOffset === 1 && selection.focusNode.parentNode.nodeName !== 'DIV') {
                        selection.focusNode.parentNode.remove();
                        event.preventDefault();
                        // 回调触发文档修改
                        this.changeText();
                    }
                }
            }
        },
        // 处理回车
        onKeypress: function (event) {
            // 图片选中 阻止keypress事件
            if (this.$isResizer()) {
                event.preventDefault();
                return;
            }
            // 填空选中 阻止keypress事件
            if (event && event.keyCode === 13 && this.type.indexOf('tk_') >= 0) {
                event.preventDefault();
                return;
            }
            if (event && event.keyCode === 13) {
                // 插入换行
                // document.execCommand('insertHTML', false, '<br>');

                let selection = window.getSelection();
                let nextnode = selection.focusNode.nextElementSibling;

                // 判断光标所在节点后一个节点没有br
                if (nextnode && nextnode.tagName !== 'DIV') {
                    this.$editorInsert('<br>');
                } else {
                    // 判断选区为空或为最后的时候
                    if (this.$el.innerHTML === '' || selection.focusNode.nodeName === 'DIV' || selection.anchorOffset === selection.anchorNode.length || selection.focusOffset === selection.focusNode.length) {
                        if (selection.focusNode && selection.focusNode.parentNode.nodeName === 'SPAN' && selection.focusNode.parentNode.nextElementSibling) {
                            this.$editorInsert('<br>');
                        } else {
                            if (selection.focusNode.nodeName === 'DIV' && (selection.focusNode.lastElementChild && selection.focusNode.lastElementChild.nodeName === 'BR')) {
                                this.$editorInsert('<br>');
                            } else {
                                if (navigator.userAgent.indexOf('Firefox') > 0) {
                                    this.$editorInsert('<br>');
                                } else {
                                    let nextpnode = this.getNextNode(selection.focusNode);
                                    if (nextpnode && nextpnode.tagName !== 'DIV') {
                                        this.$editorInsert('<br>');
                                    } else {
                                        this.$editorInsert('<br><br>');
                                    }
                                }
                            }
                        }
                    } else {
                        this.$editorInsert('<br>');
                    }
                }

                event.preventDefault();
            }
        },
        // 获取下一个节点
        getNextNode: function (obj) {
            if (obj.nextElementSibling === null) {
                return this.getNextNode(obj.parentNode);
            } else {
                return obj.nextElementSibling;
            }
        },
        // 计算字符长度
        getBLen: function (str) {
            // str = str.replace(/&lt;&gt;/g, "<");
            str = str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            if (str == null) return 0;
            if (typeof str !== 'string') {
                str += '';
            }
            // eslint-disable-next-line no-control-regex
            let length = str.replace(/[^\x00-\xff]/g, '01').length;
            return length;
        },
        // 移动光标到最后
        moveCursorEnd: function () {
            var sel = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(this.$el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        },
    },
};
</script>
