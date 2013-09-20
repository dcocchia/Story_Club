//==========================================\\ 
//===========================================\\
// Dumbo Neighborhood Assocation			  \\
//											   \\
// Site developed by Dominic Cocchiarellea	   //	
// Dominic.Cocchiarella@gmail.com			  //
//===========================================//
//==========================================//
$(window).load(function(){ //wait for DOM to load
	(function($) { //self calling anon function to keep global namespace clean
		var that = this,
			//caching common, static references
			$header = $("#header"),
			$socialNav = $(".buttonsNav"),
			$nav = $("#mainNav"),
			$buttons = $nav.find(".navButton"),
			$navSlider = $("#navSlider"),
			$pageSlide = $("#pageSlide"),
			$flickPicHolder = $("#flickPicHolder"),
			$flickrMoreBtn = $(".flickMoreBtn"),
			$slides = $(".slideItemWrapper"),
			flickrPage = 1, //gets upped with each page addition
			windowWidth = $(window).width(), //this gets recalculated on resizes
			currentPageIndex = 0,
			headerHeight = $header.height(),
			bannerImageDimensions = {
				width: 2048,
				height: 450
			}

	  //================//
	 //	Initialization //
	//================//

			initializePage = function() {

				var typewatch = function(){ //use this function to delay a function that gets called many times but doesn't need to (like onWindowResize events)
				    var timer = 0;
				    return function(callback, ms){
				        clearTimeout (timer);
				        timer = setTimeout(callback, ms);
				    }  
				}();

				setNavButtonWidth();

				$("body").show();

				loadTumblrPosts();

				slideBanner({
					amount: 200,
					amountOut: 25,
					speedIn: 1000,
					speedOut: 300,
					direction: 'right'
				});

				slideNavs();

				bindNavButtonEvents();

				setSlideItemWidths();				

				typewatch(function(){
						setSlideItemHeights();
					}, 500 );

				checkForNavChange($nav.closest("section"));

				getPics(); //start flickr API

				 if (window.addEventListener) {
					 window.addEventListener("orientationchange", function() { //if using a ios device, reset widths on orientation change 
						setSlideItemWidths();
						headerHeight = $header.height();
						windowWidth = $(window).width();
						checkForNavChange($nav.closest("section"));
					}, false);
				}

				$(window).resize(function() {
					setSlideItemWidths();
					headerHeight = $header.height();
					windowWidth = $(window).width();
					checkForNavChange($nav.closest("section"));
				});

				$(window).scroll(function() {
				    typewatch(function(){
						checkForNavChange($nav.closest("section"));
					}, 10 ); // wait 1/100 of a second to fire again (this actually saves a lot)
				});

				$flickrMoreBtn.click(function() {
					getPics();
				});

				if ($.browser.msie && ($.browser.version === "8.0" || $.browser.version === "7.0" || $.browser.version === "6.0")) {
					$("<div id='oldIEWarn' style='width:50%; height:25%; position:fixed; top:25%; left:25%; text-align:center; z-index:9999;background:red; color:white; font-size:20px;line-height:50px;'>You are using a severely outdated and unsupported version of your web browser. Please update your web browser <a href='http://windows.microsoft.com/en-us/internet-explorer/download-ie'>here</a>.<div><a href='' class='closeOldIe' style='border:1px solid white; padding:3px;'>close</a></div></div>").appendTo("body");

					$(".closeOldIe").click(function(e) {
						e.preventDefault();

						$("#oldIEWarn").remove();
					});
				}
			},

	  //=======================//
	 //	End of Initialization //
	//=======================//


	  //============//
	 //	Navigation //
	//============//

			checkForNavChange = function($nav){
				var positionLimit = headerHeight,
				 	y = $(document).scrollTop(),
				 	socailNavWidth = function() {
				 		if (windowWidth > 479){
				 			return 72;
				 		}else{
				 			return 50.4;
				 		}
				 	}();

				if ( y >= positionLimit ) {
				    $nav.addClass("docked");
				    $socialNav.addClass("docked").css({
				    	"left": (windowWidth - socailNavWidth).toString() + "px"
				    });
				} else {
				    $nav.removeClass("docked");
				    if (windowWidth > 479) {
				    	$socialNav.removeClass("docked").css({
				    		"left": "0" 
				    	});
				    } else {
				    	$socialNav.removeClass("docked").css({
				    		"left": "-7px" 
				    	});
				    }
				    
				}
			},

			setNavButtonWidth = function() {
				//this sets the width of the buttons dependent on the number of buttons placed in the DOM. This allows me to add buttons later without having to refactor code
				var buttonWidth = (100 / $buttons.length).toString() + "%";
				
				$buttons.parent().css("width", buttonWidth);
				$navSlider.css("width", buttonWidth);
			},

			setSlideItemWidths = function() {
				var $slideitems = $pageSlide.children("li");
				$slideitems.each(function(index) {
					$(this).css({
						"width": windowWidth,
						"left" : (index * 100).toString() + "%"
					});
				});
					
			},

			slidePage = function(pageIndex) {
				$pageSlide.css("left", -(pageIndex * 100).toString() + "%");
			},

			slideBanner = function(options, callbackFunction) {
				var defaults = {
					amount: 0, 		   // distance in pixels we want it to shift
					amountOut: 0, 	   // distance in pixels we want it to stretch
					speedIn: 2000, 	   // speed of movement in milliseconds
					speedOut: 500, 	   // speed of stretch back in milliseconds 
					direction: 'left' // direction of movement
				},
					settings = $.extend({}, defaults, options), //combine defaults options with thosed passed
					dirOperator,
					dirOperatorOut,
					posIn,
					posOut;

				if (settings.direction === 'left'){
					dirOperator = '-=';
					dirOperatorOut= '+=';
				}else{
					dirOperator = '+=';
					dirOperatorOut= '-=';
				}

				posIn = dirOperator + (settings.amount + settings.amountOut).toString() + ' -150';
				posOut = dirOperatorOut + settings.amountOut.toString() + ' -150';

	            $header.animate({
	            	backgroundPosition: posIn }, settings.speedIn,'swing', 	// Slide
	            	function() {
		            	$(this).animate({									// Slide back (rubber effect)
		            		backgroundPosition: posOut
		            	}, settings.speedOut, 'linear', 
		            	function() {
		            		if (callbackFunction){
		            			callbackFunction();							//if function was passed a callback function, call it now
		            		}
		            	});
	            	});
	            
			},

			slideNavs = function() {
				var transitionTime = 1,
					transitionTimeStr;

					//calculate button animations
					$buttons.each(function(index) {
						transitionTime = 1 + ((index + 1) / 10);
						transitionTimeStr = transitionTime.toString();
						$(this).css({
							'transition': 'all ' +  transitionTimeStr + 's',
							'-moz-transition': 'all ' +  transitionTimeStr + 's',
							'-ms-transition': 'all ' +  transitionTimeStr + 's',
							'-webkit-transition': 'all ' +  transitionTimeStr + 's',
							'-o-transition': 'all ' +  transitionTimeStr + 's'
						});
					});


				$nav.removeClass("up");

				//wait and slide the buttons down
				setTimeout( function () {
					$buttons.removeClass("up");
				},250)

				setTimeout( function () {
					$nav.css("z-index", 1);
					$navSlider.addClass("navSlider");
				},1000)

			},

			moveNavSlider = function(event) {
				var $originTarget = $(event.target),
					$target = function(event) {
						var $theTarget = $originTarget;

						if ($theTarget.is("div")){
							$theTarget = $originTarget.parent();
						}

						return $theTarget;

					}(), //which button was clicked (self calling function calculates value on function call)
					index = $buttons.index($target.find(".navButton")), //what number within the list of buttons was it
					moveAmt = index * $target.width(),
					offSet = $target.offset().left,
					bannerDir,
					bannerBckGrndPos,
					bannerLeftAmt,
					minLeftAmt = windowWidth - bannerImageDimensions.width,
					slideAmt = 100;

				$navSlider.css("left", offSet);
				slidePage(index);

				bannerBckGrndPos = $("#header").css("background-position");
				bannerLeftAmt = parseInt(bannerBckGrndPos.substring(0, bannerBckGrndPos.indexOf("p")));

				if (index > currentPageIndex){ //keep track of what direction we're moving and how far we can/should move
					bannerDir = 'right';
					if ((bannerLeftAmt + slideAmt ) > 0){
						slideAmt = bannerLeftAmt - 15;
					}
				}else{
					bannerDir = 'left';
					if ((bannerLeftAmt - slideAmt) < minLeftAmt){
						slideAmt = (minLeftAmt - bannerLeftAmt) + 15;
					}
				}

				if ($(document).scrollTop() > 400) {
					$(window).scrollTo( { top:0, left:0 }, 500);
				}

				slideBanner({ // and slide
					amount: slideAmt,
					amountOut: 15,
					speedIn: 850,
					speedOut: 200,
					direction: bannerDir
				});

				currentPageIndex = index;
			},

			bindNavButtonEvents = function() {
				$buttons.parent().click(function(event) {
					moveNavSlider(event);
				});
			},

			buildSpinner = function($target, isNew, opts) {
				// target -- The target DOM element 
				// doStart -- boolean | true to stat spinner, false to stop it
				// opts -- options to change attributes of spinner, defaults listed below in defOpts
				// isNew -- boolean. If this is a new spinner, build new one. Otherwise, use old settings. 
				// startAfterBuild -- boolean. If true, spinner starts right after build, false or null/undefined will just build 
				// Usining spin.js -- http://fgnass.github.com/spin.js/ 
				// with extension for jquery https://gist.github.com/1290439

				var defOpts = {
					lines: 13, // The number of lines to draw
					length: 7, // The length of each line
					width: 4, // The line thickness
				 	radius: 10, // The radius of the inner circle
					corners: 1, // Corner roundness (0..1)
					rotate: 0, // The rotation offset
					color: '#000', // #rgb or #rrggbb
					speed: 1, // Rounds per second
					trail: 60, // Afterglow percentage
					shadow: false, // Whether to render a shadow
					hwaccel: false, // Whether to use hardware acceleration
					className: 'spinner', // The CSS class to assign to the spinner
				 	zIndex: 2e9, // The z-index (defaults to 2000000000)
					top: 'auto', // Top position relative to parent in px
					left: 'auto' // Left position relative to parent in px
				},

				settings = $.extend({}, defOpts, opts); //combine defaults options with thosed passed

				if (isNew){
					$target.spin(settings); // build the spinner and spin with new options
				}else{
					$target.spin(); // just start the spinner
				}
			},

			setSlideItemHeights = function() {
				$slides.height($(document).height());
			},

	  //===================//
	 //	End of Navigation //
	//===================//


	  //============//
	 //	Tumblr API //
	//============//
			loadTumblrPosts = function() {
				var requestUrl = "http://api.tumblr.com/v2/blog/dumboneighborhoodalliance.tumblr.com/posts/text?api_key=5wZb46seLlNqU0CBBE8lcGDioZEg1gj7DoXQGm7LFfSO3IG3St",
					$spinTarget = $("#postsContainer"),
					that = this,
					returnedPosts = $.ajax({
						type: "GET",
						dataType: "jsonp",
						url: requestUrl,
						beforeSend: function() {
							buildSpinner($spinTarget, true, 
								{
									lines: 11, 
									length: 30,
									width: 15,
									radius: 40,
									speed: 1.4,
									top: 50,
									left: (windowWidth / 2) - 40
								});
						},
						success: function(data) {
							renderTumblrPosts(data.response);
							$spinTarget.spin(false);
						}
					});
			},

			renderTumblrPosts = function(data) {
				var $postsContainer = $("#postsContainer"),
					postsLength = data.posts.length,
					i = 0,
					thisPost,
					postData,
					blogTplSrc = "<div class='tumblrPostWrapper'><div class='ribbon'><div class='ribbon-stitches-top'></div><strong class='ribbon-content'><h1>{{postTitle}}</h1></strong><div class='ribbon-stitches-bottom'></div></div><div class='tumblrPostBodyWrapper'><p class='tumblrPostDate'>{{postDate}}</p>{{{postBody}}}</div><ul class='tumblrPostTags'>{{#each postTags}}<li>#{{this}}</li>{{/each}}</ul></div>",
					postTemplate = Handlebars.compile(blogTplSrc);

				for (; i < postsLength; i += 1) {
					thisPost = data.posts[i];
					postData = {
						postTitle: thisPost.title,
						postBody: thisPost.body,
						postDate: thisPost.date,
						postTags: thisPost.tags
					}

					$postsContainer.append(postTemplate(postData));
				};

				setSlideItemHeights();
			},


	  //===================//
	 //	End of Tumblr API //
	//===================//

	  //============//
	 //	Flickr API //
	//============//

		getPics = function() {
			var url = "http://api.flickr.com/services/rest/",
				settings = {
					dataType: "json",
					error: handleGetPicError,
					success: getPicSucces,
					data: {
						method: "flickr.photosets.getPhotos",
						api_key: "63223375cacce91cf3e7095973baff4c",
						photoset_id: "72157633308940560",
						extras: "url_c",
						format: "json",
						nojsoncallback: 1,
						page: flickrPage,
						per_page: 25
					}
				};

			$.ajax(url, settings);
		},

		handleGetPicError = function( jqXHR, textStatus, errorThrown ) {
			console.log("getPics call failed: ", jqXHR, textStatus, errorThrown); //just logging to console for now
			console.log("Attempting call once more.");

			if ($.browser.msie && !jQuery.support.cors) {
				console.log("CORS disabled. Enabling and trying again.");
				jQuery.support.cors = true;
			}

			getPics(); //try one more time
		},

		getPicSucces = function( data ) {

			if (data && data.stat === "ok") {

				if (data.photoset.pages > flickrPage) {
					flickrPage += 1;
				} else {
					$flickrMoreBtn.remove();
				}
				
				var i,
					thisPic,
					picSet = data.photoset.photo,
					setLength = picSet.length,
					picWrapperSrc = "<li><a class='fancybox' rel='group' href='{{url}}'><img src='{{url}}' id='{{picId}}' class='flickPic'/></li>",
					picTemplate = Handlebars.compile(picWrapperSrc), //compile the handlebars template
					picData;

				for (i = 0; i < setLength; i += 1) {
					thisPic = picSet[i];
					picData = {
						url: thisPic.url_c,
						picId: "flickPick_" + i
					}

					$flickPicHolder.append(picTemplate(picData)); //append the compiled template
				};

				$flickPicHolder.find(".fancybox").fancybox({
					helpers:  {
				        thumbs : {
				            width: 50,
				            height: 50
				        }
				    }
				}); //bind them to fancy box plugin

				$("#flickPicHolder .flickPic").last().one('load', function() {
  					setSlideItemHeights(); //reset heights
				}).each(function() {
				 	if(this.complete) $(this).load();
				});

			} else {
				console.log("Invalid Server Response. Error code: ", data.code, data.message);
				$flickPicHolder.append("<li><h3>Invalid Server Response. Error code: " + data.code + "  " + data.message + "</h3></li>");
			}
		};

	  //================//
	 //	End Flickr API //
	//================//

	  //=======================//
	 //	spin plugin extension //
	//=======================//
		$.fn.spin = function(opts, color) {
			var presets = {
				"tiny": { lines: 8, length: 2, width: 2, radius: 3 },
				"small": { lines: 8, length: 4, width: 3, radius: 5 },
				"large": { lines: 10, length: 8, width: 4, radius: 8 }
			};
			if (Spinner) {
				return this.each(function() {
					var $this = $(this),
						data = $this.data();
					
					if (data.spinner) {
						data.spinner.stop();
						delete data.spinner;
					}
					if (opts !== false) {
						if (typeof opts === "string") {
							if (opts in presets) {
								opts = presets[opts];
							} else {
								opts = {};
							}
							if (color) {
								opts.color = color;
							}
						}
						data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
					}
				});
			} else {
				throw "Spinner class not available.";
			}
		};

	  //==============================//
	 //	End of spin plugin extension //
	//==============================//

		initializePage(); // let's get this party started. http://www.youtube.com/watch?v=mW1dbiD_zDk

	})(jQuery); //This ends my (Dominic) code. The rest is plugins or extenstions to plugins
});


  //======================================//
 //	Background Position animation plugin //
//======================================//

/* http://keith-wood.name/backgroundPos.html
   Background position animation for jQuery v1.1.0.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2010.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var BG_POS = 'bgPos';

var usesTween = !!$.Tween;

if (usesTween) { // jQuery 1.8+
	$.Tween.propHooks['backgroundPosition'] = {
		get: function(tween) {
			return parseBackgroundPosition($(tween.elem).css(tween.prop));
		},
		set: function(tween) {
			setBackgroundPosition(tween);
		}
	};
}
else { // jQuery 1.7-
	// Enable animation for the background-position attribute
	$.fx.step['backgroundPosition'] = setBackgroundPosition;
};

/* Parse a background-position definition: horizontal [vertical]
   @param  value  (string) the definition
   @return  ([2][string, number, string]) the extracted values - relative marker, amount, units */
function parseBackgroundPosition(value) {
	var bgPos = (value || '').split(/ /);
	var presets = {center: '50%', left: '0%', right: '100%', top: '0%', bottom: '100%'};
	var decodePos = function(index) {
		var pos = (presets[bgPos[index]] || bgPos[index] || '50%').
			match(/^([+-]=)?([+-]?\d+(\.\d*)?)(.*)$/);
		bgPos[index] = [pos[1], parseFloat(pos[2]), pos[4] || 'px'];
	};
	if (bgPos.length == 1 && $.inArray(bgPos[0], ['top', 'bottom']) > -1) {
		bgPos[1] = bgPos[0];
		bgPos[0] = '50%';
	}
	decodePos(0);
	decodePos(1);
	return bgPos;
}

/* Set the value for a step in the animation.
   @param  fx  (object) the animation properties */
function setBackgroundPosition(fx) {
	if (!fx.set) {
		initBackgroundPosition(fx);
	}
	$(fx.elem).css('background-position',
		((fx.pos * (fx.end[0][1] - fx.start[0][1]) + fx.start[0][1]) + fx.end[0][2]) + ' ' +
		((fx.pos * (fx.end[1][1] - fx.start[1][1]) + fx.start[1][1]) + fx.end[1][2]));
}

/* Initialise the animation.
   @param  fx  (object) the animation properties */
function initBackgroundPosition(fx) {
	var elem = $(fx.elem);
	var bgPos = elem.data(BG_POS); // Original background position
	elem.css('backgroundPosition', bgPos); // Restore original position
	fx.start = parseBackgroundPosition(bgPos);
	fx.end = parseBackgroundPosition($.fn.jquery >= '1.6' ? fx.end :
		fx.options.curAnim['backgroundPosition'] || fx.options.curAnim['background-position']);
	for (var i = 0; i < fx.end.length; i++) {
		if (fx.end[i][0]) { // Relative position
			fx.end[i][1] = fx.start[i][1] + (fx.end[i][0] == '-=' ? -1 : +1) * fx.end[i][1];
		}
	}
	fx.set = true;
}

/* Wrap jQuery animate to preserve original backgroundPosition. */
$.fn.animate = function(origAnimate) {
	return function(prop, speed, easing, callback) {
		if (prop['backgroundPosition'] || prop['background-position']) {
			this.data(BG_POS, this.css('backgroundPosition') || 'left top');
		}
		return origAnimate.apply(this, [prop, speed, easing, callback]);
	};
}($.fn.animate);

})(jQuery);

  //==========================================//
 //	End Background Position animation plugin //
//==========================================//


  //=========================//
 // jQuery ScrollTo plugin  //
//=========================//

/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.5
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

  //=============================//
 // End jQuery ScrollTo plugin  //
//=============================//