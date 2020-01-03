<template>
  <div class="edit-container">
     <header class="upload-header">
      <div class="left">
        <i></i>
      </div>
      <div class="center">编辑</div>
      <div class="right">保存</div>
    </header>
    <div class="title-edit">
        <input type="text">
    </div>
    <div class="content-edit" contenteditable="true">
sdasd
    </div>
    <div class="edit-tool">
        <div class="left">
            <i class="bold">B</i>
            <i class="bias">I</i>
            <i class="underline">U</i>
        </div>
        <div class="right">
            <span style="background:rgba(110,110,110,1);"></span>
            <span style="background:rgba(241,89,108,1);"></span>
            <span style="background:rgba(241,223,3,1);"></span>
            <span style="background:rgba(80,227,194,1);"></span>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EditModule",
  
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.title-edit{
  padding: 54px 58px 48px 58px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(216,216,216,1);
  font-size:42px;
  font-weight:600;
  color:rgba(54,54,54,1);
}
.title-edit input{
  font-weight:600;
  color:rgba(54,54,54,1);
  width: 100%;
  border:none;
}
.content-edit{
    height: 718px;
    padding: 48px 58px;
    box-sizing: border-box;
    overflow-y: scroll;
}
.edit-tool{
    padding: 0 58px;
    box-sizing: border-box;
    width: 100%;
    height:144px;
    display: flex;
    justify-content: space-between;
    border:1px solid rgba(218,218,218,1);
    border-left: none;
    border-right: none;
}
.edit-tool .left,.edit-tool .right{
    height:144px;
    display: flex;
    align-items: center;
}
.edit-tool .left i{
    display: block;
    padding: 14px 55px;
}
.edit-tool .left i:nth-child(1){
    padding: 14px 55px;
    padding-left: 14px
}
.underline{
    text-decoration: underline;
}
.edit-tool .right span{
    display: block;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 24px;
}
</style>
