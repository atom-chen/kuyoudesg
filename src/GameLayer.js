/**
 *  游戏场景层
 *  主要分为地图层，战斗层，UI层
**/
var GameLayer = cc.Layer.extend({
    parallaxNode:null,             //地图背景层 
    ctor:function(level){
        this._super();
        this.level = level; 
        this.init();
    },
    onEnter:function(){

    },
    init:function(){
        // this.preLoad();
        // this.initMap();
        var img = long2str(jsb.fileUtils.getStringFromFile("res/foreground1.png"),"MYKEY");
        var sp = cc.Spirte.create(img)
        sp.x = winSize.width/2;
        sp.x = winSize.height/2;
        this.addChild(img); 
    },
    preLoad:function(){ 
        for(var i in res_map_editor){
            for(var j in res_map_editor[i]){
                cc.spriteFrameCache.addSpriteFrames(res_map_editor[i][j])
            }
        } 
    }, 
    initMap:function(){
        var bgDefine = this.loadBgDefine(); //地图配置信息
        this.createBackgroud(bgDefine);     //创建地图
    },
    loadBgDefine:function(){
        var file = "res/map/bg_" + this.level + ".js";  
        var util = jsb.fileUtils;   
        var map = null;
        var defaultBg = {type:0,lists:[[],[],[],[],[],[]]};
        if(util.isFileExist(file) ){  
            var txt = util.getStringFromFile(file);
            if(txt){
                map = JSON.parse(txt);
            }   
            return map || defaultBg;
        }else{
            return defaultBg;
        }
    },
    createBackgroud:function(bgDefine){  
        //
        var pn = cc.ParallaxNode.create();
        this.addChild(pn,1);
        this.parallaxNode = pn;
           
        //地图层 
        var lists = bgDefine.lists;
        var size = lists.length;   
        //保存每个图层图片的list 
        //各个层节点
        for (var i = 0; i < size; i++) {  
            //创建图层
            var bgLayer = cc.Node.create();
            bgLayer.anchorX = 0;
            bgLayer.anchorY = 0;
            pn.addChild(bgLayer,100 - i,cc.p(1 - speed[i],1), cc.p(0,0)); 
              
            //为层添加各个层的地图元素
            var elements = lists[i]; 
            for (var e = 0; e < elements.length; e++) {
                var el = elements[e]
                var sprite = new MapElement(el,this); 
                bgLayer.addChild(sprite);  
            };  
        }; 
    },

});
 
GameLayer.scene = function (level) {
    var scene = new cc.Scene();
    var layer = new GameLayer(level);
    scene.addChild(layer);
    return scene;
};
  

 