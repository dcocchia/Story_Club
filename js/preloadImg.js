(function () {
	// NOTE: jQuery not yet loaded, as it's a large DL. All JS here must be done with zero dependencies

	//spinner
	var	opts = {
			lines: 11, // The number of lines to draw
			length: 24, // The length of each line
			width: 13, // The line thickness
			radius: 26, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1.3, // Rounds per second
			trail: 49, // Afterglow percentage
			shadow: true, // Whether to render a shadow
			hwaccel: true, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};

	window.loadingSpinner = new Spinner(opts);

	var startSpinner = function() {
		window.loadingSpinner.spin(window.document.body);
	}

	var placeHeaderBg = function() {
		if (window.document.body) {
			window.document.body.style.backgroundImage = "url(img/background.png)"; //don't show the image loading
		} else {
			var t = setTimeout( function() {
				placeHeaderBg();
			}, 1000)
		}
	}

	//contentLoaded event
	function contentLoaded(win, fn) {

		var done = false, top = true,

		doc = win.document, root = doc.documentElement,

		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',

		init = function(e) {
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},

		poll = function() {
			try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};

		if (doc.readyState == 'complete') fn.call(win, 'lazy');
		else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
				if (top) poll();
			}
			doc[add](pre + 'DOMContentLoaded', init, false);
			doc[add](pre + 'readystatechange', init, false);
			win[add](pre + 'load', init, false);
		}

	}

	contentLoaded(window, startSpinner);

	//preload background
	var bgImg = new Image(500,500);
	bgImg.onload = function () {
		placeHeaderBg();
	}
	bgImg.src = "img/background.png";

	//preload headshots
	var img1 = new Image();
	img1.src = 'img/headShots/NimoFarah.jpg';

	var img2 = new Image();
	img2.src = 'img/headShots/WangPing.jpg';

	var img3 = new Image();
	img3.src = 'img/headShots/KateMoore.jpg';

	//show images when they're ready
	window.onload = function() {
		window.loadingSpinner.stop();

		if (window.StoryClub) {
			//use the nice fade in
			window.StoryClub.showImages();
		} else {
			//JS is not loading or is very slow, just show the images
			var props = document.getElementById("propWrapper"),
				frames = document.getElementById("nav");
			if (props && frames) {
				props.style.display = "inline-block";
				frames.style.display = "inline-block"
			}else {
				//no good.
				console.warn("No props or frames object found!");
			}
		}

		//add classes for browser specific stuff
		var browser = navigator.sayswho= (function(){var N= navigator.appName, ua= navigator.userAgent, tem;	var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];return M;})();
		window.document.body.className += browser[0];
	}


}());