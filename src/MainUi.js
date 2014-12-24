var winSize 
var MainUi = cc.Node.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function(){
        winSize = cc.winSize;

        var roleEdit = cc.MenuItemFont.create("角色编辑器",this.initRoleEditor,this);
        roleEdit.x = winSize.width / 2;
        roleEdit.y = winSize.height / 2 + 150; 


        var mapEdit = cc.MenuItemFont.create("地图编辑器",this.initMapEditor,this);
        mapEdit.x = winSize.width / 2;
        mapEdit.y = winSize.height / 2 - 50; 

        var levelEdit = cc.MenuItemFont.create("关卡编辑器",this.initLevelEditor,this);
        levelEdit.x = winSize.width / 2;
        levelEdit.y = winSize.height / 2 + 50 ; 

        var menu = new cc.Menu(mapEdit,roleEdit,levelEdit);
        menu.setPosition(0,0);
        this.addChild(menu);
    },
    initMapEditor:function(){
        cc.log("-----------map editor----------");
        cc.director.replaceScene(MapSelectLayer.scene());
    },
    initRoleEditor:function(){
        cc.log("-----------ROLE EDITOR----------"); 
        cc.director.replaceScene(UnitEditorLayer.scene()); 
    },
    initLevelEditor:function(){
        cc.director.replaceScene(GameLayer.scene(1)); 
    },
});
 
MainUi.scene = function () {
    var scene = new cc.Scene();
    var layer = new MainUi();
    scene.addChild(layer);
    return scene;
};
  

 