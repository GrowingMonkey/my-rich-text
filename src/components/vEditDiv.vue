<template>
    <div class="edit-div"
         v-html="innerText"
         :contenteditable="canEdit"
         @focus="isLocked = true"
         @blur="isLocked = false"
         @input="changeText">
    </div>
</template>
<script type="text/ecmascript-6">
    export default{
        name: 'editDiv',
        props: {
            value: {
                type: String,
                default: ''
            },
            canEdit: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                innerText: this.value,
                isLocked: false
            }
        },
        watch: {
            'value'(){
                if (!this.isLocked || !this.innerText) {
                    this.innerText = this.value;
                }
            }
        },
        methods: {
            changeText(){
                this.$emit('input', this.$el.innerHTML);
            }
        }
    }
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
        &[contenteditable=true]{
            user-modify: read-write-plaintext-only;
            &:empty:before {
                content: attr(placeholder);
                display: block;
                color: #ccc;
            }
        }
    }
    .edit-div .img-box{
       width: 100%;
       text-align: center;
    }
    .edit-div .img-box img{
       padding: 55px 0;
       width: 100%;
    }
    .edit-div>p{
       line-height: 2;
    }
</style>