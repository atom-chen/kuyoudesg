
var kit = kit || {};

kit.posRtt = function(pos,rad,center){
    center.x = center.x||0;
    center.y = center.y||0;
    var sina=Math.sin(rad)
    var cosa=Math.cos(rad)
    var x= (pos.x-center.x)*cosa - (pos.y-center.y)*sina +center.x
    var y= (pos.x-center.x)*sina + (pos.y-center.y)*cosa +center.y
    return pos;
}
kit.posRtt00 = function(pos,rad){
    var sina=Math.sin(rad)
    var cosa=Math.cos(rad)
    var x= pos.x*cosa - pos.y*sina
    var y= pos.x*sina + pos.y*cosa
    pos.x=x;
    pos.y=y;
    return pos;
}
kit.vector2Radian = function(dx,dy){
    var rad=0;
    if( dy===0 ){
        if( dx>0 ){
            rad=0;
        }else{
            rad=Math.PI;
        }
    }else if( dy>0 ){
        rad=-Math.atan(dx/dy)+Math.PI*0.5;
    }else if( dy<0 ){
        rad=-Math.atan(dx/dy)-Math.PI*0.5;
    }
    if( rad<0 ){ rad=rad+Math.PI*2 }
    return rad
}
kit.radian2Degree = function(rad) {
    return rad * 57.29577951
}
kit.degree2Radian = function(deg) {
    return deg * 0.017453292521
}
kit.rndInt = function(m,n){
    return m+parseInt(Math.random()*(n-m+1),10)
}
kit.norm = function(dx,dy){
    return Math.sqrt(dx*dx+dy*dy);
}

kit.clone = function(sObj){   
    if(typeof sObj !== "object" || sObj === null){
        return sObj;
    }
    if(sObj.constructor == Array){
        var s = [];
    }else{
        var s = {};
    }
    for(var i in sObj){
        s[i] = kit.clone(sObj[i]);
    }
    return s;
}

kit.addObj = function(target,obj){
    for(var i in obj){
        if(!target[i]){
            target[i] = obj[i];
        }
    }
};

kit.bitsOne = function(i){
    return 0x1<<i;
};
kit.bitsAll = function(){
    return 0xffff;
};

kit.numApproach  = function(n,target,speed){
	
	if(n > target){
		n = n - speed;
		if(n<target){
			n = target;
		}
	}else if(n < target){
		n = n + speed;
		if(n>target){
			n = target;
		}
	}

	return n;
};

kit.gameTimer = function(o,i,t,dt,callAtOnce){
    dt = dt || 0.016;
	if (!o.gameTimerFromKit)
		o.gameTimerFromKit = {};	
	if (!o.gameTimerFromKit[i] && o.gameTimerFromKit[i]!=0) {
		o.gameTimerFromKit[i] = callAtOnce && 0 || dt;
		return;
	}else{ 
		o.gameTimerFromKit[i] = o.gameTimerFromKit[i] + dt;
		if (o.gameTimerFromKit[i] >= t){
			o.gameTimerFromKit[i] = 0;
			return true;
		}else{
			return;
		}
	}		
};

kit.isCollided = function(x1,y1,w1,h1,x2,y2,w2,h2){
	return Math.abs(x1-x2)*2<w1+w2 && Math.abs(y1-y2)*2<h1+h2
}

kit.rectCollided = function(rect1,rect2,widthOrHeightCanBeNegative){
    var x1 = rect1.x + rect1.width/2;
    var x2 = rect2.x + rect2.width/2;
    var y1 = rect1.y + rect1.height/2;
    var y2 = rect2.y + rect2.height/2;
    var w1 = rect1.width;
    var h1 = rect1.height;
    var w2 = rect2.width;
    var h2 = rect2.height;
    if(widthOrHeightCanBeNegative){ //允许宽高为负数
        w1 = Math.abs(w1);
        h1 = Math.abs(h1);
        w2 = Math.abs(w2);
        h2 = Math.abs(h2);
    }
    return kit.isCollided(x1,y1,w1,h1,x2,y2,w2,h2);
}

kit.isLinesCross = function(x1,y1,x2,y2,x3,y3,x4,y4){	//判断线段相交
	if (x1-x2==0 && x3-x4 == 0){ 	
		if (x1==x3){ 
			if ((y1>=y3 && y1<=y4) || (y2>=y3 && y2<=y4)){	///都垂直情况下
				return true;
			}
		}
			return false; 
	}

	var a,b,m,n 

	a=(y1-y2)/(x1-x2)	
	b=y1-a*x1
	m=(y3-y4)/(x3-x4)	
	n=y3-m*x3
	
	if (a==m && b!=n){	//平行不重叠则返回false
		return false;
	}	
	var X =(n-b)/(a-m)
	var Y = a*X+b

	if (x1-x2==0 || x3-x4 == 0){ 	//有任意线段垂直
		X=x1-x2==0 && x1 || x3
		Y = a*X+b;
	} 

	var xBetweenLine1,yBetweenLine1,xBetweenLine2,yBetweenLine2 
	if (X>=x1 && x2>=X || X <= x1 && x2<=X)  xBetweenLine1 = true;
	if (Y>=y1 && y2>=Y || Y <= y1 && y2<=Y)  yBetweenLine1 = true; 
	if (X>=x3 && x4>=X || X <= x3 && x4<=X)  xBetweenLine2 = true;
	if (Y>=y3 && y4>=Y || Y <= y3 && y4<=Y)  yBetweenLine2 = true;
	if  (xBetweenLine1 && yBetweenLine1 &&  xBetweenLine2 && yBetweenLine2) {
		return true;
	} 
	

}

kit.isLineCrossBox = function(x1,y1,x2,y2,X,Y,W,H){	//判断线段与矩形相交(需补充线段在矩形内条件)
	return kit.isLinesCross(x1,y1,x2,y2,X-W/2,Y-H/2,X+W/2,Y-H/2) || kit.isLinesCross(x1,y1,x2,y2,X-W/2,Y-H/2,X-W/2,Y+H/2)
	|| kit.isLinesCross(x1,y1,x2,y2,X+W/2,Y-H/2,X+W/2,Y+H/2)
	|| kit.isLinesCross(x1,y1,x2,y2,X-W/2,Y+H/2,X+W/2,Y+H/2);
	
}

kit.getNumBit = function(num){		//获得数位
	

	if (num == 0){
		return 1
	}
	var num = num
	var ct = 0
	while(num>=1){  
		num=num/10
		ct = ct +1
	}
	return ct
}

kit.rndND = function(){ //获得正态分布随机数
    var x1 = Math.random();
    var x2 = Math.random();
    var r = Math.sqrt(-2 * Math.log(x2))
    var o = 2 * Math.PI * x1
    var z = r * Math.cos(o)  
    return z
}

kit.rndNDF = function(base,delta){ //获得带修正值的正态分布随机整数
    var z = kit.rndND()/3  //分母值越高分布越往中间值集中
    z > 1 ? z =1 : z;
    z < -1 ? z = -1 : z;
    z = (base||0) + z * (delta||1);
    z = Math.round(z);
    return z
}

kit.getNumFromCount = function(num,i){  //num 是数字,count 是总位数,i是要取得位数
	var count = kit.getNumBit(num);
	return Math.floor(num/Math.pow(10,i-1))%10
}

kit.isValEmpty = function(mixed_var) {  //判断空值
    var key;  
    if (mixed_var === "" || mixed_var === 0 || mixed_var === "0" || mixed_var === null || mixed_var === false || typeof mixed_var === 'undefined') {  
        return true;  
    }  
    return false;  
}  

kit.setCompatibleWithNewData = function(oldData,newData){  //对象数据兼容
    for(var i in newData){
		if (typeof(oldData[i]) == "object" && typeof(newData[i]) == "object"){
			kit.setCompatibleWithNewData(oldData[i],newData[i])
		}else if(kit.isValEmpty(oldData[i])){
			oldData[i] = newData[i]
	   } 
    }
}

kit.setDirectionByPos = function(obj,oldPos,curPos){     //通过坐标差改变目标的朝向
	var rad = kit.vector2Radian((curPos.x - oldPos.x),(curPos.y - oldPos.y));
	obj.setRotation(kit.radian2Degree(-rad));
}

kit.removeNodeFromArray = function(arr,node){         //删除数组的指定节点
	for(var i = 0 ; i < arr.length ; ++ i) {
		if(arr[i] === node){
			return arr.splice(i,1);
		}
	}
}

kit.checkNodeInObject = function(obj,node){  //检测对象中是否包含节点
	for(var i in obj){
		if(obj[i] == node){
			return i
		}
	}
}

//判断两个日期是否是连续的，即只相差一天
kit.isTwoDateContinuous = function(date1, date2){
    var bigDate = new Date(date2.getFullYear(),date2.getMonth(),date2.getDate());
    var smallDate = new Date(date1.getFullYear(),date1.getMonth(),date1.getDate());

    if(Math.abs(bigDate.getTime() - smallDate.getTime()) == 86400000){//只相差一天时间
        return true;
    }else{
        return false;
    }
}

//判断两个日期是否是同一天
kit.isTheSameDay = function(date1, date2){
    var bigDate = new Date(date2.getFullYear(),date2.getMonth(),date2.getDate());
    var smallDate = new Date(date1.getFullYear(),date1.getMonth(),date1.getDate());

    if(bigDate.getTime() - smallDate.getTime() == 0){//同一天
        return true;
    }else{
        return false;
    }
}
 
kit.encrypt = function (str, pwd) {
    if(pwd == null || pwd.length <= 0) {
        //alert("Please enter a password with which to encrypt the message.");
        return null;
    }
    var prand = "";
    for(var i=0; i<pwd.length; i++) {
        prand += pwd.charCodeAt(i).toString();
    }
    var sPos = Math.floor(prand.length / 5);
    var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
    var incr = Math.ceil(pwd.length / 2);
    var modu = Math.pow(2, 31) - 1;
    if(mult < 2) {
        //alert("Algorithm cannot find a suitable hash. Please choose a different password. \nPossible considerations are to choose a more complex or longer password.");
        return null;
    }
    var salt = Math.round(Math.random() * 1000000000) % 100000000;
    prand += salt;
    while(prand.length > 10) {
        prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
    }
    prand = (mult * prand + incr) % modu;
    var enc_chr = "";
    var enc_str = "";
    for(var i=0; i<str.length; i++) {
        enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
        if(enc_chr < 16) {
            enc_str += "0" + enc_chr.toString(16);
        } else enc_str += enc_chr.toString(16);
        prand = (mult * prand + incr) % modu;
    }
    salt = salt.toString(16);
    while(salt.length < 8)salt = "0" + salt;
    enc_str += salt;
    return enc_str;
}

kit.decrypt = function(str, pwd) {
    if(str == null || str.length < 8) {
        //alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
        return;
    }
    if(pwd == null || pwd.length <= 0) {
        //alert("Please enter a password with which to decrypt the message.");
        return;
    }
    var prand = "";
    for(var i=0; i<pwd.length; i++) {
        prand += pwd.charCodeAt(i).toString();
    }
    var sPos = Math.floor(prand.length / 5);
    var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
    var incr = Math.round(pwd.length / 2);
    var modu = Math.pow(2, 31) - 1;
    var salt = parseInt(str.substring(str.length - 8, str.length), 16);
    str = str.substring(0, str.length - 8);
    prand += salt;
    while(prand.length > 10) {
        prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
    }
    prand = (mult * prand + incr) % modu;
    var enc_chr = "";
    var enc_str = "";
    for(var i=0; i<str.length; i+=2) {
        enc_chr = parseInt(parseInt(str.substring(i, i+2), 16) ^ Math.floor((prand / modu) * 255));
        enc_str += String.fromCharCode(enc_chr);
        prand = (mult * prand + incr) % modu;
    }
    return enc_str;
}

//Utf8 to unicode
kit.Utf8ToUnicode = function(strUtf8) {
        if(!strUtf8){
            return;
        }

        var bstr = "";  
        var nTotalChars = strUtf8.length; // total chars to be processed.  
        var nOffset = 0; // processing point on strUtf8  
        var nRemainingBytes = nTotalChars; // how many bytes left to be converted  
        var nOutputPosition = 0;  
        var iCode, iCode1, iCode2; // the value of the unicode.  
        while (nOffset < nTotalChars) {  
            iCode = strUtf8.charCodeAt(nOffset);  
            if ((iCode & 0x80) == 0) // 1 byte.  
            {  
                if (nRemainingBytes < 1) // not enough data  
                    break;  
                bstr += String.fromCharCode(iCode & 0x7F);  
                nOffset++;  
                nRemainingBytes -= 1;  
            }  
            else if ((iCode & 0xE0) == 0xC0) // 2 bytes  
            {  
                iCode1 = strUtf8.charCodeAt(nOffset + 1);  
                if (nRemainingBytes < 2 || // not enough data  
                        (iCode1 & 0xC0) != 0x80) // invalid pattern  
                {  
                    break;  
                }  
                bstr += String  
                        .fromCharCode(((iCode & 0x3F) << 6) | (iCode1 & 0x3F));  
                nOffset += 2;  
                nRemainingBytes -= 2;  
            } else if ((iCode & 0xF0) == 0xE0) // 3 bytes  
            {  
                iCode1 = strUtf8.charCodeAt(nOffset + 1);  
                iCode2 = strUtf8.charCodeAt(nOffset + 2);  
                if (nRemainingBytes < 3 || // not enough data  
                        (iCode1 & 0xC0) != 0x80 || // invalid pattern  
                        (iCode2 & 0xC0) != 0x80) {  
                    break;  
                }  
                bstr += String.fromCharCode(((iCode & 0x0F) << 12)  
                        | ((iCode1 & 0x3F) << 6) | (iCode2 & 0x3F));  
                nOffset += 3;  
                nRemainingBytes -= 3;  
            } else  
                // 4 or more bytes -- unsupported  
                break;  
        }  
        if (nRemainingBytes != 0) { // bad UTF8 string.                  
            return "";  
        }  
        return bstr;  
    }