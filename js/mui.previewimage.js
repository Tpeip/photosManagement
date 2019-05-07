// document.write("<script language=javascript src='websql.js'></script>");
(function($, window) {

	var template =
		'<div id="{{id}}" class="mui-slider mui-preview-image mui-fullscreen">'+
			'<div class="mui-preview-header">'+
				'<header id="header-nav" class="mui-bar mui-bar-nav">'+
				'<div id="back"><a class="mui-icon mui-icon-left-nav mui-pull-left" style="font-size:28px;"></a></div>' +
				'<div id="info"><a class="mui-icon mui-icon-info mui-pull-right" style="font-size:28px;"></a></div>{{header}}' +
				'</header>'+
			'</div>'+
			'<div class="mui-slider-group" ></div>' +
			'<div class="mui-preview-footer mui-hidden" style="box-shadow:1px 1px 4px 1px #ccc inset">'+
				'<div class="mui-content">'+
					'<nav class="mui-bar mui-bar-tab">'+
						'<a id="delete" class="mui-tab-item" style="text-align:center;vertical-align:middle;">'+
							'<span class="mui-icon mui-icon-trash" style="font-size:32px;margin-bottom:14px;"></span>'+
						'</a>'+
						'<a class="mui-tab-item" href=""></a>'+
						'<a class="mui-tab-item" href=""></a>'+
						'<a class="mui-tab-item" href=""></a>'+
						'<a id="forward" class="mui-tab-item">'+
							'<span class="mui-icon mui-icon-redo" style="font-size:32px;margin-bottom:14px;"></span>'+
						'</a>'+
					'</nav>'+'{{footer}}'+
				'</div>'+
// 				'<div id="delete" class="mui-popover mui-popover-action mui-popover-bottom">'+
// 					'<ul class="mui-table-view">'+
// 						'<li class="mui-table-view-cell"><a href="#" style="color: #FF3B30;">删除</a></li>'+
// 					'</ul>'+
// 					'<ul class="mui-table-view">'+
// 						'<li class="mui-table-view-cell"><a href="#delete"><b>取消</b></a></li>'+
// 					'</ul>'+
// 				'</div>'+
// 				'<div id="forward" class="mui-popover mui-popover-action mui-popover-bottom">'+
// 					'<ul class="mui-table-view">'+
// 						'<li class="mui-table-view-cell"><a href="#">转发</a></li>'+
// 						'<li class="mui-table-view-cell"><a href="#">打印</a></li>'+
// 					'</ul>'+
// 					'<ul class="mui-table-view">'+
// 						'<li class="mui-table-view-cell"><a href="#forward"><b>取消</b></a></li>'+
// 					'</ul>'+
// 				'</div>'+
			'</div>'+
			'<div class="mui-preview-loading" >'+
				'<span class="mui-spinner mui-spinner-white"></span>'+
			'</div>'+
		'</div>';
	//scroller
	var itemTemplate =
		'<div id="slide" class="mui-slider-item mui-zoom-wrapper mui-color {{className}}" style="background-color:white">' +
		'<div class="mui-zoom-scroller">' +
		'<img src="{{src}}" data-preview-lazyload="{{lazyload}}" style="{{style}}" class="mui-zoom" >' +
		'</div>' +
		'<div id="div"></div>' +
		// '{{content}}'+
		'</div>';
	var defaultGroupName = '__DEFAULT';
	var div = document.createElement('div');
	var imgId = 0;
	// var PreviewImage = function(options) {
	var PreviewImage = function(func1, func2) {
		this.options = $.extend(true, {
			id: '__MUI_PREVIEWIMAGE',
			zoom: true,
			//header: '<span class="mui-preview-indicator"></span>',
			header: '',
			//footer: '';
			footer: '<span></span>'
			// }, options || {});
		});
		this.func1 = func1;
		this.func2 = func2;
		this.init();
		this.initEvent();
	};
	var proto = PreviewImage.prototype;
	proto.init = function() {
		var options = this.options;
		var el = document.getElementById(this.options.id);
		if (!el) { //el为空
			div.innerHTML = template.replace(/\{\{id\}\}/g, this.options.id).replace('{{header}}', options.header).replace(
				'{{footer}}', options.footer);
			document.body.appendChild(div.firstElementChild); //添加template
			el = document.getElementById(this.options.id); //el获取到template区域
			back = document.getElementById('back');
			del = document.getElementById('delete');
			forward = document.getElementById('forward');
			info = document.getElementById('info');
		}

		this.element = el; //template区域
		this.scroller = this.element.querySelector($.classSelector('.slider-group'));
		this.indicator = this.element.querySelector($.classSelector('.preview-indicator'));
		this.loader = this.element.querySelector($.classSelector('.preview-loading'));
		this.backer = back;
		this.deleter = del;
		this.forwarder = forward;
		this.infoer = info;
		this.header = this.element.querySelector($.classSelector('.preview-header'));
		// console.log("header",this.header);
		this.footer = this.element.querySelector($.classSelector('.preview-footer'));
		// this.header.classList.add($.className('hidden'));
		//this.popover = this.element.querySelector($.classSelector('.popover'));
		if (options.footer) {
			this.element.querySelector($.classSelector('.preview-footer')).classList.remove($.className('hidden'));
		}
		this.addImages();
	};
	proto.initEvent = function() {
		var self = this;
		$(document.body).on('tap', 'img[data-preview-src]', function() {
			self.open(this);
			return false;
		});
		var show = true;
		var laterClose = null;
		var laterCloseEvent = function() {
			!laterClose && (laterClose = $.later(function() {
// 				self.loader.removeEventListener('tap', laterCloseEvent);
// 				self.scroller.removeEventListener('tap', laterCloseEvent);
				self.close();  //点击图片后回到小图预览
				self.backer.removeEventListener('tap', laterCloseEvent);
			}, 300));
		};
		var laterHideEvent = function() {
				if(show){
					self.header.classList.add($.className('hidden'));
					self.footer.classList.add($.className('hidden'));
					// self.scroller.style('background-color','black');
					// self.scrollers.classList.remove($.className('mui-color'));
					show = false;
				}else{
					self.header.classList.remove($.className('hidden'));
					self.footer.classList.remove($.className('hidden'));
					show = true;
				}
		};
		var laterDeleteEvent = function(){
			var buttonAry = [{
				title: '删除照片',
				style: 'destructive'
			}];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: buttonAry
			},function(event){
				var index = event.index;
				switch(index){
					case 0:
					    
						break;
					case 1:{
						var image_path = localStorage.getItem('path');
						// self.openByGroup(0,1);
						deleteImage(image_path);
						self.close();												
						
						// self.open(this);
						// var list = plus.webview.currentWebview().opener();
						//触发列表界面的自定义事件（refresh）,从而进行数据刷新
						// mui.fire(list, 'refresh');
						// plus.webview.currentWebview().close();
						break;
					}
					   
				}
			});
			this.classList.remove('mui-active');
		};
		var deleteImage = function(image_path){
			getImageByPath(image_path).then(function(imageRes){
				let image_type = imageRes.rows.item(0).image_main_type;
				deleteOneImage(image_path).then(function(){
					setHtml();
				});
				if(image_type == '人物'){
					getPersonImage(image_path).then(function(personRes){
						deleteOnePerson(image_path);
						let length = personRes.rows.length;
						for(let i = 0;i < length; i++){
							let group_id = personRes.rows.item(i).group_id;
							let face_src = personRes.rows.item(i).face_src;
							getGroupFaceById(group_id).then(function(groupRes){
								let image_num = groupRes.rows.item(0).image_num;
								let group_face_src = groupRes.rows.item(0).face_src;
								if(image_num == 1){
									DeleteGroup(group_id);
									DeleteRelation(group_id);
								}else{
									if(face_src == group_face_src){
										getFaceByGroup(group_id).then(function(res){
											let new_face_src = res.rows.item(0).face_src;
											UpdateGroupFaceSrc(group_id, new_face_src);
										})
									}
								}
							})
						}
					})
				}
			})
		};
		var laterForwardEvent = function(){
			var buttonAry = [
				{
					title: '分享',
				},
				{
					title: '打印'
				}
				];
			plus.nativeUI.actionSheet({
				cancel: '取消',
				buttons: buttonAry
			},function(event){
				var index = event.index;
				switch(index){
					case 0:
						break;
					case 1:
					    break;
					case 2:
						break;
				}
			});
			this.classList.remove('mui-active');
		};
		var laterOpenEvent = function(){
			mui.openWindow({
				url: 'info.html',
				show: {
					autoShow: true,
					aniShow: 'slide-in-top',
					duration: 500
				}
			});
		};
		// 		this.scroller.addEventListener('tap',function(){
		// 			this.footer.classList.add($.className('hidden'));
		// 			this.header.classList.add($.className('hidden'));
		// 		});
		this.scroller.addEventListener('doubletap', function() {
			if (laterClose) {
				laterClose.cancel();
				laterClose = null;
			}
		});
		//在webkit搜索引擎中，当animate动画结束时执行
		this.element.addEventListener('webkitAnimationEnd', function() {
			if (self.element.classList.contains($.className('preview-out'))) { //close
				self.element.style.display = 'none';
				self.element.classList.remove($.className('preview-out'));
				self.element.classList.remove($.className('preview-in'));
				laterClose = null;
			} else { //open  图片预览关闭添加laterCloseEvent事件
				self.loader.addEventListener('tap', laterHideEvent);
				self.scroller.addEventListener('tap', laterHideEvent);
                self.backer.addEventListener('tap', laterCloseEvent);
				self.deleter.addEventListener('tap',laterDeleteEvent);
				self.forwarder.addEventListener('tap',laterForwardEvent);
				self.infoer.addEventListener('tap',laterOpenEvent);
			}
		});
		this.element.addEventListener('slide', function(e) {
			if (self.options.zoom) {
				var lastZoomerEl = self.element.querySelector('.mui-zoom-wrapper:nth-child(' + (self.lastIndex + 1) + ')');
				if (lastZoomerEl) {
					$(lastZoomerEl).zoom().setZoom(1);
				}
			}
			var slideNumber = e.detail.slideNumber;
			// console.log(slideNumber);
			self.lastIndex = slideNumber;
			self.indicator && (self.indicator.innerText = (slideNumber + 1) + '/' + self.currentGroup.length);
			self._loadItem(slideNumber);

		});
	};
	proto.addImages = function(group, index) {
		this.groups = {};
		var imgs = [];
		if (group) {
			if (group === defaultGroupName) {
				imgs = document.querySelectorAll("img[data-preview-src]:not([data-preview-group])");
			} else {
				imgs = document.querySelectorAll("img[data-preview-src][data-preview-group='" + group + "']");
			}
		} else {
			imgs = document.querySelectorAll("img[data-preview-src]");
		}
		if (imgs.length) {
			// console.log(imgs.length);
			for (var i = 0, len = imgs.length; i < len; i++) {
				this.addImage(imgs[i]);
			}
		}
	};
	proto.addImage = function(img) {
		var group = img.getAttribute('data-preview-group');
		group = group || defaultGroupName;
		if (!this.groups[group]) {
			this.groups[group] = [];
		}
		var src = img.getAttribute('src');
		if (img.__mui_img_data && img.__mui_img_data.src === src) { //已缓存且图片未变化
			this.groups[group].push(img.__mui_img_data);
		} else {
			var lazyload = img.getAttribute('data-preview-src');
			if (!lazyload) {
				lazyload = src;
			}
			var imgObj = {
				src: src,
				lazyload: src === lazyload ? '' : lazyload,
				loaded: src === lazyload ? true : false,
				sWidth: 0,
				sHeight: 0,
				sTop: 0,
				sLeft: 0,
				sScale: 1,
				el: img
			};
			this.groups[group].push(imgObj);
			img.__mui_img_data = imgObj;
		}
	};


	proto.empty = function() {
		this.scroller.innerHTML = '';
	};
	proto._initImgData = function(itemData, imgEl) {
		if (!itemData.sWidth) {
			var img = itemData.el;
			itemData.sWidth = img.offsetWidth;
			itemData.sHeight = img.offsetHeight;
			var offset = $.offset(img);
			itemData.sTop = offset.top;
			itemData.sLeft = offset.left;
			//注释下面则滑动过程中禁止图片缩放
			itemData.sScale = Math.max(itemData.sWidth / window.innerWidth, itemData.sHeight / window.innerHeight);
		}
		imgEl.style.webkitTransform = 'translate3d(0,0,0) scale(' + itemData.sScale + ')';
	};

	proto._getScale = function(from, to) {
		var scaleX = from.width / to.width;
		var scaleY = from.height / to.height;
		var scale = 1;
		if (scaleX <= scaleY) {
			scale = from.height / (to.height * scaleX);
		} else {
			scale = from.width / (to.width * scaleY);
		}
		return scale;
	};
	proto._imgTransitionEnd = function(e) {
		var img = e.target;
		img.classList.remove($.className('transitioning'));
		img.removeEventListener('webkitTransitionEnd', this._imgTransitionEnd.bind(this));
	};
	proto._loadItem = function(index, isOpening) { //TODO 暂时仅支持img
// 	    console.log(index);
// 		console.log(isOpening);
		var itemEl = this.scroller.querySelector($.classSelector('.slider-item:nth-child(' + (index + 1) + ')'));
// 		var white = true;
// 		itemEl.addEventListener('tap',function(){
// 			if(white){
// 				this.classList.remove('mui-color');
// 				white = false;
// 			}else{
// 				this.classList.add('mui-color');
// 				white = true;
// 			}			
// 		});
		var itemData = this.currentGroup[index];
		var imgEl = itemEl.querySelector('img');
		//获取照片路径
		currentPreviewSrc = imgEl.src;
		// console.log(currentPreviewSrc);
		localStorage.setItem('path',currentPreviewSrc);
		this._initImgData(itemData, imgEl);
		if (isOpening) {
			var posi = this._getPosition(itemData);
			imgEl.style.webkitTransitionDuration = '0ms';
			imgEl.style.webkitTransform = 'translate3d(' + posi.x + 'px,' + posi.y + 'px,0) scale(' + itemData.sScale + ')';
			imgEl.offsetHeight;
		}
		if (!itemData.loaded && imgEl.getAttribute('data-preview-lazyload')) {
			var self = this;
			self.loader.classList.add($.className('active'));
			//移动位置动画
			imgEl.style.webkitTransitionDuration = '0.5s';
			imgEl.addEventListener('webkitTransitionEnd', self._imgTransitionEnd.bind(self));
			imgEl.style.webkitTransform = 'translate3d(0,0,0) scale(' + itemData.sScale + ')';
			this.loadImage(imgEl, function() {
				itemData.loaded = true;
				imgEl.src = itemData.lazyload;
				self._initZoom(itemEl, this.width, this.height);
				imgEl.classList.add($.className('transitioning'));
				imgEl.addEventListener('webkitTransitionEnd', self._imgTransitionEnd.bind(self));
				imgEl.setAttribute('style', '');
				imgEl.offsetHeight;
				self.loader.classList.remove($.className('active'));
			});
		} else {
			itemData.lazyload && (imgEl.src = itemData.lazyload);
			this._initZoom(itemEl, imgEl.width, imgEl.height);
			imgEl.classList.add($.className('transitioning'));
			imgEl.addEventListener('webkitTransitionEnd', this._imgTransitionEnd.bind(this));
			imgEl.setAttribute('style', '');
			imgEl.offsetHeight;
		}
		this._preloadItem(index + 1);
		this._preloadItem(index - 1);
	};
	proto._preloadItem = function(index) {
		var itemEl = this.scroller.querySelector($.classSelector('.slider-item:nth-child(' + (index + 1) + ')'));
		if (itemEl) {
			var itemData = this.currentGroup[index];
			if (!itemData.sWidth) {
				var imgEl = itemEl.querySelector('img');
				this._initImgData(itemData, imgEl);
			}
		}
	};
	proto._initZoom = function(zoomWrapperEl, zoomerWidth, zoomerHeight) {
		if (!this.options.zoom) {
			return;
		}
		if (zoomWrapperEl.getAttribute('data-zoomer')) {
			return;
		}
		var zoomEl = zoomWrapperEl.querySelector($.classSelector('.zoom'));
		if (zoomEl.tagName === 'IMG') {
			var self = this;
			var maxZoom = self._getScale({
				width: zoomWrapperEl.offsetWidth,
				height: zoomWrapperEl.offsetHeight
			}, {
				width: zoomerWidth,
				height: zoomerHeight
			});
			$(zoomWrapperEl).zoom({
				maxZoom: Math.max(maxZoom, 1)
			});
		} else {
			$(zoomWrapperEl).zoom();
		}
	};
	proto.loadImage = function(imgEl, callback) {
		var onReady = function() {
			callback && callback.call(this);
		};
		var img = new Image();
		img.onload = onReady;
		img.onerror = onReady;
		img.src = imgEl.getAttribute('data-preview-lazyload');
	};
	proto.getRangeByIndex = function(index, length) {
		return {
			from: 0,
			to: length - 1
		};
		//		var from = Math.max(index - 1, 0);
		//		var to = Math.min(index + 1, length);
		//		if (index === length - 1) {
		//			from = Math.max(length - 3, 0);
		//			to = length - 1;
		//		}
		//		if (index === 0) {
		//			from = 0;
		//			to = Math.min(2, length - 1);
		//		}
		//		return {
		//			from: from,
		//			to: to
		//		};
	};

	proto._getPosition = function(itemData) {
		var sLeft = itemData.sLeft - window.pageXOffset;
		var sTop = itemData.sTop - window.pageYOffset;
		var left = (window.innerWidth - itemData.sWidth) / 2;
		var top = (window.innerHeight - itemData.sHeight) / 2;
		return {
			left: sLeft,
			top: sTop,
			x: sLeft - left,
			y: sTop - top
		};
	};
	proto.refresh = function(index, groupArray) {
		this.currentGroup = groupArray;
		//重新生成slider
		var length = groupArray.length;
		var itemHtml = [];
		var currentRange = this.getRangeByIndex(index, length);
		var from = currentRange.from;
		var to = currentRange.to + 1;
		var currentIndex = index;
		var className = '';
		var itemStr = '';
		var wWidth = window.innerWidth;
		var wHeight = window.innerHeight;
		for (var i = 0; from < to; from++, i++) {
			var itemData = groupArray[from];
			var style = '';
			if (itemData.sWidth) {
				style = '-webkit-transform:translate3d(0,0,0) scale(' + itemData.sScale + ');transform:translate3d(0,0,0) scale(' +
					itemData.sScale + ')';
			}
			itemStr = itemTemplate.replace('{{src}}', itemData.src).replace('{{lazyload}}', itemData.lazyload).replace(
				'{{style}}', style);

			// 			if (itemData.el.getAttribute('data-content') && itemData.el.getAttribute('data-content') != '') {
			// 				if (itemData.el.getAttribute('data-desc') && itemData.el.getAttribute('data-desc') != '')
			// 					itemStr = itemStr.replace('{{content}}', '<div class="mui-slider-img-content">' + itemData.el.getAttribute(
			// 							"data-content") + "</br>" + "<div style='color:#A3A3A3;top:200px;width:100%;height:auto;word-break:break-all; '>" +
			// 						itemData.el.getAttribute('data-desc') + "</div>" + '</div>');
			// 				else
			// 					itemStr = itemStr.replace('{{content}}', "<div class=\"mui-slider-img-content\">" + itemData.el.getAttribute(
			// 						"data-content") + "</br>" + '</div>');
			// 			} else
			// 				itemStr = itemStr.replace('{{content}}', '');

			if (from === index) {
				currentIndex = i;
				className = $.className('active');
			} else {
				className = '';
			}
			itemHtml.push(itemStr.replace('{{className}}', className));
		}
		this.scroller.innerHTML = itemHtml.join('');
		this.scrollers = this.scroller.querySelector($.className('slide-item'));
		this.element.style.display = 'block';
		this.element.classList.add($.className('preview-in'));
		this.lastIndex = currentIndex;
		this.element.offsetHeight;
		$(this.element).slider().gotoItem(currentIndex, 0);
		this.indicator && (this.indicator.innerText = (currentIndex + 1) + '/' + this.currentGroup.length);
		this._loadItem(currentIndex, true);
	};
	proto.openByGroup = function(index, group) {
// 		console.log(index);
// 		console.log(group);
		index = Math.min(Math.max(0, index), this.groups[group].length - 1);
		this.refresh(index, this.groups[group]);
	};
	proto.open = function(index, group) {
// 		console.log(index);
// 		console.log(group);
		if (this.isShown()) {
			return;
		}
		this.func1(index);
		if (typeof index === "number") {
			group = group || defaultGroupName;
			this.addImages(group, index); //刷新当前group
			this.openByGroup(index, group);
		} else {
			group = index.getAttribute('data-preview-group');
// 			console.log(group);
// 			console.log(index);
			group = group || defaultGroupName;
			this.addImages(group, index); //刷新当前group
			this.openByGroup(this.groups[group].indexOf(index.__mui_img_data), group);
		}
	};
	proto.close = function(index, group) {
		if (!this.isShown()) {
			return;
		}
		this.func2(index);
		this.element.classList.remove($.className('preview-in'));
		this.element.classList.add($.className('preview-out'));
		var itemEl = this.scroller.querySelector($.classSelector('.slider-item:nth-child(' + (this.lastIndex + 1) + ')'));
		var imgEl = itemEl.querySelector('img');
		if (imgEl) {
			imgEl.classList.add($.className('transitioning'));
			var itemData = this.currentGroup[this.lastIndex];
			var posi = this._getPosition(itemData);
			var sLeft = posi.left;
			var sTop = posi.top;
			if (sTop > window.innerHeight || sLeft > window.innerWidth || sTop < 0 || sLeft < 0) { //out viewport
				imgEl.style.opacity = 0;
				imgEl.style.webkitTransitionDuration = '0.5s';
				imgEl.style.webkitTransform = 'scale(' + itemData.sScale + ')';
			} else {
				if (this.options.zoom) {
					$(imgEl.parentNode.parentNode).zoom().toggleZoom(0);
				}
				imgEl.style.webkitTransitionDuration = '0.5s';
				imgEl.style.webkitTransform = 'translate3d(' + posi.x + 'px,' + posi.y + 'px,0) scale(' + itemData.sScale + ')';
			}
		}
		var zoomers = this.element.querySelectorAll($.classSelector('.zoom-wrapper'));
		for (var i = 0, len = zoomers.length; i < len; i++) {
			$(zoomers[i]).zoom().destroy();
		}
		$(this.element).slider().destroy();
		//		this.empty();
	};
	proto.isShown = function() {
		return this.element.classList.contains($.className('preview-in'));
	};

	var previewImageApi = null;
	// $.previewImage = function(options) {
	$.previewImage = function(func1, func2) {
		if (!previewImageApi) {
			//previewImageApi = new PreviewImage(options);
			previewImageApi = new PreviewImage(func1, func2);
		}
		return previewImageApi;
	};
	$.getPreviewImage = function() {
		return previewImageApi;
	}

})(mui, window);
