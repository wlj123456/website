$(document).ready(function(){
    dateInit('#entryBeginTime','#entryEndTime');
    dateInit('#beginTime','#endTime');
    // getComp("#firmId");
});

//时间大小比较
function dateCompare(start,end){
    var d1 = new Date(start.replace(/\-/g, "\/")); 
    var d2 = new Date(end.replace(/\-/g, "\/")); 
    if(start!=""&&end!=""&&d1 >d2) { 
        return false;
    }else{
        return true;
    }
}
//保存
blurCheck("#newForm");
$('.form_datetime input').click(function(){
    console.info($(this).val())
    if($(this).val()){
        $(this).siblings('.error').hide();
    }
});
function save(){
    
    if($("#newForm").valid()){
        //将富文本编辑器内容复制给input[name=content
        // 读取 html
       // console.info(if(!editor.txt.html()))

        if(!editor.txt.text()){ $('#content').siblings('.error').show();return false;} else { $('#content').siblings('.error').hide(); }
        $("#content").val(editor.txt.html());

        // $('#beginTime').val($('#begin').val());
        // $('#endTime').val($('#end').val());
        // $('#entryBeginTime').val($('#sign_begin').val());
        // $('#entryEndTime').val($('#sign_end').val());

        var form = new FormData($("#newForm")[0]);
        $.ajax({
            type:'post',
            url:  DMBServer_url + '/web/api/activity/add.json',
            data:form,
            contentType: false,
            processData: false,
            success:function(data){
                if(data.code === 0){
                    returnMessage(1,'添加成功');
                }else{
                    returnMessage(2,data.message);
                }
            },
            beforeSend:function(xhr){
                $('.opering-mask').show().find('.con').text('正在处理中，处理结束后该弹窗消失！');
            },
            complete:function(){
                $('.opering-mask').hide();
            },
            error:function(data){
                //报错提醒框
                returnMessage(2,'添加失败');
            }
        });
    }
}

//富文本编辑器
var wangEditor = window.wangEditor;
var editor = new wangEditor('#editor_id');  //ID元素
editor.customConfig.uploadImgShowBase64 = true;   // 使用 base64 保存图片
// 自定义菜单配置
editor.customConfig.menus = [
    'head',  // 标题
    'bold',  // 粗体
    'italic',  // 斜体
    'underline',  // 下划线
    'strikeThrough',  // 删除线
    'foreColor',  // 文字颜色
    'backColor',  // 背景颜色
    'link',  // 插入链接
    'list',  // 列表
    'justify',  // 对齐方式
    'quote',  // 引用
    // 'emoticon',  // 表情
    'image',  // 插入图片
    'table',  // 表格
    'video',  // 插入视频
    'code',  // 插入代码
    'undo',  // 撤销
    'redo'  // 重复
];
// 上传图片
//    editor.config.uploadImgUrl = '/upload';
//    editor.config.uploadParams = {
//        // token1: 'abcde',
//        // token2: '12345'
//    };
// onchange 事件
editor.customConfig.onchange = function (html) {
    // html 即变化之后的内容
    console.log(editor.txt.html())
};
editor.create();   //开启（初始化），需要放在最后
$(".w-e-toolbar ,.w-e-menu").css("z-index",1001);
$(".w-e-text-container").css("z-index",1000);  



//****************************************************************** 人员搜索*********************************************
//****************************************************************** 人员搜索*********************************************
//****************************************************************** 人员搜索*********************************************
var pageNum = 10;//每次页数
var paGe = 0;   //第几页  修改时，出现在被修改页面
var flag = null;
var dataID=null;//账号的id
//单击弹出账号人员名单
function userList(){
    load(paGe,{page:paGe,size:pageNum});
    $(".pic-review-edit").addClass("show").addClass("in");
}
function load(page,data){
    var pageCount,vpage;   //初始的
    //如果有keyword，则说明是搜索
    if(data!=undefined){
        $.ajax({
            type:'get',
            url: DMBServer_url + '/web/api/users.json',
            data:data,
            dataType:'json',
            success:function(data){
                $("#userlist_tab .list").empty();
                if(data.code === 0){
                    var html='';
                    $.each(data.data.items,function(index,item){
                        //阶段 0:群众,10:积极份子,20:重点对象,30预备党员,100党员
                        var stage=item.type==0?"群众":item.type==10?"积极分子":item.type==20?"重点对象":item.type==30?"预备党员":"党员";
                        html+='<tr><td><input name="user" data-id="'+item.id+'" type="radio"></td><td>'+item.userName+'</td><td>'+item.name+'</td><td>'+item.phone+'</td><td data-type="'+item.type+'">'+stage+'</td><td>'+item.organName+'</td></tr>';
                    });
                    $("#userlist_tab .list").append(html);
                    //分页
                    pageCount = data.data.pageCount;
                    vpage = pageCount>10?10:pageCount;
                    var keyword = $("#keyword").val();
                    if(keyword=="undefined")keyword=null;
                    if(pageCount>1){
                        $('.pages').show();
                        flag = true;
                        initPagination('#pagination',pageCount,vpage,page+1,function(num,type){
                            if(type === 'change'){
                                paGe = num - 1;
                                load(paGe,{page:paGe,size:pageNum,keyword:keyword});
                            }
                        });
                    }else{
                        if(flag) {
                            paGe = 0;
                            load(paGe,{page:paGe,size:pageNum,keyword:keyword});
                            flag = false;
                            $('.pages').hide();
                        }
                    }
                }else{
                    //无数据提醒框
                    returnMessage(2,'暂无数据！');
                    $('.pages').hide();

                }
            },
            error:function(data){
                //报错提醒框
                returnMessage(2,'报错：' +  data.status);
            }
        });
    }
}
//搜索查询
function search(size){
    var keyword = $("#keyword").val();
    //开始时显示数据
    var dataObject = {
        page:0,
        size:size,
        keyword:keyword
    };
    if(dataObject.keyword!=undefined){
        load(0,dataObject);
    }
}
/*跳转到第几页*/
function pageTo(_this){
    var max=parseInt($(_this).parents('.pageGo').siblings('.pagination').find('li.next').prev().text());
    var val=parseInt($(_this).siblings('input').val());
    var num=(val>0?val:1)>max?max:(val>0?val:1);
    paGe = num - 1;
    load(paGe,{page:paGe,size:pageNum});
    $(_this).siblings('input').val(num);
}
//选择账号的弹框 确定
function confirm(){
    var userlist_tab=$('#userlist_tab .list input[type=radio]:checked');
    if(userlist_tab.length!=0) {
        dataID = userlist_tab.attr("data-id");   //单选按钮
        var userName=$(userlist_tab.parents("tr").find("td")[2]).text();
        $("#userName").val(dataID); //用户ID
        $("#name").val(userName);   //用户姓名
        $(".pic-review-edit").removeClass("show").removeClass("in");
    }else{
        returnMessage(2,'请选择账号！');
    }
}
//取消
function cancel(){
    $(".pic-review-edit").removeClass("show").removeClass("in");
}







