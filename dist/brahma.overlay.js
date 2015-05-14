/*
Brahma overlay component
MIT, Vladimir Morulus (2013)
Required jUqery
*/

Brahma.app('overlay',
{
	width: 'auto',
	context : null,
	config: {
		content: '',
		panel: {
			style: {

			},
			"class": false
		},
		overlay: {
			style: {
				
			},
			"class": false
		},
		effect: {
			'type': 'fade',
			'direction': 0,
			duration: 750, // Default duration of effects,
			easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
		},
		"class": false,
		freezeDocument: true,
		verticalMargin: false, // at start make shift from cleint border
		autoshow: false, // autoshow after creating,
		zIndex: false,
		outsideClose: true, // Close by click at outside
		escapeClose: false, // Close by press ESC,
		autobinds: true, // Bind content to a[overlay-trigger=close]
		modernFreezee: true
	},
	current: {
		backup: {},
		freezed: false
	},
	wrappers : {
		content : null
	},
	z: {
		overlay: 0,
		panel: 0
	},
	run : function() {	
		var component = this;
		
		this.context = this.getContext();
		
		this.newOverlay(this.context);
		this.appendContent();
		if (this.config.autoshow) this.show();

		// Register hide on click at overlay
		if (this.config.outsideClose) {
			Brahma(this.wrappers.contentWrapper).bind('click',function(e) {
				
				e.stopPropagation();
			});
			Brahma(this.wrappers.overlay).bind('click',function() {
				component.hide();
			});
		}
		// Register hide on pressing ESC
		this.bind('document.keydown', function(e) {
			if (e.which==27) this.hide();
		});
		Brahma.document.translateEvents(this, 'document.keydown');
		// Autobinds
		this.bindContents();

		return this;
	},
	bindContents: function() {
		var component = this;
		if (this.config.autobinds) {
			Brahma(this.wrappers.content).find('[overlay-trigger=close]').bind('click',function() {
				Brahma(this).removeAttr("overlay-trigger");
				component.close();
				return false;
			});	
			Brahma(this.wrappers.content).find('[overlay-trigger=hide]').bind('click',function() {
				Brahma(this).removeAttr("overlay-trigger");
				component.hide();
				return false;
			});	
		}
	},
	getContext : function() {
		try {
			var tagName = Brahma(this.selector)[0].tagName.strToLower();
		} catch(e) {
			var tagName = false;
		};
		switch(tagName) {
			case 'body':
				return Brahma(Brahma(this.selector)[0]);
			break;
			default:
				if (Brahma(this.selector)[0]==document) {
					return Brahma('body');
				} else {
					return Brahma('body');
				};
			break;
		}
	},
	/*
	Freeze wrapper - make it unscrollable and untouchable.
	*/
	freeze: function(callback) {
		var that = this;
		var callback = callback;


		if (typeof callback == "function") setTimeout(callback, 100);
		if (this.current.freezed) return this;

		var body = Brahma("body");
		/* remember scrollTop */
		this.current.backup = {
			scrollTop: Brahma(this.context)[0].scrollTop,
			overflow: body.css("overflow"),
			margin: Brahma('body').css("margin"),
			marginDifference: 0
		};

		this.current.freezed = true;

		if (this.config.modernFreezee) {
			/* Оцениваем ширину контейнер перед изменением параметров отображения скроллбара */
			var rwidth = Brahma('body')[0].clientWidth;
			body.css({
				'overflow': 'hidden'
			});
			var that = this;
			Brahma.frame(function() {
				var nwidth = Brahma('body')[0].clientWidth;

				that.current.backup.marginDifference = (parseInt(Brahma('body').css("margin-right")||0)+nwidth-rwidth);
				Brahma('body').css("margin-right", that.current.backup.marginDifference+'px');
			});
		} else {
			/* this variable contains elements that keeps in context node*/
			var not = [];
			// ...
			not = not.join(',');

			/* Test scroll height */
			if (Brahma(this.context).is('body')) {
				var fakeScrollBar = (Brahma(this.context)[0].scrollHeight>Brahma(window)[0].innerHeight);
			} else {
				var fakeScrollBar = false;
			};		

			/* put all contents of context in freeze-node (wrappers.freezedContainer) */
			Brahma(this.context).find('>*').not(not).wrapAll('div').tie(function() {
				that.wrappers.freezedContainer = this;
			})
			/* Trick for scrollable container. If container has scrollBar then here comes the padding. After making container position absolute, padding disappearing and we see the bad jumping effect. To fix it we must save scrollBar to prevent hiding of padding. */
			.condition(fakeScrollBar, function() {
				Brahma("body").css({
					"overflow-y": "scroll"
				});
			});

			var contextTagName = Brahma(this.context)[0].tagName.toUpperCase();

			/* if context is not BODY make it position:relative. Becouse freezedContainer will be absolute. */
			if (contextTagName!='BODY') Brahma(this.context).css('position', 'relative');

			/* set style to freezedContainer to make it real freezed */
			Brahma(this.wrappers.freezedContainer).css({
				'position': Brahma(this.context)[0].tagName.toUpperCase() == 'BODY' ? 'fixed' : 'absolute',
				'top': 0,
				'left': 0,
				'width': contextTagName=='BODY' ? '100%' : Brahma(this.context).width(),
				'height': contextTagName=='BODY' ? '100%' : Brahma(this.context).height(),
				'overflow': 'hidden',
			});
			
			/* wrap freezed to another DIV to make fixed scroll */
			Brahma(this.wrappers.freezedContainer).find('>*').not(not).wrapAll('div');
			Brahma(this.wrappers.freezedContainer).find('>div').css({
				'width': '100%',
				'margin-top': (this.current.backup.scrollTop*-1)+'px'
			});
		}
	},
	/* Unfreeze freezed wrapper content */
	unfreeze : function() {

		this.current.freezed = false;
		/* Get wrapper tag name */
		var contextTagName = Brahma(this.context)[0].tagName.toUpperCase();

		var that = this;
		
		if (this.config.modernFreezee) {
			if (contextTagName=='BODY') Brahma(this.context).css({
				'overflow': this.current.backup.overflow,
				'margin': ''
			});
			// Модифицируем таблицу для выравнивания позиции слоя после восстановления сколлбара контекста
			var shift = that.current.backup.marginDifference/2;

			$(that.wrappers.table).css({
				'-webkit-transform': 'translateX('+shift+'px)',
				'-ms-transform': 'translateX('+shift+'px)',
				'transform': 'translateX('+shift+'px)'
			});
			setTimeout(function() {
				$(that.wrappers.table).css({
					'-webkit-transform': 'translateX(0px)',
					'-ms-transform': 'translateX(0px)',
					'transform': 'translateX(0px)'
				});
			}, this.config.effect.duration);
			console.log('this.config.duration', this.config.effect.duration);
		} else {
			/* make overflow-y of BODY auto */
			if (contextTagName=='BODY') Brahma(this.context).css({
				'overflow': 'auto'
			});

			/* move all content of context back to wrapper */
			Brahma(this.context).put(Brahma(this.wrappers.freezedContainer).find('>div').find('>*'));
			
			/* repair scroll top of context */
			if (contextTagName=='BODY') Brahma(this.context)[0].scrollTop = this.current.backup.scrollTop;

			/* remove Freezed Container */
			Brahma(this.wrappers.freezedContainer).remove();
		};		
	},
	newOverlay : function(context) {
		var plugin = this;
		
		// > build Nodes
		this.wrappers.overlay = Brahma(context).put('div', {
			'class': 'mb-plugin-overlay'
		})
		.css(Brahma.extend({
			'width': '100%',
			'height': '100%',
			'position': 'fixed',
			'top': '0px',
			'left': '0px',
			'backgroundColor': 'none',
			'backgroundImage': 'none',
			'display': 'none',
			'overflow-y': 'auto',
			'overflow-x': 'hidden'
		}, this.config.overlay.style))
		.tie(function() {
			(plugin.config.overlay['class']) && (Brahma(this).addClass(plugin.config.overlay['class']));
		})

		/* get z index for this */
		this.z.overlay = this.config.zIndex ? this.config.zIndex : Brahma.document.zindex.get(2);
		Brahma(this.wrappers.overlay).css("z-index", this.z.overlay);

		// > build first TABLE
		Brahma(this.wrappers.overlay).put('table', {
			'cellspacing': 0, 
			'cellpadding': 0
		})
		.tie(function() {
			plugin.wrappers.table = this;
		})
		.css({
			'height': '100%',
			'margin': '0 auto'
		})
		.put('tbody')
		.put('tr')
		.put('td')
		.css({
			'height': '1%'
		})
		.and('td')
		.css({
			'height': '100%',
			'vertical-align': 'top',
			'text-align': 'center'
		})
		.tie(function() {

			/* get z index for this */
			plugin.z.panel = plugin.config.zIndex ? plugin.config.zIndex+1 : Brahma.document.zindex.get(1);

			plugin.wrappers.contentWrapper = Brahma(this).put('div').css(Brahma.extend({
				'display': 'inline-block',			
				'text-align': 'left',		
				'width': plugin.config.width+'px'
			}, plugin.config.panel.style))
			.tie(function() {
				(plugin.config.panel['class']) && (Brahma(this).addClass(plugin.config.panel['class']));
			})
			.hide()
			.condition(plugin.config["class"], function(c) {
				Brahma(this).addClass(c);
				return this; 
			}, function() { return this; })
			.css("z-index", plugin.z.panel); 

			// shift from clent Border
			if (plugin.config.verticalMargin) {
				
				Brahma(this).css({
					'padding': parseInt(plugin.config.verticalMargin)+'px 0'
				})
			} else {
				
				Brahma(this).css({
					'vertical-align': 'middle'  
				});
			}

			plugin.wrappers.content = Brahma(plugin.wrappers.contentWrapper).put('div');
		})
		.and('td')
		.css({
			'height': '1%'
		});
	},
	appendContent : function() {

		var plugin = this;
		// > append static content
		switch(typeof this.config.content) {
			case 'string':

				this.wrappers.content.html(this.config.content);
				plugin.trigger('ready', [this.wrappers.content]);
			break;
			case 'function':
				this.config.content.call(this, this.wrappers.content);
			break;
		}
		
		// > append url request data
		if (typeof this.config.url == 'string') Brahma(this.wrappers.content).load(this.config.url, function() {
			plugin.trigger('ready', [plugin.wrappers.content]);
		});
		return this;
	},
	html : function() {
		
		if (arguments.length>0) {
			switch(typeof arguments[0]) {
				case 'function':

					arguments[0].call(this, this.wrappers.content);
					
					
				break;
				case 'object':
					Brahma(this.wrappers.content).empty().put(arguments[0]);
				break;
				default:
					Brahma(this.wrappers.content).html(arguments[0]);
				break;
			}
			this.bindContents();
			return this;
			
		} else {
			return this.wrappers.content;
		};

	},
	show : function() {
		window.test = this;
		setTimeout(function() {
			console.log(window.test.eventListners);
		},2000);
		
		var component = this;
		/*
		Freeze
		*/
		if (this.config.freezeDocument) this.freeze();

		/*
		Show overlay
		*/
		this.module('effect').fadeIn(Brahma(this.wrappers.overlay)[0], 1000);
		switch(this.config.effect.type) {
			case 'slide':

				this.module('effect').slideIn({
					'duration': this.config.effect.duration, 
					'direction': this.config.effect.direction
				}, function() {
					component.trigger('show');
				});
			break;
			case 'hang':
				this.module('effect').hangIn({
					'duration': this.config.effect.duration, 
					'direction': this.config.effect.direction
				}, function() {
					component.trigger('show');
				});
			break;
			default:
				Brahma(this.wrappers.contentWrapper).show();
				component.trigger('show');

			break;
		};
		
		
		return this;
		
	},
	hide: function(callback) {

		this.trigger('beforeHide'); // < trigger
		// Unfreeze
		if (this.config.freezeDocument) this.unfreeze();

		var callback = callback;
		var component = this;
		switch(this.config.effect.type) {
			case 'slide':
				

				this.module('effect').slideOut({
					'duration': this.config.effect.duration, 
					'direction': this.config.effect.direction
				}, function() {
					// hide content totaly
					Brahma(component.wrappers.contentWrapper).hide();	

					// > hide overlay
					this.module('effect').fadeOut(Brahma(component.wrappers.overlay)[0], this.config.duration, function() {
						component.trigger('hide');
						if (typeof callback == "function") callback.apply(component);
					});	
				});
			break;
			case 'hang':
				this.module('effect').hangOut({
					'duration': this.config.effect.duration, 
					'direction': this.config.effect.direction
				}, function() {
					// hide content totaly
					Brahma(component.wrappers.contentWrapper).hide();	

					// > hide overlay
					this.module('effect').fadeOut(Brahma(component.wrappers.overlay)[0],this.config.duration,function() {
						component.trigger('hide');
						if (typeof callback == "function") callback.apply(component);
					});	
				});
			break;
			default:
				
				this.module('effect').fadeOut(Brahma(component.wrappers.overlay)[0],this.config.duration,function() {
					component.trigger('hide');
					if (typeof callback == "function") callback.apply(component);
				});
			break;
		}
	},
	close: function() {
		
		this.hide(function() {
			this.remove();
		});
		
		return this;
	},
	remove : function() {
		this.trigger('beforeDestroy'); // < trigger
		// free z index
		Brahma(this.wrappers.content).remove();
		Brahma(this.wrappers.overlay).remove();
		if (!this.config.zIndex) {
			Brahma.document.zindex.free(this.z.overlay);
			Brahma.document.zindex.free(this.z.panel);
		};
		this.destroy();
	},
	destroy : function() {
		Brahma.each(this, function() {
			
			delete this;
		});
	}
});

Brahma.app('overlay').module('effect', {
	_slide: function(options, callback) {
		/* calc distance from eleemnt to the edge */
		var screenHeight = Brahma(this.master.context).height();
		if (screenHeight==0) screenHeight = Brahma(window).height();

		var screenWidth = Brahma(this.master.context).width();
		if (screenWidth==0) screenWidth = Brahma(window).width();

		var position = {
			top: (screenHeight-Brahma(this.master.wrappers.contentWrapper).height())/2,
			left: (screenWidth-Brahma(this.master.wrappers.contentWrapper).width())/2
		};
		
		var cover = {
			top: position.top+Brahma(this.master.wrappers.contentWrapper).height(),
			right: (screenWidth-position.left),
			bottom: position.top+Brahma(this.master.wrappers.contentWrapper).height(),
			left: position.left+Brahma(this.master.wrappers.contentWrapper).width()
		};

		switch(options.direction) {
			case 'top': options.direction = 0; break;
			case 'right': options.direction = 90; break;
			case 'bottom': options.direction = 180; break;
			case 'left': options.direction = 270; break;
		};

		if (options.direction>=0 && options.direction<90) {
			var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.top) ? cover.right : cover.top, options.direction, 90); 
		};

		if (options.direction>=90 && options.direction<180) {
			var calc = Brahma.trigonometria.delta2c1s((cover.right>cover.bottom) ? cover.right : cover.bottom, options.direction, 90); 
		};

		if (options.direction>=180 && options.direction<270) {
			var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.bottom) ? cover.left : cover.bottom, options.direction, 90); 
		};

		if (options.direction>=270 && options.direction<=359) {
			var calc = Brahma.trigonometria.delta2c1s((cover.left>cover.top) ? cover.left : cover.top, options.direction, 90); 
		};
		
		/* > fix bug for firefox with e-num */
		calc.b = Math.round(calc.b);

		if (options.reverse) { // < reverse motion

			var startX = 0;
			var startY = 0;

			var endX = calc.c;
			var endY = -1*calc.b;	
		} else {

			var startX = calc.c;
			var startY = -1*calc.b;

			var endX = 0;
			var endY = 0;
		};
		

		/* shith to hide */
		var shift = ((Brahma(this.master.context).width()-Brahma(this.master.wrappers.contentWrapper).outerWidth())/2)+Brahma(this.master.wrappers.contentWrapper).outerWidth();
		
		var options = Brahma.extend({
			direction: options.direction || 0,
			duration: options.duration || 450
		}, options || {});

		
		
		this._translate(this.master.wrappers.contentWrapper, startX, startY, 0);
		Brahma(this.master.wrappers.contentWrapper).show();
		var that = this;
		setTimeout(function() {
			that._translate(that.master.wrappers.contentWrapper, endX, endY, that.master.config.effect.duration);
			if ((typeof callback == 'function' ? callback : false)) {
				var component = that.master;
				setTimeout(function() {
					callback.call(component);
				}, that.master.config.effect.duration);
			}
		},5);
		
	},
	slideIn: function(options, callback) {
		options.reverse = false;

		this._slide(options, callback);
	},
	slideOut: function(options, callback) {
		var callback = callback;
		var component = this.master;
		options.reverse = true;
		this._slide(options, function() {
			Brahma(component.wrappers.contentWrapper).hide();	
			callback();
		});
	},
	hangIn: function(options, callback) {
		var callback = callback;
		var component = this.master;
		this._transform(this.master.wrappers.contentWrapper, 'translate(0, -30px) scale(0.95)', 0);
		Brahma(this.master.wrappers.contentWrapper).css('opacity', 0).show();
		var that = this;
		setTimeout(function() {
			that.fadeIn(
				Brahma(that.master.wrappers.contentWrapper)
				, options.duration || that.master.config.effect.duration

			);
			
			that._transform(that.master.wrappers.contentWrapper, 'translate(0, 0) scale(1)', options.duration || that.master.config.effect.duration);
			("function"==typeof callback) && setTimeout(function() {
				callback.call(component);
			}, options.duration || that.master.config.effect.duration);
		}, 5);
	},
	hangOut: function(options, callback) {
		var callback = callback;
		var component = this.master;
		var that = this;
		
		this._transform(this.master.wrappers.contentWrapper, 'translate(0, -15px) scale(0.95)', options.duration || that.master.config.effect.duration);
		this.fadeOut(
			Brahma(this.master.wrappers.contentWrapper)
			, options.duration || this.master.config.effect.duration

		);
		
		console.log(options.duration || that.master.config.effect.duration);
		("function"==typeof callback) && setTimeout(function() {
			callback.call(component);
		}, options.duration || that.master.config.effect.duration);
	},
	_translate: function(el, x, y, duration) {
		var dur = {};
		var opt = {};
		var cap = ["-webkit-","-o-","-ms-","-moz-"];

		for (var i=0;i<cap.length;i++) {
			dur[cap[i]+'transition'] = cap[i]+'transform '+duration+'ms '+this.master.config.effect.easing;
			opt[cap[i]+'transform'] = 'translate('+Brahma.utility.getWebUnits(x)+','+Brahma.utility.getWebUnits(y)+')';
		}
		
		Brahma(el).css(dur).css(opt);
	},
	_transform: function(el, props, duration) {

		var dur = {};
		var opt = {};
		var cap = ["-webkit-","-o-","-ms-","-moz-"];

		for (var i=0;i<cap.length;i++) {
			dur[cap[i]+'transition'] = cap[i]+'transform '+duration+'ms '+this.master.config.effect.easing;
			opt[cap[i]+'transform'] = props;
			opt[cap[i]+'transform-origin'] = "50% 50%";
		}
		
		Brahma(el).css(dur).css(opt);
	},
	fadeIn: function(el, duration, callback) {
		var el = Brahma(el)[0];
		Brahma(el).css("opacity", 0);

		(Brahma(el).css("display")==="none") && (Brahma(el).show(), console.log('SHOW'));
		
		var o=0,interval=setInterval(function() {
			o+=0.01;
			el.style.opacity = o;
			if (o>=1) { el.style.opacity = 1; clearInterval(interval); if (typeof callback == "function") callback(); };
		}, duration/1000);
		return el;
	},
	fadeOut: function(el, duration, callback) {
		var el = Brahma(el)[0];
		Brahma(el).css("opacity", 1);
		(Brahma(el).css("display")==="none") && (Brahma(el).show());
		var o=1,interval=setInterval(function() {
			o-=0.01;
			el.style.opacity = o;
			if (o<=0) { el.style.opacity = 0; clearInterval(interval); Brahma(el).hide(); if (typeof callback == "function") callback();  };
		}, duration/1000);
		return el;
	}
});

