/* 
1、点击开始，选项卡消失,加载LOOG，进度
*/
class gameEngine{
    constructor(parameter){
        this.bg_map = parameter.bg_map;
        this.ulArr = parameter.ulArr;
        this.load();
    }
    map(hardValue){//背景图运动
        var p = 0;
        this.bg_timer = setInterval(()=>{
            p += hardValue+2;
            this.bg_map.style.backgroundPositionY = p + "px"
        },30)
    }
    load(){
        var that = this;
        for(var i = 0; i < this.ulArr.length; i++){
            this.ulArr[i].onclick = function(){
                this.parentNode.remove();
                that.hardValue = this.value;
                that.map(that.hardValue);
                that.logo();
            }
        }
    } 
    logo(){
        var logoPicture = createDiv('logo');
        var logoSmall = createDiv('loading');
        var i = 0;
        this.loading = setInterval(()=>{
            logoSmall.style.backgroundImage = "url(images/loading"+ ((i++)%3+1) +".png)";
        },150);
        setTimeout(() => {
            logoPicture.remove();
            logoSmall.remove();
            clearInterval(this.loading);
            this.gameStart();
        }, 1000);
    }
    gameStart(){
        //创建飞机
        MyPlane.init(this.bg_map,this.bg_timer,this.points,this.load);
        //开火
        MyPlane.fire(this.hardValue);
        // 创建敌机
        // 数量，敌机速度随难度改变
        this.big_timer = setInterval(()=>{
            if (Math.random() > 0.7) {
                new Enemy(this.bg_map,3,this.hardValue,this.points);
            }
        },5000);
        this.mid_timer = setInterval(()=>{
            if (Math.random() > 0.5) {
                new Enemy(this.bg_map,2,this.hardValue,this.points);
            }
        },3000);
        this.sml_timer = setInterval(()=>{
            if (Math.random() > 0.3) {
                new Enemy(this.bg_map,1,this.hardValue,this.points);
            }
        },1000);
    }
}
//单体对象
var MyPlane = {
    init : function (bg_map,bg_timer,points) {
        this.bg_map = bg_map;
        this.bg_timer = bg_timer;
        this.points = points;
        // this.star = start;
        this.ele = createDiv("my-warplain");
        this.ele.style.left = (this.bg_map.offsetWidth - this.ele.offsetWidth)/2 + "px";
        this.ele.style.bottom = 0;
        this.move();
        this.jifen();
    },
    move : function () {
        var that = this;
        document.onmousemove = function (eve) {
            var e = eve || window.event;
            var l = e.clientX - that.bg_map.offsetLeft - that.ele.offsetWidth/2;
            var t = e.clientY - that.ele.offsetHeight/2;
            if( l < 0) l = 0;
            if( t < 0) t = 0;
            if( l > that.bg_map.offsetWidth - that.ele.offsetWidth){
                l = that.bg_map.offsetWidth - that.ele.offsetWidth
            }
            that.ele.style.left = l + "px";
            that.ele.style.top = t + "px";
        }
    },
    fire : function (type) {
        var time = 200;
        switch (type) {
            case 1:
                time = 100;
                break;
            case 2:
                time = 300;
                break;
            case 3:
                time = 600;
                break;
            case 4:
                time = 900;
                break;
        };
        var that = this;
        this.bulletTimer = setInterval(function () {
            that.arrBullet.push(new Bullet())//子弹创建的时候,立即将子弹对象存储起来，在子弹死亡的时候，删
        },time)
    },
    arrBullet : [],
    jifen : function () {
        this.points = 0
        this.showPoint = createDiv("showPoints");
        this.showPoint.innerHTML = this.points;
    },
    //飞机死亡
    myplaneDie : function () {
        var i = 0;
        this.timer = setInterval(()=>{
            i++;
            if (i == 4) {
                clearInterval(this.timer);
                this.ele.remove();
            }else{
                this.ele.style.backgroundImage = "url(images/me_die"+i+".png)";
            }
        },100);
        //清空所有
        clearInterval(this.bulletTimer);
        clearInterval(this.bg_timer);
        var gameOver = createDiv("gameOver");
        var reStart = createDiv("reStart");
        var finalPoint = createDiv("points");
        gameOver.innerHTML = "GameOver!";
        reStart.innerHTML = "重新开始";
        finalPoint.innerHTML = this.points;//结束时的分数
        // console.log(this.start)
    }
}
class Bullet{
    constructor(){
        this.init();
    }
    init(){
        this.zidan = createDiv("bullet");
        
        this.zidan.style.left = MyPlane.ele.offsetLeft + MyPlane.ele.offsetWidth/2 - this.zidan.offsetWidth/2 + "px";
        this.zidan.style.top = MyPlane.ele.offsetTop - this.zidan.offsetHeight + "px";
        this.move(this.zidan);
    }
    move(ele){
        this.ele = ele;
        var that = this;
        this.timer = setInterval(function () {
            if (that.ele.offsetTop <= -50) {
                clearInterval(that.timer);
                that.die();
            }else{
                that.ele.style.top = (that.ele.offsetTop-10) + "px"
            }
        },30)
    }
    die(){
        let that = this;
        this.ele.className = "bullet_die"
        //子弹要死了,删除死亡的子弹，刚开始死就立即从数组中删除这个子弹对象，不参与将来的碰撞检测
        //因为,爆炸需要时间,爆炸期间,不能算碰撞
        for (let i = 0; i < MyPlane.arrBullet.length; i++) {
            if( MyPlane.arrBullet[i].ele == that.ele){
                MyPlane.arrBullet.splice( i , 1);
            }
        }
        setTimeout(() => {
            this.ele.style.backgroundImage = "url(images/die2.png)";
        }, 100);
        setTimeout(() => {
            this.ele.remove();
        }, 150);;
    }
}
class Enemy{
    constructor(bg_map,type,hardValue_speed) {
        this.bg_map = bg_map;
        this.type = type;
        this.hardValue_speed = hardValue_speed;
        this.init();
    }
    init(){
        switch (this.type) {
            case 1:
                this.ele = createDiv("enemy-small");
                this.i = 3;
                this.speed = 5 + this.hardValue_speed;
                this.hp = 1;
                this.point = 10;
                break;
            case 2:
                this.ele = createDiv("enemy-middle");
                this.i = 4;
                this.speed = 3 + this.hardValue_speed;
                this.hp = 4;
                this.point = 20;
                break;
            case 3:
                this.ele = createDiv("enemy-large");
                this.i = 6;
                this.speed = 2 + this.hardValue_speed;
                this.hp = 8;
                this.point = 30;
                break;
        }
        this.ele.style.left = Math.round(Math.random()*(this.bg_map.offsetWidth - this.ele.offsetWidth))+"px";
        this.ele.style.top = -this.ele.offsetHeight + "px";
        this.move();
    }   
    move(){
        var that = this;
        this.moveTimer = setInterval(function () {
            if (that.ele.offsetTop > that.bg_map.offsetHeight) {
                clearInterval(that.moveTimer);
                that.die();
            }else{
                that.ele.style.top = (that.ele.offsetTop + that.speed) + "px";
            }
            //子弹与敌机的碰撞检测
            for (let i = 0; i < MyPlane.arrBullet.length; i++) {
                let myplan_ele = MyPlane.arrBullet[i].ele;
                if(myplan_ele.offsetLeft + myplan_ele.offsetWidth > that.ele.offsetLeft && 
                    that.ele.offsetLeft + that.ele.offsetWidth > myplan_ele.offsetLeft &&
                    that.ele.offsetTop + that.ele.offsetHeight > myplan_ele.offsetTop &&
                    myplan_ele.offsetTop + myplan_ele.offsetHeight > that.ele.offsetTop
                    ){
                   MyPlane.arrBullet[i].die();
                   that.hp--;
                   if (that.hp == 0) {
                       that.die();
                   }
                }
            }
            // 飞机与敌机的碰撞检测
            if(MyPlane.ele.offsetLeft + MyPlane.ele.offsetWidth > that.ele.offsetLeft &&
                that.ele.offsetLeft + that.ele.offsetWidth > MyPlane.ele.offsetLeft &&
                that.ele.offsetTop + that.ele.offsetHeight > MyPlane.ele.offsetTop &&
                MyPlane.ele.offsetTop + MyPlane.ele.offsetHeight > that.ele.offsetTop
                ){
                MyPlane.myplaneDie();
                clearInterval(that.moveTimer)
                clearInterval(that.timer);
                that.die();//敌机爆炸
            }
        },30)
    }
    die(){
        var that = this;
        var i = 0;
        this.timer = setInterval(function () {
            if ( i == 3) {
                clearInterval(that.timer);
                that.ele.remove();
            }else{
                i++;
            }
            that.ele.style.backgroundImage = "url(images/plane"+ that.type +"_die"+ i +".png)"
        },100)
        //加分
        MyPlane.points += this.point;
        MyPlane.showPoint.innerHTML = MyPlane.points;
    }
}
function createDiv(myclass){
    var div = document.createElement("div")
    div.className = myclass;
    document.getElementById("body_main").appendChild(div)
    return div;
}
new gameEngine({
    bg_map : document.getElementById("body_main"),
    ulArr : document.getElementById("options").children,
});
