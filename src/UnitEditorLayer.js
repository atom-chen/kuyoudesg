var g_shareUnitEditor = null;
var UnitEditorLayer = cc.Layer.extend({
	ctor:function(){
		this._super();
		this.init();
		g_shareUnitEditor = this;
	},
	init:function(){
		this.preLoad(); 
		this.initBackGroud();  
		this.initMenu();
		this.initSlipLayer();
	}, 
	preLoad:function(){ 
		var plist = RoleDefine.plist;
		for (var i in plist){
			 cc.spriteFrameCache.addSpriteFrames(plist[i]);
		};
	},
	initMenu:function(){
		var menu = cc.Menu.create();
		menu.x = 0;
		menu.y = 0;
		this.addChild(menu,3);
		var back = cc.MenuItemFont.create("返回",function(){
			cc.director.replaceScene(MainUi.scene()); 
		});
        back.x = winSize.width - 50;
        back.y = winSize.height- 20; 
        menu.addChild(back);
        this.menu = menu;
	}, 
	initBackGroud:function(){
		var bg = cc.Sprite.create("res/bg/bbg.jpg");
		bg.scaleX = 1.15;
		bg.scaleY = 1.1;
		bg.anchorX = 0 ;
		bg.anchorY = 0;
		bg.x = 0;
		bg.y = 0;
		this.addChild(bg,1);
	},
	initSlipLayer:function(){
		var left = new UnitLeftLayer();
		left.y = 200;
		this.addChild(left,2);
		this.leftNode = left; 
	}, 
	onRoleChoosed:function(config){
		if(this.bottomNode){
			this.bottomNode.removeFromParent();
			this.bottomNode = null;
		} 
		var bottom = new UnitBottomLayer(config);
		bottom.x = 100;
		bottom.y = 10;
		this.addChild(bottom,2);
		this.bottomNode = bottom; 
	},
	createEditorUnit:function(define){
		if(this.unit){
			this.unit.removeFromParent();
			this.unit = null;
		}
		var res = define.res;
		var unit = new sp.SkeletonAnimation(res.json,res.plist); 
        unit.setPosition(cc.p(winSize.width / 2 - 300, winSize.height / 2));
        unit.addAnimation(0, 'Fly', true); 
        this.addChild(unit,3);
        this.unit = unit;
	},
});

UnitEditorLayer.scene = function () {
    var scene = new cc.Scene();
    var layer = new UnitEditorLayer();
    layer.x = 0;
    layer.y = 0;
    scene.addChild(layer);
    return scene;
};

 
var UnitLeftLayer = BaseSlipNode.extend({
	ctor:function(){
		this._super();  
		this.mode = 2;
		this.initItemList();
	},  
	initItemList:function(){ 
		var list = RoleDefine.list;
		var len = 0;
		var hht = 0;
		for (var i = 0; i < list.length; i++) {
			var obj = list[i];
			var icon = cc.Sprite.create(obj.img);
			icon.res = obj.res;
			hht = icon.width;
			icon.x = 5 ;
			icon.y = 5 + len;
			icon.idx = i;
			icon.anchorX = 0;
			icon.anchorY = 0; 
			icon.onEffect = function(){
				g_shareUnitEditor.onRoleChoosed(obj);
			};
			this.slipNode.addChild(icon);
			len = len + icon.height;
		}; 
		this.setSize(hht,len + 20,len + 20) //宽(显示宽),高(显示高),长度(滑动列表的长度)
	}, 
});


var UnitBottomLayer = BaseSlipNode.extend({
	ctor:function(config){
		this._super();  
		this.config = config; 
		this.initItemList(config) 
	},  
	initItemList:function(config){ 
		var list = RoleDefine.list;
		var len = 0;
		var hht = 0;
		for (var i = 0; i < list.length; i++) {
			var obj = list[i];
			var icon = cc.Sprite.create(config.img);
			hht = icon.height;
			icon.x = 10 + len;
			icon.y = 0;
			icon.idx = i; 
			icon.anchorX = 0;
			icon.anchorY = 0;
			icon.onEffect = function(){
				g_shareUnitEditor.createEditorUnit(obj);
			}.bind(this);
			this.slipNode.addChild(icon);
			len = len + icon.width;
		}; 
		this.setSize(len + 20,hht,len + 20) //宽(显示宽),高(显示高),长度(滑动列表的长度)
	},  
});

var EditorUnit = cc.Node.extend({
	ctor:function(config){
		this._super(); 
		this.init(config);
	},
	init:function(config){
		this.initSprite(config); 
	},
	initSprite:function(config){
		var sprite = cc.Sprite.create(config.img); 
		this.addChild(sprite);
		this.width = sprite.width;
		this.height = sprite.height;
		sprite.x = this.width / 2 ;
		sprite.y = this.height / 2;
	}, 
});