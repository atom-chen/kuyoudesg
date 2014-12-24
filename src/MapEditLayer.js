var MapSelectLayer = cc.Layer.extend({
    ctor:function(){  
        cc.sys.garbageCollect(); 
        this._super(); 
        this.init();
    },
    onEnter:function(){
        this._super(); 
    },
    init:function(){ 
        var menu = cc.Menu.create();
        menu.setPosition(0,0);
        this.addChild(menu);

        var fontDef = new cc.FontDefinition();
        fontDef.fontName = "Arial";
        fontDef.fontSize = "32";
        var label = cc.LabelTTF.create("MAP EDITOR",  fontDef); 
        label.x = winSize.width / 2;
        label.y = winSize.height - 10;
        label.anchorY = 1;
        this.addChild(label,1); 

        for(var i = 0;i<16;i++){
            for(var j = 0;j<10;j++){
                var level = i*10+j+1 ; 
                var select = cc.MenuItemFont.create(""+level,this.onMapChoose,this);
                select.idx = level; 
                select.setPosition(j*90+150,540-i*30);
                menu.addChild(select);
            }
        }  

        var back = cc.MenuItemFont.create("返回",this.goBack,this);
        back.x = winSize.width - 50;
        back.y = winSize.height - 25;
        menu.addChild(back);  
    },
    onMapChoose:function(sender){
        var idx = sender.idx;
        cc.director.replaceScene(MapEditLayer.scene(idx));
    },
    goBack:function(sender){
        cc.director.replaceScene(MainUi.scene());
    },
    onExit:function(){
        this._super(); 
    },
});

MapSelectLayer.scene = function () {
    var scene = new cc.Scene();
    var layer = new MapSelectLayer();
    layer.x = 0;
    layer.y = 0;
    scene.addChild(layer);
    return scene;
};



g_sharedMapEditor = null;  //存放地图信息的顶级父节点 
var speed = [0,0,0,0.15,0.32,0.32];
var MapEditLayer = cc.LayerColor.extend({
    ctor:function(level){   
        this._super(cc.color(255, 255, 255, 255));
        this.level = level;
        this.x = 0;
        this.y = 0; 
        this.anchorX = 0;
        this.anchorY = 0; 
        this.canEdit = false;
        this.baseNode = null;
        this.layerMenu = null; 
        this.listener = [];
        this.selectElement = null;   //选中的元素
        this.addScale = 1; //新增物体的初始大小
        this.globalScale = 1;//整体缩放
        this.grouping = false;
        this.gPos = null; 
        g_sharedMapEditor = this; 
    }, 
    onEnter:function(){
        this._super();
        this.init(this.level);
    },
    init:function(level){ 
        this.preLoad();  
        this.initMap(this.loadBg(level));        //初始化地图信息 
        // this.initConfig();           // 
        this.initMenu();                //初始化菜单项 
        this.initItemSelect();          //初始化地图菜单选项   
        this.scheduleUpdate();  
    },
    loadBg:function(level){
        var file = "res/map/bg_"+level+".js"; 
        var util = jsb.fileUtils;   
        var map = null;
        var defaultBg = {type:0,lists:[[],[],[],[],[],[]]};
        if(util.isFileExist(file) ){ 
            //require(file);  //如果开始garbageCollect 的话多次require JS 会引起模拟器崩溃，还是改用读取JSON吧 
            var txt = xxtea_decrypt(util.getStringFromFile(file),"2342524545sdfs");
            cc.log(" text = "+txt)
            if(txt){
                map = JSON.parse(txt);
            }  
            return map || defaultBg;
        }else{
            return defaultBg;
        }
    },
    update:function(dt){
    	// this.updatePosition(); 
    },
    preLoad:function(){ 
        for(var i in res_map_editor){
            for(var j in res_map_editor[i]){
        	    cc.spriteFrameCache.addSpriteFrames(res_map_editor[i][j])
            }
        } 
    }, 
    initConfig:function(){
    	
        // this.sltGroup = new EditGroup(this);//所选组
        // this.addChild(this.sltGroup,99999);
    },
    initMenu:function(){

    	var menu = cc.Menu.create();
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu,9999);
        //返回按钮
        var label = cc.LabelBMFont.create("GO BACK", "res/fonts/west_england-64.fnt");
        var back = cc.MenuItemLabel.create(label, this.onBackCallback,this);
        back.scale = 0.5;
        back.x = 880 ;
        back.y = 620 ;
        menu.addChild(back);
        
        //保存
        var label = cc.LabelBMFont.create("SAVE", "res/fonts/west_england-64.fnt");
        var save = cc.MenuItemLabel.create(label, this.onSaveMap,this);
        save.scale = 0.5;
        save.x = 50;
        save.y = 620;
        menu.addChild(save);
        
        // //测试
        // var label = cc.LabelBMFont.create("EDIT FLASE", "res/fonts/west_england-64.fnt");
        // var test = cc.MenuItemLabel.create(label, this.onTest.bind(this));
        // test.scale = 0.4;
        // test.x = 300;
        // test.y = 620;
        // menu.addChild(test);
    
        //放大
        var label = cc.LabelBMFont.create("+", "res/fonts/west_england-64.fnt");
        var scale1 = cc.MenuItemLabel.create(label,this.onSetScale,this);
        scale1.add = true;
        scale1.scale = 0.5;
        scale1.x = 500;
        scale1.y = 620; 
        menu.addChild(scale1);

        //缩小
        var label = cc.LabelBMFont.create("-", "res/fonts/west_england-64.fnt");
        var scale2 = cc.MenuItemLabel.create(label,this.onSetScale,this);
        scale2.scale = 0.5;
        scale2.x = 470;
        scale2.y = 620; 
        menu.addChild(scale2);
        
        //
        var label = cc.LabelBMFont.create("OS+", "res/fonts/west_england-64.fnt");
        var toCreateScale = cc.MenuItemLabel.create(label, 
            function(){
                // this.toCreateScale += 0.1; 
            });
        toCreateScale.scale = 0.5;
        toCreateScale.x = 610;
        toCreateScale.y = 620; 
        menu.addChild(toCreateScale);

        var label = cc.LabelBMFont.create("OS-", "res/fonts/west_england-64.fnt");
        var toCreateScale2 = cc.MenuItemLabel.create(label, 
            function(){
                // this.toCreateScale -= 0.1; 
            });
        toCreateScale2.scale = 0.5;
        toCreateScale2.x = 610;
        toCreateScale2.y = 590 ;
        menu.addChild(toCreateScale2);
            
            
        var label = cc.LabelTTF.create("放大", "res/fonts/west_england-64.fnt");
        var gScale = cc.MenuItemLabel.create(label,this.onSetGlobalObjScale(0.1),this); 
        gScale.x = 710;
        gScale.y = 620 ; 
        menu.addChild(gScale);
        
        var label = cc.LabelTTF.create("缩小", "res/fonts/west_england-64.fnt");
        var gScale2 = cc.MenuItemLabel.create(label,this.onSetGlobalObjScale(-0.1),this); 
        gScale2.x = 710;
        gScale2.y = 590 ;  
        menu.addChild(gScale2);

        
        // var label = cc.LabelBMFont.create("group", "res/fonts/west_england-64.fnt");
        // var group = cc.MenuItemLabel.create(label, 
        // function(){
        //     this.enableGroupSelect(!this.grouping);
        //     }
        // );
        // group.setScale(0.5);
        // group.setPosition(480,590)
        // menu:addChild(group); 
    },
    //后退按钮
    onBackCallback:function(){ 
        cc.director.replaceScene(MapSelectLayer.scene());       
    }, 
    //测试
    onTest:function(obj){
        if(this.canEdit){
            this.canEdit = false;
            obj.setString("EDIT FALSE");
        }else{
            this.canEdit = true;
            obj.setString("EDIT TRUE");
        }
        
    },
    //放大、缩小
    onSetScale:function(serder){ 
        var num = 0 ;
        if(serder.add){
            num = 0.05;
        }else{
            num = -0.05; 
        }
        this.baseNode.scale = this.baseNode.scale + num;
        this.globalScale = this.baseNode.scale;
        var bg = this.baseNode.getChildByTag(100);
        bg.scaleX = bg.scaleX - num * 24; 
        if( this.selectElement){
            this.selectElement.updateMenuPosition();
            this.selectElement.removeEditorMenu();
            this.selectElement.showEditorMenu();
        }
    },
    //整体放大/缩小
    onSetGlobalObjScale:function(){

    }, 
    initBackground:function(){
        
    },
    initItemSelect:function(){   //初始化菜单元素选项
        //场景切换菜单
        var menuNode = cc.Node.create();
        menuNode.setPosition(0,0); 
        menuNode.anchorX = 0;
        menuNode.anchorY = 0;
        this.addChild(menuNode,10);
        this.itemNode = menuNode;

        var listener = this.createItemTouchEvent();
        var ltr = cc.eventManager.addListener(listener, menuNode);
        this.listener.push(ltr);

        var sceneMenu = cc.Menu.create();
        sceneMenu.x = 0;
        sceneMenu.y = 0;
        menuNode.addChild(sceneMenu);
        
        /*
            场景的地图元素菜单
        */
        for(var i = 0;i < BgDefine.length ;i++){
            var config = BgDefine[i]
            //按场景名字排列
            var label = cc.LabelBMFont.create(config.name, "res/fonts/west_england-64.fnt");
            var item = cc.MenuItemLabel.create(label, this.onItemMenuChange,this);
            item.idx = i;
            item.config = config;
            item.scale = 0.5 
            item.x = 100 * i + 20;
            item.y = 10; 
            sceneMenu.addChild(item);
            
            //用于存放该场景的各个元素
            var node = cc.Node.create();
            node.x = 0;
            node.y = 0;   
            
            //添加元素菜单 
            var itemList = [];
            for(var line = 0;line < 4;line++){
                var list = config.lists[line]; 
                for(var e in list){
                    var define = list[e]; 
                    var sprite = cc.Sprite.create(define.img); 
                    var rect = sprite.getTextureRect();
                    sprite.x = e * 33 + 15;
                    sprite.y = (line - 1) * 36 + 68;  
                    sprite.scale = Math.min(Math.min(35/rect.height,30/rect.width),0.55); 
                    sprite.define = define;
                    node.addChild(sprite,1); 
                    itemList.push(sprite);
                }
            }
            node.itemList = itemList;
            node.tag = i;
            node.visible = false; 
            menuNode.addChild(node);  
            if( this.type == i ){
                node.visible = true;  
            } 
            var box = cc.DrawNode.create();
            node.addChild(box,999); 
            var rectangle = [cc.p(0, 0),cc.p(cc.winSize.width - 70,0),
                cc.p(cc.winSize.width - 70 ,BgDefine.length * 80),
                cc.p(0, BgDefine.length * 80)];
            var red = cc.color._getRed();
            box.drawPoly(rectangle, null,1, red); 
        }  
    },  
    onItemMenuChange:function(sender){  //选项改变 
        this.itemNode.getChildByTag(this.type).visible = false;
        this.itemNode.getChildByTag(sender.idx).visible = true;
        this.type = sender.idx;  
    },
    createItemTouchEvent:function(){    //菜单元素点击事件
        //点击事件
        return cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches:true, 
            onTouchBegan:function(touch, event){
                var target = event.getCurrentTarget();    
                var list = target.getChildByTag(this.type).itemList;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var s = item.getContentSize();
                    var locationInNode = item.convertToNodeSpace(touch.getLocation());
                    var rect = cc.rect(0,0, s.width, s.height);

                    if (cc.rectContainsPoint(rect, locationInNode)) {  
                        item.scale = item.scale + 0.05
                        this.chooseItem = item;
                        return true;
                    }
                }; 
                return false;
            }.bind(this),
            onTouchEnded:function(touch, event){
                this.selectElement.showEditorMenu();
                // var target = event.getCurrentTarget(); 
                // target.scale = target.scale - 0.05 
            }.bind(this),
            onTouchMoved:function(touch, event){ 
                if(this.chooseItem){
                    if(this.selectElement){ 
                        this.selectElement.removeEditorMenu();  
                    }
                    var define = this.chooseItem.define;
                    var pos = this.chooseItem.convertToWorldSpace(cc.p(0,0));  
                    var npos = this.baseNode.convertToWorldSpace(cc.p(0,0));   
                    define.x = pos.x - this.baseNode.x;
                    define.y = pos.y - this.baseNode.y;
                    define.scale = 1;
                    this.selectElement = this.addElemetToLayer(define); 
                    this.chooseItem.scale = this.chooseItem.scale - 0.05;
                    this.chooseItem = null;
                }else{
                    var delta = touch.getDelta(); 
                    this.selectElement.x = this.selectElement.x + delta.x;
                    this.selectElement.y = this.selectElement.y + delta.y; 
                }
            	
            }.bind(this),
        });
    },
    initMap:function(mapConfig){ 
        // 
        var parentNode = cc.Node.create();  
        parentNode.anchorX = 0;
        parentNode.anchorY = 0;
        parentNode.x = 0;
        parentNode.y = 0;
        this.addChild(parentNode);
        this.baseNode = parentNode; 

        //左边界
        var draw = cc.DrawNode.create();
        parentNode.addChild(draw,999);
        var pos = this.getPosition();
        var x = pos.x ;
        var y = pos.y ;
        var rectangle = [cc.p(0, 0),cc.p(0,cc.winSize.height)];
        var red = cc.color._getWhite(); 
        draw.drawPoly(rectangle, null, 1, red); 

        //背景颜色层
        var bgNode = cc.LayerColor.create(cc.color(0,0,0,150),cc.winSize.width,cc.winSize.height)
        bgNode.ignoreAnchor = false;
        bgNode.anchorX = 0.5;
        bgNode.anchorY = 0.5;
        bgNode.setPosition(cc.winSize.width/2,cc.winSize.height/2);
        bgNode.setTag(100);
        parentNode.addChild(bgNode,-1)

        //
        var baseNode = cc.ParallaxNode.create();
        parentNode.addChild(baseNode,1);
           
        //地图层 
		var lists = mapConfig.lists;
        var size = lists.length;  

		this.bgSize= lists.length; //地图层数
		this.bgSpeed = mapConfig.speed;
		this.type = mapConfig.type || 0;

        //地图层选择菜单
		var menu = cc.Menu.create(); 
		menu.x = 0;
		menu.y = 0;
		this.addChild(menu,2000);

		menu.imgList = [];
		this.layerMenu = menu;
		//保存每个图层图片的list
		this.bgList = [];
        var listener = this.createElementTouchEvent(); 
        var l = cc.eventManager.addListener(listener, 2); 
        this.listener.push(l);
        //各个层节点
		for (var i = 0; i < size; i++) {

			//创建层选项菜单
			var layerNum = cc.Sprite.create("res/editor_ui/"+(i+1)+".png");
			var func = function(obj){ 
				this.changeSelectLayer(obj.idx)
			};
			var icon = cc.MenuItemSprite.create(layerNum,layerNum,func,this);
			icon.idx = i;
			icon.scale = 1.5; 
			icon.x = cc.winSize.width - 30;
			icon.y = i * 50 + 30;
            icon.tag = i;
			menu.imgList[i] = icon;
			menu.addChild(icon,1000);

			//创建图层
			var bgLayer = cc.Node.create();
			bgLayer.anchorX = 0;
			bgLayer.anchorY = 0;
			baseNode.addChild(bgLayer,100 - i,cc.p(1 - speed[i],1), cc.p(0,0)); 
			  
			//为层添加各个层的地图元素
			var elements = lists[i];
			var temp = [];  
			for (var e = 0; e < elements.length; e++) {
                var el = elements[e]
                var sprite = new MapElement(el,this); 
                bgLayer.addChild(sprite); 
                temp.push(sprite);
			};
            bgLayer.list = temp;
            this.bgList[i] = bgLayer;
		};

		this.changeSelectLayer(0);
		this.initBackGroundLayer(mapConfig.bg); //初始化地图背景 
		// this.updatePosition(mapConfig.speed); 
    	 
    }, 
    deleteElemetFromLayer:function(){
         
        var list = this.bgList[this.index].list; 
        var idx 
        for (var i = 0; i < list.length; i++) {
            if(list[i] == this.selectElement){
                idx = i;
                break;
            } 
        };
        list[idx].copyNum = 0; 
        list[idx].removeFromParent();
        this.selectElement = null;
        list.splice(i,1);
        
    },
    addElemetToLayer:function(define){ 
        var sprite = new MapElement(define,this); 
        this.bgList[this.index].addChild(sprite);  
        this.bgList[this.index].list.push(sprite);
        return sprite;
    }, 
    createElementTouchEvent:function(){ //地图上已添加的图片和新加的图片点击事件 
        //点击事件
        return cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE, 
            swallowTouches:true,
            onTouchBegan:function(touch, event){   
            
                //循环遍历该层所有元素，看是否点击了其中一个
                var list = this.bgList[this.index].list;
                if(this.selectElement){ 
                    this.selectElement.removeEditorMenu(); 
                    this.selectElement = null;
                }

                for (var i = 0; i < list.length; i++) {
                    var element = list[i];
                    if(element){ 
                        var pos = element.convertToWorldSpace(cc.p(0,0)); 
                        var size = element.element.getTextureRect(); 
                        var rect = cc.rect(pos.x,pos.y,size.width * this.globalScale,size.height * this.globalScale); 

                        if (cc.rectContainsPoint(rect, touch.getLocation())){ 
                            if(this.selectElement){
                                if(this.selectElement.zIndex < element.zIndex){ 
                                    this.selectElement = element;
                                } 
                            }else{
                                this.selectElement = element;
                            } 
                        }
                    }
                }; 

                if(this.selectElement){
                    this.showEditor();
                    this.selectElement.showEditorMenu(); 
                } 
                return true;
               
            }.bind(this),
            onTouchEnded:function(touch, event){
                 this.changeSelectLayer(this.index);
            }.bind(this),
            onTouchMoved:function(touch, event){ 
                var delta = touch.getDelta();
                if(!this.selectElement){ 
                    this.baseNode.x = this.baseNode.x + delta.x;
                    this.baseNode.y = this.baseNode.y + delta.y; 
                    var bgNode = this.baseNode.getChildByTag(100);
                    if(bgNode){ 
                        bgNode.x = bgNode.x - delta.x; 
                    }
                }else{ 
                    var target = this.selectElement;
                    target.x = target.x + delta.x; 
                    target.y = target.y + delta.y ; 
                    target.updateMenuPosition();
                }
                
            }.bind(this),
        });
    },
    //保存地图
    onSaveMap:function(){
        var bgs = []
        for(var i in this.bgList){
            var list = this.bgList[i].list;
            bgs[i]=[]
            for(var j in list){
                var obj = list[j];
                bgs[i][j] = {  
                                x:obj.x,
                                y:obj.y,
                                z:obj.zIndex,
                                scale:obj.scale,
                                flip:obj.flip,
                                img:obj.img, 
                                tag:obj.tag, 
                                rotate:obj.rotate,
                            };
            }
        }
        var map = {lists:bgs,type:this.type}; 
        var jsonString = JSON.stringify(map); 
        var fileName = "res/map/bg_"+this.level+".js"; 
        var path = jsb.fileUtils.getWritablePath(); 
        if(!jsb.fileUtils.isFileExist(path+fileName)){
            cc.log("#####################目标文件不存在######################");
            return
        }
        __writeFile(path+fileName, xxtea_encrypt(jsonString,"2342524545sdfs")); 
    },
    showEditor:function(){
        for (var i = 0; i < this.bgList.length; i++) {
            var list = this.bgList[i].list;
            for (var j = 0; j < list.length; j++) { 
                list[j].element.opacity = 75;
            }; 
        };
    },
    changeSelectLayer:function(index){  //改变选择的图层  
    	this.index = index; //图层index
        var menu = this.layerMenu.imgList;  
        for(var i = 0 ; i < menu.length ; i++){
            if( index == i ){
                menu[i].opacity = 150 ;
            }else{
                menu[i].opacity = 255 ;
            }
        }

        for (var i = 0; i < this.bgList.length; i++) {
            var list = this.bgList[i].list;
            if(index == i ){  
                for (var j = 0; j < list.length; j++) {
                    list[j].setOpacity(200);
                }; 
            }else{ 
                for (var j = 0; j < list.length; j++) {
                    list[j].setOpacity(255);
                };
            }
        };
    }, 
    initBackGroundLayer:function(bgCongfig){//初始化地图背景层 
    	if(this.bgSky){
    		this.bgSky.removeFromParent();
    		this.bgSky = null;
    	}

    }, 
    onExit:function(){
        this._super();  
        g_sharedMapEditor = null 
        for (var i = 0; i < this.listener.length; i++) {
            cc.eventManager.removeListener(this.listener[i]);
        };
        this.removeAllChildren(true);  
    }
});

var NodeTest = cc.Node.extend({
    ctor:function(){
        this._super();

    },
    onEnter:function(){
        this._super();
        var menu = cc.Menu.create();
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu,9999);
        //返回按钮
        var label = cc.LabelBMFont.create("GO BACK", "res/fonts/west_england-64.fnt");
        var back = cc.MenuItemLabel.create(label, this.onBackCallback.bind(this));
        back.scale = 0.5;
        back.x = 880 ;
        back.y = 620 ;
        menu.addChild(back);
    },
    onBackCallback:function(){
        cc.director.replaceScene(MapSelectLayer.scene());       
    }
});
 
MapEditLayer.scene = function (level) {
    var scene = new cc.Scene();
    var layer = new MapEditLayer(level);
    scene.addChild(layer);
    return scene;
};

/*
    地图元素
    @
*/
var MapElement = cc.Node.extend({
    ctor:function(define,parentNode){
        this._super();
        this.define = define; 
        this.parentNode = parentNode;
        this.anchorX = 0;
        this.anchorY = 0;
        this.x = define.x || 0;
        this.y = define.y || 0; 
        this.rotate = define.rotate; 
        this.flip = define.flip || false;
        this.elemScale = define.scale || 1; 
        this.img = define.img;
        this.copyNum = 0;
        this.showBox = false;
        this.init();
    },
    init:function(){
        this.createElementSprite(); 
    },
    createElementSprite:function(){
        var element = cc.Sprite.create(this.img);
        element.anchorX = 0;
        element.anchorY = 0;
        element.x = 0;
        element.y = 0;
        element.scale = this.elemScale;
        element.flippedX = this.flip; 
        this.addChild(element);
        this.element = element; 
        var size = element.getContentSize();
        this.ow = size.width / this.elemScale;
        this.oh = size.height / this.elemScale;
        this.setSize();
    },
    setSize:function(){
        this.width = this.ow * this.elemScale;
        this.height = this.oh * this.elemScale;
        this.setContentSize(cc.size(this.width,this.height)); 
    }, 
    setOpacity:function(opa){
        this.element.opacity = opa;
    },
    drawBox:function(){ 
        if(this.box){
            this.box.removeFromParent();
            this.box = null; 
        }
        this.box = cc.DrawNode.create();
        this.addChild(this.box,999);
        var pos = this.getPosition();
        var x = pos.x ;
        var y = pos.y ;
        var rectangle = [cc.p(0, 0),cc.p(this.width,0),
            cc.p(this.width,this.height),
            cc.p(0, this.height)];
        var white = cc.color(255, 255,255, 255); 
        this.box.drawPoly(rectangle, null, 0.5, white); 
    },
    removeEditorMenu:function(){
        this.copyNum = 0;
        if(this.editorMenu){
            this.editorMenu.removeFromParent();
            this.editorMenu = null;
        } 
        if(this.box){
            this.box.removeFromParent();
            this.box = null; 
        }
    },
    updateMenuPosition:function(){
        var pos = this.convertToWorldSpace(cc.p(0,0));
        this.editorMenu.setPosition(pos);  
    },
    showEditorMenu:function(){

        this.drawBox();
        this.setOpacity(255) 

        if(this.editorMenu){ 
            this.editorMenu.removeFromParent();
            this.editorMenu = null;
        }
        var pos = this.convertToWorldSpace(cc.p(0,0));
        var menu = cc.Menu.create(); 
        menu.x = pos.x;
        menu.y = pos.y;
        this.parentNode.addChild(menu,100);
        this.editorMenu = menu;

        //放大
        var fangda = cc.LabelBMFont.create("S+", "res/fonts/west_england-64.fnt");
        var fangda = cc.MenuItemLabel.create(fangda, 
            function(){
                this.setElementScale(0.1);
            }.bind(this)); 
        fangda.scale = 0.5
        fangda.x = 0;
        fangda.y = 0 ; 
        menu.addChild(fangda);

        //缩小
        var suoxiao = cc.LabelBMFont.create("S-", "res/fonts/west_england-64.fnt");
        var suoxiao = cc.MenuItemLabel.create(suoxiao, 
            function(){
                this.setElementScale(-0.1);
            }.bind(this)); 
        suoxiao.scale = 0.5
        suoxiao.x = 60;
        suoxiao.y = 0; 
        menu.addChild(suoxiao);

        //左旋转
        var leftFont = cc.LabelBMFont.create("R-", "res/fonts/west_england-64.fnt");
        var rLeft = cc.MenuItemLabel.create(leftFont, 
            function(){
                this.setElementRotate(-1);
            }.bind(this)); 
        rLeft.scale = 0.5
        rLeft.x = 0;
        rLeft.y = 30; 
        menu.addChild(rLeft);

        //右旋转
        var rightFont = cc.LabelBMFont.create("R+", "res/fonts/west_england-64.fnt");
        var rRight = cc.MenuItemLabel.create(rightFont, 
            function(){
                this.setElementRotate(1);
            }.bind(this)); 
        rRight.scale = 0.5
        rRight.x = 60;
        rRight.y = 30; 
        menu.addChild(rRight);

        //Zorder增加
        var zFont = cc.LabelBMFont.create("Z+", "res/fonts/west_england-64.fnt");
        var addZorder = cc.MenuItemLabel.create(zFont, 
            function(){
                this.setElementZorder(1);
            }.bind(this)); 
        addZorder.scale = 0.5
        addZorder.x = 120;
        addZorder.y = 0; 
        menu.addChild(addZorder);

        //Zorder减少
        var zFont = cc.LabelBMFont.create("Z-", "res/fonts/west_england-64.fnt");
        var addZorder = cc.MenuItemLabel.create(zFont, 
            function(){
                this.setElementZorder(-1);
            }.bind(this)); 
        addZorder.scale = 0.5
        addZorder.x = 170;
        addZorder.y = 0; 
        menu.addChild(addZorder); 

        //FLIPX
        var zFont = cc.LabelBMFont.create("FLIP", "res/fonts/west_england-64.fnt");
        var addZorder = cc.MenuItemLabel.create(zFont, 
            function(){
                if(this.element.flippedX){
                    this.element.flippedX = false
                }else{
                    this.element.flippedX = true 
                }  
            }.bind(this)); 
        addZorder.scale = 0.4
        addZorder.x = 30;
        addZorder.y = this.height * g_sharedMapEditor.globalScale + 5; 
        menu.addChild(addZorder);

        //删除
        var fDel = cc.LabelBMFont.create("DEL", "res/fonts/west_england-64.fnt");
        var mDel = cc.MenuItemLabel.create(fDel, 
            function(){
                this.editorMenu.removeFromParent();
                g_sharedMapEditor.deleteElemetFromLayer(); 
            }.bind(this)); 
        mDel.scale = 0.4
        mDel.x = 100;
        mDel.y = this.height * g_sharedMapEditor.globalScale + 5; 
        menu.addChild(mDel);   

        //删除
        var fDel = cc.LabelBMFont.create("COPY", "res/fonts/west_england-64.fnt");
        var mDel = cc.MenuItemLabel.create(fDel, 
            function(){  
                this.copyNum = this.copyNum + 1;
                var tbl = kit.clone(this.define);
                tbl.x = this.x + (this.width + 20) * this.copyNum;
                tbl.y = this.y;
                tbl.showBox = false;

                g_sharedMapEditor.addElemetToLayer(tbl); 
            }.bind(this)); 
        mDel.scale = 0.4
        mDel.x = 170;
        mDel.y = this.height * g_sharedMapEditor.globalScale + 5; 
        menu.addChild(mDel);      
    },
    setElementScale:function(num){
        this.elemScale = this.elemScale + num; 
        this.element.scale = this.elemScale
        this.setSize();
        if(this.editorMenu){
            this.editorMenu.removeFromParent();
            this.editorMenu = null;
        } 
        if(this.box){
            this.box.removeFromParent();
            this.box = null; 
        }
        this.showEditorMenu();
    },
    setElementRotate:function(num){
        this.element.rotation = this.element.rotation + num;
    },
    setElementZorder:function(num){
        this.zIndex = this.zIndex + num; 
    },
});

var RepeatBackGround = cc.Node.extend({
    ctor:function(config){
        this.bgImg = config.img;
        this.x = 0;
        this.y = 0;
        this.anchorX = 0;
        this.anchorY = 0;
        this.init();
    },
    init:function(){

    },
});


 