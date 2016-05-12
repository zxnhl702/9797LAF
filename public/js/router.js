/**
 * Created by jf on 2015/9/11.
 */

$(function () {
	
	var openid = _getPar("openid");
	var qrno = "";
	var totalscore = 0;

	var pageManager = {
		$container: $('.js_container'),
		_pageStack: [],
		_configs: [],
		_defaultPage: null,
		_pageIndex: 1,
		setDefault: function (defaultPage) {
			this._defaultPage = this._find('name', defaultPage);
			return this;
		},
		init: function () {
			var self = this;

			$(window).on('hashchange', function () {
				var state = history.state || {};
				var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
				var page = self._find('url', url) || self._defaultPage;
				if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
					self._back(page);
				} else {
					self._go(page);
				}
			});

			if (history.state && history.state._pageIndex) {
				this._pageIndex = history.state._pageIndex;
			}

			this._pageIndex--;

			var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
			var page = self._find('url', url) || self._defaultPage;
			this._go(page);
			return this;
		},
		push: function (config) {
			this._configs.push(config);
			return this;
		},
		go: function (to) {
			var config = this._find('name', to);
			if (!config) {
				return;
			}
			location.hash = config.url;
		},
		_go: function (config) {
			this._pageIndex ++;

			history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

			var html = $(config.template).html();
			var $html = $(html).addClass('slideIn').addClass(config.name);
			this.$container.append($html);
			this._pageStack.push({
				config: config,
				dom: $html
			});

			if (!config.isBind) {
				this._bind(config);
			}

			return this;
		},
		back: function () {
			history.back();
		},
		_back: function (config) {
			this._pageIndex --;

			var stack = this._pageStack.pop();
			if (!stack) {
				return;
			}

			var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
			var found = this._findInStack(url);
			if (!found) {
				var html = $(config.template).html();
				var $html = $(html).css('opacity', 1).addClass(config.name);
				$html.insertBefore(stack.dom);

				if (!config.isBind) {
					this._bind(config);
				}

				this._pageStack.push({
					config: config,
					dom: $html
				});
			}

			stack.dom.addClass('slideOut').on('animationend', function () {
				stack.dom.remove();
			}).on('webkitAnimationEnd', function () {
				stack.dom.remove();
			});

			return this;
		},
		_findInStack: function (url) {
			var found = null;
			for(var i = 0, len = this._pageStack.length; i < len; i++){
				var stack = this._pageStack[i];
				if (stack.config.url === url) {
					found = stack;
					break;
				}
			}
			return found;
		},
		_find: function (key, value) {
			var page = null;
			for (var i = 0, len = this._configs.length; i < len; i++) {
				if (this._configs[i][key] === value) {
					page = this._configs[i];
					break;
				}
			}
			return page;
		},
		_bind: function (page) {
			var events = page.events || {};
			for (var t in events) {
				for (var type in events[t]) {
					this.$container.on(type, t, events[t][type]);
				}
			}
			page.isBind = true;
		}
	};

	var home = {
		name: 'home',
		url: '#',
		template: '#tpl_home',
		events: {
			'.js_grid': {
				click: function (e) {
					var id = $(this).data('id');
					pageManager.go(id);
				}
			}
		}
	};
	
	// 寻物登记
	var lose = {
		name: 'lose',
		url: '#lose',
		template: '#tpl_lose',
		events:{
			// 返回
			'#lose_back':{
				click: function(e){
					// 清空表单数据
					$('#lostername').val("");
					$('#lostersex').val("0");
					$('#losterphone').val("");
					$('#losttime').val("");
					$('#departure').val("");
					$('#destination').val("");
					$('#num').val("");
					$('#lostlocation').val("");
					$('#lostdescription').val("");
					// 页面跳转
					pageManager.back();
				}
			},
			// 寻物登记提交
			'#lose_submit':{
				click:function(e){
					// 获取表单数据
					var name = $.trim($('#lostername').val());
					var sex = $.trim($('#lostersex').val());
					var phone = $.trim($('#losterphone').val());
					var losttime = $.trim($('#losttime').val());
					var dept = $.trim($('#departure').val());
					var dest = $.trim($('#destination').val());
					var num = $.trim($('#num').val());
					var lostlocation = $.trim($('#lostlocation').val());
					var description = $.trim($('#lostdescription').val());
					
					// 表单数据检查
					if(_isStringNull(name)) return warningtoast('toast', "请填写姓名");
					if("0" == sex) return warningtoast('toast', "请选择性别");
					if(_isStringNull(phone)) return warningtoast('toast', "请填写电话");
					if(_isStringNull(losttime)) return warningtoast('toast', "请填写时间");
					if(_isStringNull(dept)) return warningtoast('toast', "请填写上车地点");
					if(_isStringNull(dest)) return warningtoast('toast', "请填写下车地点");
					if(_isStringNull(num)) return warningtoast('toast', "请填写乘车人数");
					if(_isStringNull(lostlocation)) return warningtoast('toast', "请填写遗失位置");
					if(_isStringNull(description)) return warningtoast('toast', "请填写失物描述");
					if(!(_isTelephoneNumber(phone)) && !_isCellPhoneNumber(phone)) return warningtoast('toast', "电话号码格式错误");
					if(!_isNumber(num)) return warningtoast('toast', "乘车人数格式错误");
					if(parseInt(num) <= 0) return warningtoast('toast', "乘车人数应该至少为1人");
					startloading();
					// 登记失物信息
					_callAjax({
						"cmd": "newLostAndFound",
						"openid": openid,
						"name": name,
						"sex": sex,
						"phone": phone,
						"losttime": losttime.replace("T", " "),
						"dept": dept,
						"dest": dest,
						"num": num,
						"location": lostlocation,
						"description": description
					}, function(d) {
						if(d.success) {
							stoploading();
							successtoast('toast2', "登记成功");
							setTimeout(function() {
								// 清空表单数据
								$('#lostername').val("");
								$('#lostersex').val("0");
								$('#losterphone').val("");
								$('#losttime').val("");
								$('#departure').val("");
								$('#destination').val("");
								$('#num').val("");
								$('#lostlocation').val("");
								$('#lostdescription').val("");
								// 页面跳转
								pageManager.go('msg');
							}, 1500);
						} else {
							warningtoast('toast', "登记失败");
						}
					})
				}
			}
		}
	};
	
	// 文明的士
	var driver = {
		name: 'driver',
		url: '#driver',
		template: '#tpl_driver',
		events:{
			// 返回
			'#driver_back':{
				click: function(e){
					// 清空表单数据
					$('#drivername').val("");
					$('#driversex').val("0");
					$('#driverphone').val("");
					$('#drivercerno').val("");
					$('#drivercompany').val("");
					$('#drivercarno').val("");
					$('#remark').val("");
					pageManager.back();
				}
			},
			// 文明的士提交
			'#driver_submit':{
				click:function(e){
					// 取得表单数据
					var name = $.trim($('#drivername').val());
					var sex = $.trim($('#driversex').val());
					var phone = $.trim($('#driverphone').val());
					var qcno = $.trim($('#driverqcno').val());
					var company = $.trim($('#drivercompany').val());
					var carno = $.trim($('#drivercarno').val()).toUpperCase();
					var remark = $.trim($('#remark').val());
					remark = _isStringNull(remark) ? "无" : remark;
					
					// 表单数据检查
					if(_isStringNull(name)) return warningtoast('toast', "请填写姓名");
					if(_isStringNull(sex)) return warningtoast('toast', "请选择性别");
					if(_isStringNull(phone)) return warningtoast('toast', "请填写电话");
					if(_isStringNull(qcno)) return warningtoast('toast', "请填写从业资格证号码");
					if(_isStringNull(company)) return warningtoast('toast', "请填写所在公司");
					if(_isStringNull(carno)) return warningtoast('toast', "请填写车牌号");
					if(!(_isTelephoneNumber(phone)) && !_isCellPhoneNumber(phone)) return warningtoast('toast', "电话号码格式错误");
					if(carno.indexOf("浙L") < 0) return warningtoast('toast', "车牌号格式错误");
					startloading();
					// 文明的士登记
					_callAjax({
						"cmd": "newDriver",
						"openid": openid,
						"name": name,
						"sex": sex,
						"phone": phone,
						"qcno": qcno,
						"company": company,
						"carno": carno,
						"remark": remark
					}, function(d) {
						if(d.success) {
							stoploading();
							successtoast('toast2', "登记成功");
							setTimeout(function() {
								// 清空表单数据
								$('#drivername').val("");
								$('#driversex').val("0");
								$('#driverphone').val("");
								$('#driverqcno').val("");
								$('#drivercompany').val("");
								$('#drivercarno').val("");
								$('#remark').val("");
								// 页面跳转
								pageManager.go('msg');
							}, 1500);
						} else {
							warningtoast('toast', "登记失败");
						}
					})
				}
			},
			// 查看规则
			'#rules':{
				click:function(e){
					pageManager.go('rules');
				}
			}
		}
	};

	// 积分查询
	var inquiry = {
		name:'inquiry',
		url:'#inquiry',
		template:'#tpl_inquiry',
		events:{
			'#search_input':{
				focus:function(){
					//searchBar
					var $weuiSearchBar = $('#search_bar');
					$weuiSearchBar.addClass('weui_search_focusing');
				},
				blur:function(){
					var $weuiSearchBar = $('#search_bar');
					$weuiSearchBar.removeClass('weui_search_focusing');
					if($(this).val()){
						$('#search_text').hide();
					}else{
						$('#search_text').show();
					}
				},
				// 输入资格证号码 查询积分
				input:function(){
					
				}
			},
			"#search_processed": {
				touchend: function() {
					var $searchShow = $("#search_show");
					qcno = $("#search_input").val();
					console.log(qcno);
					if(qcno){
						if(!_isNumber(qcno)) return warningtoast('toast', "从业资格证号格式错误");
						if(qcno.length >= 18) {
							startloading();
							// 取得记录
							_callAjax({
								"cmd": "getGoodRecordData",
								"qcno": qcno
							},function(d) {
								if(d.success) {
									// 总积分
									totalscore = d.data.cnt;
									// 记录列表
									$("#recordList").empty();
									if(d.data.records != null && d.data.records.length > 0) {
										d.data.records.forEach(function(r) {
											var str = '<div class="weui_media_box weui_media_text">' + 
													'<p class="weui_media_desc">' + r.name + '</p>' + 
													'<ul class="weui_media_info">' + 
													'<li class="weui_media_info_meta">+ ' + r.score + '分</li>' + 
													'<li class="weui_media_info_meta">' + r.htime + '</li>' + 
													'</ul></div>';
											$("#recordList").append(str);
										})
									}
									// 取得兑换记录
									_callShopAjax({
										"cmd": "getOrders",
										"open_id": qcno
									}, function(dd) {
										stoploading();
										if(dd.success) {
											if(dd.data != null && dd.data.length > 0) {
												dd.data.forEach(function(r) {
													totalscore -= r.score
													var str = '<div class="weui_media_box weui_media_text">' + 
															'<p class="weui_media_desc">' + r.name + '</p>' + 
															'<ul class="weui_media_info">' + 
															'<li class="weui_media_info_meta">- ' + r.score + '分</li>' + 
															'<li class="weui_media_info_meta">' + r.htime + '</li>' + 
															'</ul></div>';
													$("#recordList").append(str);
												})
											}
											$("#totalscore").text(totalscore);
										}
									})
									// 显示列表
									$searchShow.show();
								}
							})
						} else {
							// 清除记录
							$("#recordList").empty();
							$searchShow.hide();
						}
						
					}else{
						$searchShow.hide();
					}
				}
			},
			"#search_clear":{
				touchend:function(){
					qcno = null;
					totalscore = 0;
					$("#search_show").hide();
					$('#search_input').val('');
				}
			},
			// 跳转到积分兑换
			'#exchange-btn':{
				click:function(){
					if(totalscore > 0) {
						pageManager.go('exchange');
						showGoodList();
					} else {
						warningtoast('toast', "没有积分，无法兑换");
					}
				}
			}
		}
	}

	var msg = {
		name:'msg',
		url:'#msg',
		template:'#tpl_msg',
		events:{
			'#msg_sure':{
				click:function(e){
					pageManager.back();
				}
			}
		}
	}
	
	var rules = {
		name:'rules',
		url:'#rules',
		template:'#tpl_rules',
		events:{
			'#rules_back':{
				click:function(e){
					pageManager.back();
				}
			}
		}
	}
	
	// 积分兑换
	var exchange = {
		name:'exchange',
		url:'#exchange',
		template:'#tpl_exchange'
	}
	
	// 显示商品列表
	var showGoodList = function() {
		console.log("exchange");
		startloading()
		_callShopAjax({
			"cmd": "getGoods"
		}, function(d) {
			stoploading();
			if(d.success) {
				// 清空商品列表
				$('#goods-list').empty();
				if(d.data != null && d.data.length > 0) {
					d.data.forEach(function(r) {
						var str = '<li data-goodid="' + r.id + '">' + 
								'<img src="' + shop_addr + r.img + '" width="100%" />' + 
								'<h5>' + r.name + '</h5>' + 
								'<span class="price"><span>' + r.price + '</span> <small>积分</small></span>' + 
								'<span class="num">剩余 <span>' + r.left + '</span> 件</span>' + '</li>';
						e = $(str).appendTo('#goods-list');
						
						e.on('click', 'img', exchangeGoods);
					})
				} else {
					// 没有商品 提示 显示
					warningtoast('toast', "没有可兑换的商品");
					$('#goods-list').html('<div class="weui_media_box weui_media_text"><div class="weui_media_title" align=center>没有可兑换的商品</div></div>');
				}
			}
		})
	}
	
	// 兑换商品
	var exchangeGoods = function() {
		var $this = $(this);
		// 商品编号
		var goodid = $this.parent().attr("data-goodid");
		// 所需积分
		var score = parseInt($this.parent().find('.price span').text());
		// 剩余库存
		var left = parseInt($this.parent().find('.num span').text());
		confirmDialog('兑换确认', '确定用'+ score +'个积分兑换本商品吗?', function(dialog) {
			// 库存不足
			if(left <= 0) {
				$('#dialog1').off('click').hide();
				return warningtoast('toast', "库存不足");
			}
			// 积分不足
			if(totalscore < score) {
				$('#dialog1').off('click').hide();
				return warningtoast('toast', "积分不足");
			}
			
			// 获取用户信息
			startloading();
			_callAjax({
				"cmd": "getDriverInfo",
				"qcno": qcno
			}, function(d) {
				if(d.success) {
					// 下单
					_callShopAjax({
						"cmd": "order",
						"open_id": d.data.qcno,
						"nick_name": d.data.name,
						"good_id": goodid,
						"phone": d.data.phone,
						"car_no": d.data.carno
					}, function(dd) {
						if(dd.success) {
							stoploading();
							successtoast('toast2', '兑换成功');
							// 修改商品库存
							$this.parent().find('.num span').text(--left);
						} else {
							stoploading();
							warningtoast('toast', "用户验证失败");
						}
					})
				} else {
					stoploading();
					warningtoast('toast', "用户验证失败");
				}
				$('#dialog1').off('click').hide();
			})
		})
	}
	
	// 确认对话框
	var confirmDialog = function(title, msg, yes, no) {
		var $dialog = $('#dialog1');
		// 标题
		$dialog.find('.weui_dialog_title').text(title);
		// 内容
		$dialog.find('.weui_dialog_bd').text(msg);
		$dialog.show();
		// 确定
		$dialog.on('click', '.primary', function() {
			console.log('ok');
			if(undefined == yes) {
				$dialog.off('click').hide();
			} else {
				yes($dialog);
			}
		});
		// 取消
		$dialog.on('click', '.default', function() {
			if(undefined == no) {
				$dialog.off('click').hide();
			} else {
				no($dialog);
			}
		});
	}
	
	// 消息提示的toast
	var warningtoast = function(id, msg) {
		var $toast = $('#' + id);
		if ($toast.css('display') != 'none') {
			return;
		}
		$toast.find('.weui_toast_content').text(msg);
		$toast.show();
		setTimeout(function () {
			$toast.hide();
		}, 1500);
	}
	
	// 操作成功的toast
	var successtoast = function(id, msg) {
		var $toast = $('#' + id);
		if ($toast.css('display') != 'none') {
			return;
		}
		$toast.find('.weui_toast_content').text(msg);
		$toast.show();
		setTimeout(function () {
			$toast.hide();
		}, 1500);
	}
	
	// 开始加载 显示加载toast
	var startloading = function() {
		$('#loadingToast').show();
	}
	
	// 加载结束 隐藏加载toast
	var stoploading = function() {
		$('#loadingToast').hide();
	}
	
	pageManager.push(home)
		.push(lose)
		.push(msg)
		.push(rules)
		.push(driver)
		.push(inquiry)
		.push(exchange)
		.setDefault('home')
		.init();
});
