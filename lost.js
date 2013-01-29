/**
 * Created with JetBrains PhpStorm.
 * User: lost
 * Date: 13-1-28
 * Time: 下午2:18
 * To change this template use File | Settings | File Templates.
 */


(function($){

    $.fn.extend({

        /** 图片左右滑动
         $("#wy_youxi_list").initSlideEffectLR(
         {
         btn_l:"slidel",
         btn_r:"slider",
         blockWidth:720,
         slide_pages:'slide_pages'
         }
         );
         */

        initSlideEffectLR:function(options){

            var _this = $(this);

            var _default = {btn_r:'',btn_l:'',blockWidth:0,slide_pages:''};//左移按钮id，右移按钮id，移动元素的父元素ID，分页按钮的父元素ID
            var _options = $.extend({},_default,options);

            //创建并设置父容器 隐藏超出边界的页面
            var mask = $("<div>").attr('id','slide_mask').css('width',_options.blockWidth+"px").css('overflow','hidden');
            _this.wrap(mask);

            var blocks = _this.children();
            var index = 0;//目前显示的元素索引
            var currentPage = 0;//当前页面为第一页

            var current_block = blocks[index];
            var movesteps = 0;//位移量

            function moveRight(step){
                nextindex = index + step;
                movesteps = _options.blockWidth * nextindex * -1;
                if(nextindex<3){
                    _this.animate({left:movesteps+"px"},"slow");
                    setPage(nextindex);
                    index += step;
                    currentPage = index;
                }
            }

            function moveLeft(step){
                nextindex = index - step;
                movesteps = _options.blockWidth * nextindex * -1;
                if(nextindex >= 0){
                    _this.animate({left:movesteps+"px"},"slow");
                    setPage(nextindex);
                    index -= step;
                    currentPage = index;
                }
            }

            //处理按钮事件
            $("#"+_options.btn_r).click(function(){
                moveRight(1);
            });

            $("#"+_options.btn_l).click(function(){
                moveLeft(1);
            });

            //处理分页事件
            var pages = $("#slide_pages").find("a");
            $(pages).each(function(i){
                $(this).click(function(){
                    if(i != currentPage){
                        step = i-currentPage;
                        if(step > 0)
                            moveRight(step);
                        else
                            moveLeft(Math.abs(step));
                    }
                })
            });
            setPage(0);//初始化分页

            function setPage(p){
                $(pages).each(function(i){
                    if(i == p){
                        $(this).css('color','#FFCC00');
                    }else{
                        $(this).css('color','white');
                    }
                });
            }
        }

        ,


        /**
         **图片等比缩放
         */
        image_uniform_scale:function(options){
            var _default = {percent:50,limit_width:200,limit_height:300};
            var _options = $.extend({},_default,options);

            return $(this).each(function(){

                var _this = $(this) ;

                if(parseInt(_options.percent) < 100){
                    _options.percent = _options.percent/100;
                }

                var images = _this.find("img");

                images.each(function(i){
                    //获取图片的宽和高
                    var _width = this.width;
                    var _height = this.height;
                    var limit_width = _options.limit_width;
                    var limit_height = _options.limit_height;
                    var new_width = 0;
                    var new_height = 0;
                    if( _width/_height >= limit_width/limit_height ){//以宽度为基准缩放

                        if( _width > limit_width){//开始缩放
                            new_width = limit_width;
                            new_height = (_height * limit_height)/_height;
                        }else{//当宽度小于限定宽度，直接返回原始数值。
                            new_width = _width;
                            new_height = _height;
                        }

                    }
                    else{//以高度为基准缩放
                        if( _height > limit_height ){//开始缩放
                            new_width = ( _width * limit_width )/_width;
                            new_height = limit_height;
                        }else{//当高度小于限定高度，直接返回原始数值。
                            new_width = _width;
                            new_height = _height;
                        }
                    }

                    this.width = new_width;
                    this.height = new_height;

                });
            });

        },

        /**
         *
         * 瀑布流方式
         */
        waterfall:function(options){
            /**
             **column:每行的元素个数
             width:图片的宽度
             space:每行元素之间的间隔
             borderStyle:边框样式  json格式
             loadParam 请惨遭lazyload方法参数
             resizelimit 最小列数
             divheight 结构里的p标签的高度需要给定
             clickEvent 想实现单个图片的click事件

             <span><img src="images/1.jpg" /><div>this is a test</div></span>
             */
            _default = {width:200,space:20,borderStyle:{},loadParam:{},resizelimit:3,divheight:30,clickEvent:null};
            _options = $.extend({},_default,options);

            var _this = $(this);

            var contain_top = _this.offset().top;//获取装载img的容器的left,top作为基准点
            var contain_left = _this.offset().left;

            //计算当前窗口能放入多少个格子
            _options.column = Math.floor(($(window).width()-contain_left-200)/_options.width);

            //计算所有照片有多少行
            //var _row = Math.ceil(nodes.length/4);

            _options.contain_top = contain_top;
            _options.contain_left = contain_left;
            _options.container = _this;
            _options.nodes = [];//总数组
            _options.currentlastindex = 0;
            _options.isResize = 0;
            _options.limit = _options.loadParam.limit;

            //初始化jquery对象的option供全局调用
            $._waterfall_options = _options;
            $.lazyload(_options.loadParam);

            //注册resize事件
            $(window).resize(function(){
                clearTimeout($._waterfall_options.isResize);
                $._waterfall_options.isResize = setTimeout("$._waterfall_resize("+")",100);
            });
        }
    });


    $.extend({

        _waterfall_options : {},

        _waterfall_event_bind:function(type,nodes){
                    switch(type){
                        case 'click' :
                                        if(typeof eval($._waterfall_options.clickEvent) != 'function')return;
                                        $(nodes).click($._waterfall_options.clickEvent);
                         break;
                    }
        }
        ,
        _waterfall_resize:function(){
                this._waterfall_options.currentlastindex = 0;
                var oldColumn = this._waterfall_options.column;
                this._waterfall_options.column = Math.floor(($(window).width()- this._waterfall_options.contain_left-100)/ this._waterfall_options.width);
                if(oldColumn != this._waterfall_options.column && this._waterfall_options.column >= this._waterfall_options.resizelimit){//如果列发生变化 则重新排列
                    $._waterfall_options.container.empty();
                    $._create_wait_tip();
                    var nodes = this._waterfall_options.nodes;
                    var newNodes = [];
                    //将图片放置到可视距离之外
                    $(nodes).each(function(i){
                            $(nodes[i]).css('position','absolute').css('top',-2000).css('left',-1000);
                    });
                    $._waterfall_options.container.append(nodes);

                    var _heights = [];
                    $(nodes).find('img').each(function(i){
                        //设置所有图片的宽度
                        $(this).css('width',$._waterfall_options.width);
                        //获取所有图片的高度
                        _heights.push($(this).css('height'));
                        $(nodes[i]).css('display','none');
                    });

                    $(nodes).each(function(i){
                        this.childNodes[0].style.cssText = '';
                        $(this).find('img').css('width',$._waterfall_options.width);
                        $(this).find('div').css('position','relative').css('height', $._waterfall_options.divheight+'px').css('overflow','hidden').css('width',$._waterfall_options.width);
                        //设置边框样式
                        $(this).css($._waterfall_options.borderStyle);
                        //此时所有已经渲染的图片在_waterfall_load方法中都已经load完成 所以不会触发load事件 所以不需要判断load事件
                        var _top = $._setTop(nodes,this,i,$._waterfall_options.contain_top,_heights);
                        var _left = $._setLeft(nodes,this,i,$._waterfall_options.contain_left);
                        //设置定位
                        $(this).css({'position':'absolute','left':_left,'top':_top,'width':$(this).find('img').css('width')});
                        $(this).fadeIn();
                        //设置node的高度和图片等高
                        $(this).css('height',$(this).find('img').height() + $._waterfall_options.divheight);
                        newNodes.push(nodes[i]);//每个node的图片参数left,top都会变化 所以要记录返回新的nodes给全局参数
                    });
                    this._waterfall_options.nodes = newNodes;
                    $._waterfall_event_bind('click',newNodes);
                    this._waterfall_options.currentlastindex = nodes.length;//把总数组的长度增加
                }
        },

        _waterfall_load:function(){
            var nodes = this._waterfall_options.nodes;
            var currentlastindex = this._waterfall_options.currentlastindex;
            //将图片放置到可视距离之外
            $(nodes).each(function(i){
                if(i >= currentlastindex){
                    $(nodes[i]).css('position','absolute').css('top',-2000).css('left',-1000);
                }
            });
            this._waterfall_options.container.append(nodes);

            //一次请求加载的图片个数
            var quatityOfReq = this._waterfall_options.limit;
            var quatityOfloadComplete = 0;
            //判断所有图片是否加载完成
            this._waterfall_options.container.find('img').load(function(){
                quatityOfloadComplete++;
                if(quatityOfloadComplete == quatityOfReq){//当加载完成最后一张图片时 触发排序
                    var _heights = [];
                    $(nodes).find('img').each(function(i){
                        //设置所有图片的宽度
                        $(this).css('width',$._waterfall_options.width);
                        //获取所有图片的高度
                        _heights.push($(this).css('height'));
                        if(i >= currentlastindex){
                            $(nodes[i]).css('display','none');
                        }
                    });

                    //开始计算单独照片的定位
                    $(nodes).each(function(i){
                        if(i >= currentlastindex){
                            this.childNodes[0].style.cssText = '';
                            $(this).find('img').css('width',$._waterfall_options.width);
                            $(this).find('div').css('position','relative').css('height', $._waterfall_options.divheight+'px').css('overflow','hidden').css('width',$._waterfall_options.width);
                            //设置边框样式
                            $(this).css($._waterfall_options.borderStyle);
                            var _top = $._setTop(nodes,this,i,$._waterfall_options.contain_top,_heights);
                            var _left = $._setLeft(nodes,this,i,$._waterfall_options.contain_left);

                            //设置定位
                            $(this).css({'left':_left,'top':_top,'width':$(this).find('img').css('width')});
                            $(this).fadeIn();

                            //设置node的高度和图片等高
                            $(this).css('height',$(this).find('img').height() + $._waterfall_options.divheight);
                        }
                    });
                }
            });

            this._waterfall_options.currentlastindex = nodes.length;//把总数组的长度增加
        }
        ,
        _setTop : function (nodes,node,index,contain_top,_heights){
            var new_top = contain_top;
            switch(index){
                case 0:;break;
                default:
                    var row = this._getRow(this._waterfall_options.column,index);//得到该元素在第几行
                    if(row > 1){
                        //计算上一行处于相同列索引的图片序号
                        //var offset = Math.abs(index - this._waterfall_options.column);
                        //上一行图片的top+上一行图片的高度
                        //new_top += $(nodes).eq(offset).find('img').offset().top + parseInt(_heights[offset]);
                        new_top += $._get_prev_top(index,_heights);
                    }
            }
            return new_top;
        }
        ,
        _setLeft : function (nodes,node,index,contain_left){
            var new_left = contain_left;
            switch(index){
                case 0:;break;
                default:
                    var column_index = this._columnIndexInRow(index);//得到该行的列索引

                    if(this._isRowFirst(index)){
                        new_left +=  (column_index-1) * this._waterfall_options.width;
                    }else{
                        new_left +=  (column_index-1) * (this._waterfall_options.width + this._waterfall_options.space);
                    }
            }
            return new_left;
        }
        ,
        _getRow : function (column,index){
            var row = 	Math.ceil((index+1)/column);
            return row;
        }
        ,
        _columnIndexInRow : function (index){
            var _options = this._waterfall_options;
            var index = (index+1)%_options.column;
            if(index == 0) return _options.column;
            return index;
        }
        ,
        _isRowFirst : function (index){//判断是不是该行的第一个元素
            var index = this._columnIndexInRow(index);
            if(index == 1)return true;
            return false;
        }
        ,

        _waterfall_callback:function(data){
            $("#wait_tip").remove();

            if($._lazyloadParam.waterfall && data!=''){
                //将html字符串转换为jquery对象
                var nodes = $._stringToObject(data);
                for(var i = 0;i<nodes.length;i++){
                    $._waterfall_options.nodes.push(nodes[i]);
                }
                $._waterfall_event_bind('click',nodes);
                $._waterfall_load();
            }
            $._lazyloadParam.start = $._lazyloadParam.start+$._lazyloadParam.limit;
            $._lazy_register();
        },

        _all_pre_index_in_row:function(index){//获取该行之前所有该列的索引
            var row = this._getRow(this._waterfall_options.column,index);
            var indexes = [];
            index += 1;
            var flag = 1;
            while(flag < row){
                var currentIndex = index - flag * this._waterfall_options.column;
                indexes.push(currentIndex);
                flag++;
            }
            return indexes;
        },

        _get_prev_top:function(index,_heights){//得到该行的top
                var indexes = this._all_pre_index_in_row(index);
                var space = indexes.length * this._waterfall_options.space
                var div = indexes.length * this._waterfall_options.divheight;
                var top = 0;
                for(var i=0 ;i < indexes.length;i++){
                    top += parseInt(_heights[ indexes[i]-1 ]);
                }
                //当元素为第一行时 是不需要加上space间隔的
                if((index+1)>this._waterfall_options.column){
                    top += space + div;
                }
                return top;
        },

        /**
         *     下啦刷新
         *     $(function(){
                    $.lazyload({
                        element:'#main',
                        url:'test.php',
                        type:'POST',
                        dataType:'html',
                        data:'op=next',
                        waterfall:false,
                        start:6,
                        limit:6,
                        callback:null//如果不是瀑布流 请实现回调函数
                });
                })
                使用瀑布流img标签外必须包裹span或者li
         */
         _lazyloadParam:{},

        lazyload:function(options){
            var _default = {element:'',url:'',type:'POST',dataType:'html',data:'',wait_img:'images/loading.gif',limit:15,waterfall:false,callback:null};
            var _options = $.extend({},_default,options);
            this._lazyloadParam = _options;
            this._lazy_register();
            this._lazy_load();
        },


        _lazy_load: function (){
                    this._lazy_destroy();//注销滚动条事件
                    var tip = this._create_wait_tip();//创建wait提示
                    $(this._lazyloadParam.element).after(tip);//放入wait提示
                    var data = this._lazyloadParam.data + '&limit='+this._lazyloadParam.limit;

                    //开始执行ajax请求
                    $.ajax({
                        url:$._lazyloadParam.url,
                        type:$._lazyloadParam.type,
                        dataType:$._lazyloadParam.dataType,
                        data:data,
                        success:function(data){
                            if(typeof eval($._lazyloadParam.callback) == 'function'){
                                eval($._lazyloadParam.callback+'()');
                            }else{
                                $._waterfall_callback(data);
                            }
                        }
                    });
         }


            ,


            _lazy_register: function (){//初始化 给浏览器绑定滚动事件
                if(window.attachEvent){//IE
                    window.attachEvent("onscroll",this._lazy_scroll,false);
                }else{//FF
                    window.addEventListener("scroll",this._lazy_scroll,false);
                }
            }

            ,


           _lazy_scroll: function (){//滚动条 开始滚动 并计算是否到达底部
                //判断滚动条滚到了网页最底部
                var a = document.documentElement.scrollTop==0? document.body.clientHeight : document.documentElement.clientHeight;
                var b = document.documentElement.scrollTop==0? document.body.scrollTop : document.documentElement.scrollTop;
                var c = document.documentElement.scrollTop==0? document.body.scrollHeight : document.documentElement.scrollHeight;

                if(a+b == c){
                    $._lazy_load();//开始加载
                }
            }

            ,


            _lazy_destroy:function (){//注销onscroll事件 防止加载数据的时候继续加载
                if(window.attachEvent){//ff
                    window.detachEvent("onscroll",this._lazy_scroll,false);
                }else{//ie
                    window.removeEventListener("scroll",this._lazy_scroll,false);
                }
            }

            ,

            _create_wait_tip:function (){
                var top = $(window).height() - 35;//浏览器窗口的高度(可视区域)
                return '<div id="wait_tip" style="border:1px #f5f5f5 solid;background-color:white;width:300px;left:50%;margin-left:-150px;line-height:35px;height:35px;position:fixed;z-index:10;text-align:center;vertical-align:middle;top:'+top+'px;font-size:12px"><b style="vertical-align: middle">正在加载...</b><img style="vertical-align: middle" src="'+this._lazyloadParam.wait_img+'" /></div>';
            }


           ,

            //将字符串html代码转换为jquery对象
           _stringToObject:function(string){
               var div = $("<div>").append(string);
               return $(div).children();
           }

    });



})(jQuery);