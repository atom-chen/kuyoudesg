// var Background = cc.Node.extend({
//     ctor:function(config,index,fightLayer){
//         this._super();
//         this.config = config;
//         this.index = index;
//         this.type = "bg";
//         this.img_type = config.img_type || "plist";
//         this.plist = config.plist;
//         if(this.plist){
//             cc.SpriteFrameCache.getInstance().addSpriteFrames(this.plist);
//         }
//         if(gPicDeleted[config.img] || config.img == "res/guide/finger1.png"){
//             if(gPicDeleted[config.img] && typeof(gPicDeleted[config.img])=="string"){
//                 this.img_type = "plist";
//                 config.img_type = "plist"
//                 config.img = gPicDeleted[config.img];
//             }else{
//                 this.img_type =null;
//                 config.img_type = null;
//                 config.img = "res/guide/finger1.png";
// //                this.removeFromParent();
// //                return;
//             }
//         }
//         var sprite = this.img_type == "plist" && cc.Sprite.createWithSpriteFrameName(config.img) || cc.Sprite.create(config.img);
//         if(!sprite){
//             this.removeFromParent();
//             return;
//         }
//         sprite.setPosition(config);
//         this.sprite = sprite;
//         this.flip = config.flip;
        
//         if(sys.platform == 'browser'){
//             sprite.setFlippedX(config.flip);
//         }else{
//             sprite.setFlipX(config.flip);
//         }
//         sprite.setAnchorPoint(cc._p(0,0));
//         this.addChild(sprite,0);
//         this.sprite = sprite;
//         var zOrder = config.z || 0;
//         this.zOrder = zOrder;
//         g_sharedBgLayer[index].addChild(this,zOrder);
//         var scale = config.scale || 1;
//         this.scale = scale;
//         sprite.setScale(scale);
        
//         var tag = config.tag;
//         this.setTag(tag,fightLayer);
//         var rect = sprite.getTextureRect();
//         this.rect = rect;
//         this.width = rect.width*scale;
//         this.visible=true;
        
//         this.rotate = config.rotate;
//         if(this.rotate)
//             this.sprite.setRotation(this.rotate);
//     },
//     setTag:function(n,fightLayer){
//         if(!n && n!=0)
//             return;
//         this.tag = n;
//         if(!fightLayer.bgTagList)
//             fightLayer.bgTagList = {};
//         fightLayer.bgTagList[n] = this;
//     },
//     setColor:function(c3b){
//         this.sprite.setColor(c3b);
//     },
//     setOpacity:function(alpha){
//         this.sprite.setOpacity(alpha);
//     },
//     setVisible:function(flag){
//         this._super(flag);
//         this.visible=flag;
//     },
//     updateCamera:function(){
//         var l = 0;
//         var r = VISIBLE_WIDTH;
//         var rect = this.rect;
//         var scale = g_sharedBgLayer[this.index].getScale()*g_sharedFightLayer.getScale();
//         var w = this.width*scale;
//         var pos = this.sprite.convertToWorldSpace(cc._p(0,0));
//         var x = pos.x;
//         if(x>r || x+w<l){
//             if(!!this.visible){
//                 this.setVisible(false);
// //                cc.log(1)
//             }
//         }else if(!this.visible){
//             this.setVisible(true);
// //            cc.log(2)
//         }
//     },
// });