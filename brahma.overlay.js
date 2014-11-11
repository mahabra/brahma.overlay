/*
Brahma overlay component
MIT, Vladimir Morulus (2013)
Required jUqery
*/
;(function(define,$) {
	var $ = $;
	define('brahma.overlay', function() {
	
		Brahma.component('overlay',
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
					duration: 350, // Default duration of effects,
					easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
				},
				"class": false,
				freezeDocument: true,
				verticalMargin: false, // at start make shift from cleint border
				autoshow: false, // autoshow after creating,
				zIndex: false,
				outsideClose: true, // Close by click at outside
				escapeClose: false, // Close by press ESC,
				autobinds: true // Bind content to a[overlay-trigger=close]
			},
			current: {
				backup: {}
			},
			wrappers : {
				content : null
			},
			z: {
				overlay: 0,
				panel: 0
			},
			execute : function() {	
				var component = this;
				// Initial effects
				this.effects.component = this;
				
				this.context = this.getContext();
				
				this.newOverlay(this.context);
				this.appendContent();
				if (this.config.autoshow) this.show();

				// Register hide on click at overlay
				if (this.config.outsideClose) {
					$(this.wrappers.contentWrapper).click(function(e) {
						
						e.stopPropagation();
					});
					$(this.wrappers.overlay).click(function() {
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
					$(this.wrappers.content).find('[overlay-trigger=close]').click(function() {
						$(this).removeAttr("overlay-trigger");
						component.close();
						return false;
					});	
					$(this.wrappers.content).find('[overlay-trigger=hide]').click(function() {
						$(this).removeAttr("overlay-trigger");
						component.hide();
						return false;
					});	
				}
			},
			getContext : function() {
				try {
					var tagName = $(this.elements)[0].tagName.strToLower();
				} catch(e) {
					var tagName = false;
				};
				switch(tagName) {
					case 'body':
						return $($(this.elements)[0]);
					break;
					default:
						if ($(this.elements)[0]==document) {
							return $('body');
						} else {
							return $('body');
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

				var body = $("body");
				/* remember scrollTop */
				this.current.backup = {
					scrollTop: $(this.context).scrollTop()
				};

				/* this variable contains elements that keeps in context node*/
				var not = [];
				// ...
				not = not.join(',');

				/* put all contents of context in freeze-node (wrappers.freezedContainer) */
				$(this.context).children().not(not).wrapAll($('<div />')).tie(function() {
					that.wrappers.freezedContainer = this.parent();
				});


				var contextTagName = $(this.context)[0].tagName.toUpperCase();

				/* Trick for scrollable container. If container has scrollBar then here comes the padding. After making container position absolute, padding disappearing and we see the bad jumping effect. To fix it we must save scrollBar to prevent hiding of padding. */
				if (contextTagName=='BODY') if ($(body).height() > $(window).height()) {
					$("body").css({
						'overflow-y': 'scroll'
					});
				};

				/* if context is not BODY make it position:relative. Becouse freezedContainer will be absolute. */
				if (contextTagName!='BODY') $(this.context).css('position', 'relative');

				/* set style to freezedContainer to make it real freezed */
				$(this.wrappers.freezedContainer).css({
					'position': $(this.context)[0].tagName.toUpperCase() == 'BODY' ? 'fixed' : 'absolute',
					'top': 0,
					'left': 0,
					'width': contextTagName=='BODY' ? '100%' : $(this.context).width(),
					'height': contextTagName=='BODY' ? '100%' : $(this.context).height(),
					'overflow': 'hidden',
				});
				
				/* wrap freezed to another DIV to make fixed scroll */
				$(this.wrappers.freezedContainer).children().not(not).wrapAll($('<div />'));
				$(this.wrappers.freezedContainer).find('>div').css({
					'width': '100%',
					'margin-top': (this.current.backup.scrollTop*-1)+'px'
				});

			},
			/* Unfreeze freezed wrapper content */
			unfreeze : function() {
				/* Get wrapper tag name */
				var contextTagName = $(this.context)[0].tagName.toUpperCase();

				var that = this;
				
				/* make overflow-y of BODY auto */
				if (contextTagName=='BODY') $(this.context).css({
					'overflow': 'auto'
				});

				/* move all content of context back to wrapper */
				$(this.wrappers.freezedContainer).find('>div').children().appendTo(jQuery(this.context));
				
				/* repair scroll top of context */
				if (contextTagName=='BODY') $(this.context).scrollTop(this.current.backup.scrollTop);

				/* remove Freezed Container */
				$(this.wrappers.freezedContainer).remove();
			},
			newOverlay : function(context) {
				var plugin = this;
				
				// > build Nodes
				this.wrappers.overlay = $(context).put($('<div />', {
					'class': 'mb-plugin-overlay'
				}))
				.css(Brahma.utility.extend({
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
					(plugin.config.overlay['class']) && ($(this).addClass(plugin.config.overlay['class']));
				})

				/* get z index for this */
				this.z.overlay = this.config.zIndex ? this.config.zIndex : Brahma.document.zindex.get(2);
				$(this.wrappers.overlay).css("z-index", this.z.overlay);

				// > build first TABLE
				this.wrappers.table = $(this.wrappers.overlay).put($('<table />', {
					'cellspacing': 0, 
					'cellpadding': 0
				}))
				.css({
					'height': '100%',
					'margin': '0 auto'
				})
				.ramp($('<tbody />'), $('<tr />'))
				.put($('<td />'))
				.css({
					'height': '1%'
				})
				.and($('<td />'))
				.css({
					'height': '100%',
					'width': this.config.width,
					'vertical-align': 'top'
				})
				.tie(function() {

					/* get z index for this */
					plugin.z.panel = plugin.config.zIndex ? plugin.config.zIndex+1 : Brahma.document.zindex.get(1);

					plugin.wrappers.contentWrapper = $(this).put($('<div />')).css(plugin.config.panel.style)
					.css({
						'display': 'inline-block',						
						'width': plugin.config.width
					})
					.tie(function() {
						(plugin.config.panel['class']) && ($(this).addClass(plugin.config.panel['class']));
					})
					.hide()
					.condition(plugin.config["class"], function(c) {
						$(this).addClass(c);
						return this; 
					}, function() { return this; })
					.css("z-index", plugin.z.panel); 

					// shift from clent Border
					if (plugin.config.verticalMargin) {
						
						$(this).css({
							'padding': parseInt(plugin.config.verticalMargin)+'px 0'
						})
					} else {
						
						$(this).css({
							'vertical-align': 'middle'  
						});
					}

					plugin.wrappers.content = $(plugin.wrappers.contentWrapper).put($('<div />'));
				})
				.and($('<td />'))
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
				if (typeof this.config.url == 'string') $(this.wrappers.content).load(this.config.url, function() {
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
							$(this.wrappers.content).empty().put($(arguments[0]));
						break;
						default:
							$(this.wrappers.content).html(arguments[0]);
						break;
					}
					this.bindContents();
					return this;
					
				} else {
					return this.wrappers.content;
				};

			},
			show : function() {

				var component = this;
				/*
				Freeze
				*/
				if (this.config.freezeDocument) this.freeze();

				/*
				Show overlay
				*/
				$(this.wrappers.overlay).fadeIn();
				switch(this.config.effect.type) {
					case 'slide':

						this.effects.slideIn({
							'duration': this.config.effect.duration, 
							'direction': this.config.effect.direction
						}, function() {
							component.trigger('show');
						});
					break;
					case 'hang':
						this.effects.hangIn({
							'duration': this.config.effect.duration, 
							'direction': this.config.effect.direction
						}, function() {
							component.trigger('show');
						});
					break;
					default:
						$(this.wrappers.contentWrapper).show();
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
						

						this.effects.slideOut({
							'duration': this.config.effect.duration, 
							'direction': this.config.effect.direction
						}, function() {
							// hide content totaly
							$(component.wrappers.contentWrapper).hide();	

							// > hide overlay
							$(component.wrappers.overlay).fadeOut(function() {
								component.trigger('hide');
								if (typeof callback == "function") callback.apply(component);
							});	
						});
					break;
					case 'hang':
						this.effects.hangOut({
							'duration': this.config.effect.duration, 
							'direction': this.config.effect.direction
						}, function() {
							// hide content totaly
							$(component.wrappers.contentWrapper).hide();	

							// > hide overlay
							$(component.wrappers.overlay).fadeOut(function() {
								component.trigger('hide');
								if (typeof callback == "function") callback.apply(component);
							});	
						});
					break;
					default:
						
						$(component.wrappers.overlay).fadeOut(this.config.duration, function() {
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
				$(this.wrappers.content).remove();
				$(this.wrappers.overlay).remove();
				if (!this.config.zIndex) {
					Brahma.document.zindex.free(this.z.overlay);
					Brahma.document.zindex.free(this.z.panel);
				};
				this.destroy();
			},
			destroy : function() {
				$.each(this, function() {
					
					delete this;
				});
			}
		});

		Brahma.component('overlay').effects = Brahma.module({
			component: null, 
			_slide: function(options, callback) {
				/* calc distance from eleemnt to the edge */
				var screenHeight = $(this.component.context).height();
				if (screenHeight==0) screenHeight = $(window).height();

				var screenWidth = $(this.component.context).width();
				if (screenWidth==0) screenWidth = $(window).width();

				var position = {
					top: (screenHeight-$(this.component.wrappers.contentWrapper).height())/2,
					left: (screenWidth-$(this.component.wrappers.contentWrapper).width())/2
				};
				
				var cover = {
					top: position.top+$(this.component.wrappers.contentWrapper).height(),
					right: (screenWidth-position.left),
					bottom: position.top+$(this.component.wrappers.contentWrapper).height(),
					left: position.left+$(this.component.wrappers.contentWrapper).width()
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
				var shift = (($(this.component.context).width()-$(this.component.wrappers.contentWrapper).outerWidth())/2)+$(this.component.wrappers.contentWrapper).outerWidth();
				
				var options = Brahma.utility.extend({
					direction: options.direction || 0,
					duration: options.duration || 450
				}, options || {});

				
				
				this._translate(this.component.wrappers.contentWrapper, startX, startY, 0);
				$(this.component.wrappers.contentWrapper).show();
				var that = this;
				setTimeout(function() {
					that._translate(that.component.wrappers.contentWrapper, endX, endY, that.component.config.effect.duration);
					if ((typeof callback == 'function' ? callback : false)) {
						var component = that.component;
						setTimeout(function() {
							callback.call(component);
						}, that.component.config.effect.duration);
					}
				},5);
				
			},
			slideIn: function(options, callback) {
				options.reverse = false;

				this._slide(options, callback);
			},
			slideOut: function(options, callback) {
				var callback = callback;
				var component = this.component;
				options.reverse = true;
				this._slide(options, function() {
					$(component.wrappers.contentWrapper).hide();	
					callback();
				});
			},
			hangIn: function(options, callback) {
				var callback = callback;
				var component = this.component;
				this._transform(this.component.wrappers.contentWrapper, 'translate(0, -15px) scale(0.95)', 0);
				$(this.component.wrappers.contentWrapper).css('opacity', 0).show();
				var that = this;
				setTimeout(function() {
					$(that.component.wrappers.contentWrapper).animate({
						opacity: 1
					}, options.duration || that.component.config.effect.duration*0.75);
					that._transform(that.component.wrappers.contentWrapper, 'translate(0, 0) scale(1)', options.duration || that.component.config.effect.duration);
					("function"==typeof callback) && setTimeout(function() {
						callback.call(component);
					}, options.duration || that.component.config.effect.duration);
				}, 5);
			},
			hangOut: function(options, callback) {
				var callback = callback;
				var component = this.component;
				
				this._transform(this.component.wrappers.contentWrapper, 'translate(0, -15px) scale(0.95)', options.duration || that.component.config.effect.duration);
				$(this.component.wrappers.contentWrapper).animate({
						opacity: 0
					}, options.duration || this.component.config.effect.duration*0.5);
				("function"==typeof callback) && setTimeout(function() {
					callback.call(component);
				}, options.duration || that.component.config.effect.duration);
			},
			_translate: function(el, x, y, duration) {
				var dur = {};
				var opt = {};
				var cap = ["-webkit-","-o-","-ms-","-moz-"];

				for (var i=0;i<cap.length;i++) {
					dur[cap[i]+'transition'] = cap[i]+'transform '+duration+'ms '+this.component.config.effect.easing;
					opt[cap[i]+'transform'] = 'translate('+Brahma.utility.getWebUnits(x)+','+Brahma.utility.getWebUnits(y)+')';
				}
				
				$(el).css(dur).css(opt);
			},
			_transform: function(el, props, duration) {
				var dur = {};
				var opt = {};
				var cap = ["-webkit-","-o-","-ms-","-moz-"];

				for (var i=0;i<cap.length;i++) {
					dur[cap[i]+'transition'] = cap[i]+'transform '+duration+'ms '+this.component.config.effect.easing;
					opt[cap[i]+'transform'] = props;
				}
				
				$(el).css(dur).css(opt);
			}
		});

	});

})(define || function(g, e, b, o) {
	var b = b,
		g = g;
	if (arguments.length==1) { b=g; g=null,e=0,o=null }
	else if (arguments.length==2) {
		("object"==typeof g) && (b=e,e=0,g=null,o=null);
		("string"==typeof g) && (b=e,e=0,o=null);
	}
	else {
		"string" != typeof g && (o = b, b = e, e = g, g = null);
		!(e instanceof Array) && (o = b, b = e, e = 0);
	}
	b();
},jQuery);