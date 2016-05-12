var _tell = function(d) { 
	console.log(JSON.stringify(d)); 
};

var _genCallAjax = function(url) {
	return function(data, cb) {
		// plus.nativeUI.showWaiting();
		cb = cb?cb:function(){};
		$.ajax({
			type:"GET",
			async:true,
			url:url,
			dataType:"jsonp",
			jsonp:"callback",
			data:$.extend(data, {token:'Jh2044695'}),
			contentType:"multipart/form-data; charset=UTF-8",
			success: function(d) {
				// print.log(d);
				_tell(d);
				cb(d);
				// plus.nativeUI.closeWaiting();
			},
			error: function(e) {
				// plus.nativeUI.closeWaiting();
			}
		});
	}
};

var _getPar = function (par){
	var local_url = document.location.href;
	var get = local_url.indexOf(par +"=");
	if(get == -1){
		return false;
	}
	var get_par = local_url.slice(par.length + get + 1);
	var nextPar = get_par.indexOf("&");
	if(nextPar != -1){
		get_par = get_par.slice(0, nextPar);
	}
	nextPar = get_par.indexOf("#");
	if(nextPar != -1){
		get_par = get_par.slice(0, nextPar);
	}
	return decodeURIComponent(get_par);
}

//从URL中取得特定参数
function _getParamString(paramName){
	var url = document.location.href;
	var result = new RegExp("(^|)"+paramName+"=([^\&]*)(\&|$)","gi").exec(url),param;
	if(param=result){
		return param[2];
	}
	return "";
}

var _set = function(k,v) { window.localStorage.setItem(k,v); }
var _get = function(k) { return window.localStorage.getItem(k); }
var _del = function(k) { window.localStorage.removeItem(k); }
var _clear = function() { window.localStorage.clear(); }

var project_addr = "http://" + window.location.hostname + ":11009";
var shop_addr = "http://" + window.location.hostname + ":11004";

var _callAjax = _genCallAjax(project_addr+"/laf");
var _callShopAjax = _genCallAjax(shop_addr+"/relay");

var _now = function() {
	var dt = new Date(),
			y = dt.getFullYear(), n
			m = dt.getMonth()+1+"",
			d = dt.getDate()+"",
			time = dt.toLocaleTimeString();

	if (m.length == 1) m = "0"+m;
	if (d.length == 1) d = "0"+d;
	return y+"-"+m+"-"+d+" "+time;
};

var _at = function(arr, id) {
	if (id < 0) id = arr.length+id;
	return arr[id];
}

var _loading = function() {
	$('<section id="mask" style="position:fixed; top:0; left:0; height:100%; width:100%; z-index:10000"></section>').appendTo("body");
	//spinner.spin(document.getElementById("mask"));
	/*
	$(".load").animate({marginTop:"0px",opacity:"1"},400,'linear');
	*/
}

var _stopLoading = function() {
	//spinner.spin();
	$("#mask").remove();
	/*
	setTimeout(function(){
		$(".load").animate({marginTop:"-20px",opacity:"0"},500,'linear');
	},1000);
	*/
}

var _genPostAjax = function(url) {
	return function(data, cb) {
		cb = cb?cb:function(){};
		$.ajax({
			type:"POST",
			async:true,
			url:url,
			dataType:"json",
			jsonp:"callback",
			data:data,
			// contentType:"multipart/form-data; charset=UTF-8",
			success: function(d) {
				console.log(d);
				cb(d);
			},
		});
	}
};

var _getTimeNow = function timeStamp(){     
	var datetime = new Date();     
	//datetime.setTime(time);     
	var year = datetime.getFullYear();     
	var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;     
	var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();     
	var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();     
	var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();     
	var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();  
	return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second; 
}

var _isWeixin = function() {
	var ua = navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i)=="micromessenger") {
		return true;
 	} else {
		return false;
	}
}

// 检查字符串是否为空
var _isStringNull = function(str) {
	if("" == str || null == str) {
		return true;
	} else {
		return false;
	}
}

// 检查图片格式
var _checkImgType = function(filename) {
	var pattern = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/;
	return pattern.test(filename);
}

//检查图片格式
var _checkJPGImgType = function(filename) {
	var pattern = /\.(jpg|JPG)$/;
	return pattern.test(filename);
}

// 检查座机号码
var _isTelephoneNumber = function(str) {
	var pattern = /^[1-9]\d{6}$/;
	return pattern.test(str);
}

// 检查带区号的座机号码
var _isDistTelNumber = function(str) {
	var pattern = /^0\d{2,3}-[1-9]\d{6,7}$/;
	return pattern.test(str);
}

// 检查手机号码
var _isCellPhoneNumber = function(str) {
	var pattern = /^(13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}$|^170[059]\d{7}$/;
	return pattern.test(str);
}

// 检查金额格式
var _isCurrency = function(str) {
	var pattern = /^[1-9]\d*.\d{1,2}$|^0.\d{1,2}$|^[1-9]\d*$/;
	return pattern.test(str);
}

//检查数字
var _isNumber = function(str) {
	var pattern = /^\d+$/;
	return pattern.test(str)
}