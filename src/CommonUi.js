var BaseSlipNode = cc.Layer.extend({
	limit : 50,    //超出范围
	length : 0,	 //滑动范围总长
	mode : 1,
	minEdge : 0,
	maxEdge : -100,
	ctor:function(index){
		this._super();  
		this.index = index;
		this.cwidth = 100;
		this.cheight = 100;
		this.press = false;
		this.listener = [];
		this.init();
	},
	init:function(){ 
		this.preLoad();
		this.initClipperNode(); 
		this.scheduleUpdate();
	},  
	preLoad:function(){

	},
	setSize:function(width,height,length){
		this.cwidth = width || 50;
		this.cheight = height|| 50;
		this.stencil.width = this.cwidth;
		this.stencil.height = this.cheight; 
		this.slipNode.width = this.cwidth;
		this.slipNode.height = this.cheight; 
		this.setLength(length || 50);
	},
	update:function(dt){
		if(!this.press ){
			if(this.mode == 1){
				this.updateX(dt);
			}else if(this.mode == 2){
				this.updateY(dt);
			}
		}
	},
	updateX : function(dt){
		var posX = this.slipNode.x;
		if(this.slipPower > 5){
			posX = posX + this.slipPower;
			if( posX >= this.minEdge){
				this.slipPower = 0;
			}else{
				this.slipPower--;
				this.slipNode.x = posX;
			}
		}else if(this.slipPower < -5 ){
			posX = posX + this.slipPower;
			if(posX <= this.maxEdge){
				this.slipPower = 0;
			}else{		
				this.slipPower++;
				this.slipNode.x = posX;
			}
		}else{
			if(posX > this.minEdge){
				posX = posX - (posX  - this.minEdge)* dt / 0.2 - 1
				if(posX <= this.minEdge) posX = this.minEdge;
				this.slipNode.x = posX;
			}
			else if (posX  < this.maxEdge){
				posX = posX + (this.maxEdge - posX) * dt / 0.2 + 1
				if(posX  >= this.maxEdge) posX = this.maxEdge;
				this.slipNode.x = posX;
			}
		}
	},
	updateY : function(dt){
		var posY = this.slipNode.y;
		if(this.slipPower > 5){
			posY = posY + this.slipPower;
			if( posY >= this.minEdge){
				this.slipPower = 0;
			}else{
				this.slipPower--;
				this.slipNode.y = posY;
			}
		}else if(this.slipPower < -5 ){
			posY = posY + this.slipPower;
			if(posY <= this.maxEdge){
				this.slipPower = 0;
			}else{		
				this.slipPower++;
				this.slipNode.y = posY;
			}
		}else{
			if(posY > this.minEdge){
				posY = posY - (posY - this.minEdge ) * dt / 0.2 - 1
				if(posY  <= this.minEdge) posY = this.minEdge ;
				this.slipNode.y = posY;
			}else if (posY  < this.maxEdge){
				posY = posY + (this.maxEdge  - posY) * dt / 0.2 + 1;
				if(posY >= this.maxEdge) posY = this.maxEdge ;
				this.slipNode.y = posY;
			}
		}
	},
	setLength:function(len){
		this.length = len;
		if(this.mode == 1){
			this.maxEdge = this.cwidth - len;
		}else{
			this.maxEdge = this.cheight - len;
		}
		
	},
	initClipperNode:function(){ 

		var stencil = this.createStencil();
		var slipNode = this.createChooseLayer(); 
		var clipper = new cc.ClippingNode();   
		clipper.stencil = stencil;
		clipper.addChild(slipNode)
		this.addChild(clipper,2);
		this.stencil = stencil;
		this.slipNode = slipNode;
		this.clipper = clipper;
 
        // var ltn1 = cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: false,
        //     onTouchBegan : this.onClipTouchBegan.bind(this), 
        // }, clipper);
        // this.listener.push(ltn1);

        var ltn2 = cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan : this.onViewTouchBegin.bind(this),
            onTouchEnded : this.onViewTouchEnded.bind(this),
            onTouchMoved : this.onViewTouchMoved.bind(this), 
        }, slipNode);
        this.listener.push(ltn2);
		 
	},
	// onClipTouchBegan:function(touch,event){   
	// 	var pos = touch.getLocation();  
	// 	var rect = cc.rect(this.clipper.x + this.x,this.clipper.y + this.y, this.cwidth, this.cheight);
	// 	if (cc.rectContainsPoint(rect,pos)){ 
	// 		return false;
	// 	}
	// 	return true;
	// }, 
	createStencil:function(){
		var scaleX = cc.view.getScaleX();
		var node = cc.LayerColor.create(cc.color(255,255,255,0),this.cwidth / scaleX,this.cheight / scaleX); 
		node.width = this.cwidth;
		node.height = this.cheight;
		return node
	},
	createChooseLayer:function(){
		var node = cc.LayerColor.create();   
		node.anchorX = 0;
		node.anchorY = 0;
		node.x = 0;
		node.y = 0;   
		return node
	}, 
	itemForTouch : function(pos){
		var children = this.slipNode.getChildren();
		for(var i in children){
			// if(!children[i].isLock && !!children[i].BeSelected && children[i].isVisible()){
				var pos_ = children[i].convertToNodeSpace(pos);
				var rect_ = cc.rect(0,0,children[i].getContentSize().width,children[i].getContentSize().height);
				if(cc.rectContainsPoint(rect_,pos_)){ 
					return children[i];
				}
			// }
		}
	},
	onViewTouchBegin:function(touch,event){   
		var _pos = touch.getLocation();  
		var rect = cc.rect(this.clipper.x + this.x,this.clipper.y + this.y, this.cwidth, this.cheight);
		if (cc.rectContainsPoint(rect,_pos)){ 
			var _pos = touch.getLocation();
			this.startPos =  _pos;
			this.mPos = _pos;
			this.press = true;
			this.currentItem = this.itemForTouch(_pos);
			if(this.currentItem){  
				if(this.currentItem.onSelectBegin){ 
					this.currentItem.onSelectBegin();
				} 
				return true;
			}
		} 
		return false;
	}, 
	onViewTouchMoved:function(touch,event){
		var _pos = touch.getLocation();
		var curPos = this.slipNode.getPosition();
		var difPos = cc.pSub(_pos,this.mPos); 
		var newPos = cc.pAdd(curPos,difPos); 
		this.mPos = _pos; 

		if(!!this.currentItem && this.currentItem.onSelectRemove){
            this.currentItem.onSelectRemove();
        }

		if(this.mode == 1){
			if(difPos.x > 0 ){ 
				if(newPos.x > this.minEdge){ 
					var newPos_ = cc.pAdd(curPos,cc.pMult(difPos, ( this.limit - newPos.x) * 0.01));
					if(newPos_.x <= 0) newPos_.x = 0;
					this.slipNode.x = newPos_.x;
					return;
				} 
			}else if(difPos.x < this.maxEdge){ 
				if( newPos.x < this.maxEdge){
					var newPos_ = cc.pAdd(curPos,cc.pMult(difPos,(newPos.x  + this.limit - this.maxEdge) * 0.01));
					if(newPos_.x >= this.maxEdge) newPos_.x = this.maxEdge ; 
					this.slipNode.x = newPos_.x
					return;
				}	
			}
			this.slipNode.x = newPos.x;
		}else{
			if(difPos.y > 0 ){ 
				if(newPos.y > this.minEdge){ 
					var newPos_ = cc.pAdd(curPos,cc.pMult(difPos, ( this.limit - newPos.y) * 0.01));
					if(newPos_.y <= 0) newPos_.y = 0;
					this.slipNode.y = newPos_.y;
					return;
				} 
			}else if(difPos.y < this.maxEdge){ 
				if( newPos.y < this.maxEdge){
					var newPos_ = cc.pAdd(curPos,cc.pMult(difPos,(newPos.y  + this.limit - this.maxEdge) * 0.01));
					if(newPos_.y >= this.maxEdge) newPos_.y = this.maxEdge ; 
					this.slipNode.y = newPos_.y
					return;
				}	
			}
			this.slipNode.y = newPos.y;
		}
		
	},
	onViewTouchEnded:function(touch,event){
		var pos_ = touch.getLocation();
		if(this.mode == 1){
			this.slipPower = (pos_.x - this.mPos.x);
		}else{
			this.slipPower = (pos_.y - this.mPos.y);
		}

		if(!!this.currentItem && this.currentItem.onEffect){ 
			//轻微移动不取消事件
            if(Math.abs(pos_.x - this.startPos.x) <= 20 &&  Math.abs(pos_.y - this.startPos.y) <= 20){ 
                this.currentItem.onEffect();
            } 
            if(this.currentItem.onSelectRemove){
        		this.currentItem.onSelectRemove();
        	} 
		} 
		this.currentItem = false;
		this.startPos = false;
		this.press = false;
		this.mPos = false;
	},
	onExit:function(){
		this._super();
		for (var i = 0; i < this.listener; i++) {
			cc.eventManager.removeListener(this.listener[i]);
		};
	},
});