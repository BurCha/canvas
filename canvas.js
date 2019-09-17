var that = this;
var GR = function(){
    //给画布赋予大小
    var mycanvas = document.querySelector('canvas');
    mycanvas.width = document.body.clientWidth;
    mycanvas.height = document.body.clientHeight-10;
    // console.log('mycanvas.width'+mycanvas.width+'mycanvas.height'+mycanvas.height);
    /*canvas画布*/
    this.mycanvas = mycanvas;
    /*绘制工具*/
    this.ctx = document.querySelector('canvas').getContext('2d');
    /* 画布大小*/
    this.canvasWidth = this.ctx.canvas.width;
    this.canvasHeight = this.ctx.canvas.height;
    /*横屏、竖屏偏移量*/
    this.hvOffset = this.canvasWidth - this.canvasHeight;
    /*9个点的圆心坐标数组*/
    this.circleArr = [];
    /*圆半径*/
    this.radius = this.canvasHeight/ (this.hvOffset>0 ? 20 : 18);
    /*是否点击[按下鼠标]*/
    this.isMouseDown = false;
    /*起始点位置*/
    this.startX = 0;
    this.stateY = 0;
    /*已连接点数组*/
    this.linkPointArr = [];
    /*密码数组*/
    this.PWArr = [];
}
/*初始化*/
GR.prototype.init = function(){
    var that = this;
    //确定9个圆心位置
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            //如果是横屏 电脑
            if(this.hvOffset > 0){
                var p={
                    "x": j * this.canvasHeight/4 - this.canvasHeight/4 + this.canvasWidth/2,
                    "y": i * this.canvasHeight/3 + this.canvasHeight/6,
                    "state": 0, //1：当前点已被连接   0：当前点未被连接
                    "id": i * 3 + j
                };
            }
            //如果是竖屏 手机
            else{
                var p={
                    "x": j * this.canvasWidth/3 + this.canvasWidth/6,
                    "y": i * this.canvasWidth/2 - this.canvasWidth/2 + this.canvasHeight/2,
                    "state": 0, //1：当前点已被连接   0：当前点未被连接
                    "id": i * 3 + j
                };
            }
            this.circleArr.push(p);
        }
    }
    // console.log(this.circleArr);
    // 清除画布
    this.ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);
    this.circleArr.forEach(function(item,i){
        that.drawCircle(item.x,item.y);
    });

    //兼容移动触摸的事件写法
    var hastouch = "ontouchstart" in window ? true : false,
        tapstart = hastouch ? "touchstart" : "mousedown",
        tapmove = hastouch ? "touchmove" : "mousemove",
        tapend = hastouch ? "touchend" : "mouseup";

    this.mycanvas.addEventListener(tapstart, function (e) {
        var x = hastouch ? e.targetTouches[0].clientX : e.clientX;
        var y = hastouch ? e.targetTouches[0].clientY : e.clientY;
        // console.log('touchstart:X='+x+'Y='+y);
        that.touchType(x,y,'touchstart');
    }, { passive: true });
    this.mycanvas.addEventListener(tapmove, function (e) {
        var x = hastouch ? e.targetTouches[0].clientX : e.clientX;
        var y = hastouch ? e.targetTouches[0].clientY : e.clientY;
        // console.log('touchmove:X='+x+'Y='+y);
        that.touchType(x,y,'touchmove');
    }, { passive: true });
    this.mycanvas.addEventListener(tapend, function (e) {
        that.touchType(0,0,'touchend');
    }, { passive: true });
}
/*根据触摸类型执行响应函数*/
GR.prototype.touchType = function(x,y,falg){
    var that = this;
    if(falg == 'touchstart'){
        //清空数组
        this.linkPointArr.length = 0;
        this.PWArr.length = 0;
        //圆心数组状态state 置为 0【当前点未连接】
        this.circleArr.forEach(function(item,i){
            item.state = 0;
        });
        this.isInCircle(x,y);
    }else if(falg == 'touchmove' && this.isMouseDown){
        // 清除画布
        this.ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);
        //重新绘制9个圆圈
        this.circleArr.forEach(function(item,i){
            that.drawCircle(item.x,item.y);
        });
        //重新绘制实心圆
        this.linkPointArr.forEach(function(item,i){
            that.drawLinkPoint(item.x,item.y);
        });
        //画折线
        this.drawLinkLine();
        //开启新路径 画连线
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX,this.stateY);
        this.ctx.lineTo(x,y);
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#EB7347';
        this.ctx.stroke();
        this.isInCircle(x,y);
    }else if(falg == 'touchend'){
         // 清除画布
        this.ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight);
         //重新绘制9个圆圈
        this.circleArr.forEach(function(item,i){
            that.drawCircle(item.x,item.y);
        });
        //重新绘制实心圆
        this.linkPointArr.forEach(function(item,i){
            that.drawLinkPoint(item.x,item.y);
        });
        //画折线
        this.drawLinkLine();
        this.isMouseDown = false;
        this.printOut();
    }
}
/*画圆函数*/
GR.prototype.drawCircle = function(x,y){
     var that = this;
     this.ctx.beginPath();
     this.ctx.arc(x,y,this.radius,0,2*Math.PI,true);
     this.ctx.strokeStyle ='#fff';
     this.ctx.lineWidth = 3;
     this.ctx.stroke();
}
/*画已连接点函数【实心圆：当前点连接状态】*/
GR.prototype.drawLinkPoint = function(x,y,i){
    var that = this;
    //画实心大圆及大圆边
    this.ctx.beginPath();
    this.ctx.arc(x,y,this.radius,0,2*Math.PI,true);
    this.ctx.strokeStyle ='#EB7347';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    //画实心小圆
    this.ctx.beginPath();
    this.ctx.arc(x,y,this.radius/3,0,2*Math.PI,true);
    this.ctx.fillStyle = '#EB7347';
    this.ctx.fill();
    // console.log(this.linkPointArr);
}
/*画折线函数【已连接点相连】*/
GR.prototype.drawLinkLine = function(){
    var that = this;
    this.linkPointArr.forEach(function(item,i){
        if(i == 0){
            that.ctx.beginPath();
            that.ctx.lineWidth = 5;
            that.ctx.strokeStyle = '#EB7347';
            that.ctx.lineCap = 'round';
            that.ctx.lineJoin = 'round';
            that.ctx.moveTo(item.x,item.y);
        }else{
            that.ctx.lineTo(item.x,item.y);
        }
        that.ctx.stroke();
    });
}
/*判断坐标点是否在圆内【坐标点与圆心坐标是否小于半径】*/
GR.prototype.isInCircle = function(x,y){
    var that = this;
    this.circleArr.forEach(function(item,i){
        var distance = Math.pow(Math.pow(x-item.x,2) + Math.pow(y-item.y,2), 1/2);
        if(distance <= that.radius && item.state == 0){
            //确定起始点
            that.startX = item.x;
            that.stateY = item.y;
            that.isMouseDown = true;
            //圆心数组状态state 置为 1【当前点已连接】
            item.state = 1;
            //该点加入已连接点数组
            that.linkPointArr.push({
                "x": item.x,
                "y": item.y,
                "id": item.id
            });
            //
            that.PWArr.push(item.id);
            //画已连接的点【实心圆】
            that.drawLinkPoint(item.x,item.y,-1);
        }
    });
}
/*输出密码*/
GR.prototype.printOut = function(){
    console.log(this.PWArr.toString());
    if(this.PWArr.toString() == [3,4,5].toString()){
        window.location.href="https://www.baidu.com/";
    }else if(this.PWArr.toString() == [0,1,2,4,6,7,3,5,8].toString()){
        window.location.href="http://www.bootcss.com/";
    }
}

var gr = new GR();
gr.init();
//窗口大小改变触发事件
window.onresize = function(){
    var gr = new GR();
    gr.init();
}
