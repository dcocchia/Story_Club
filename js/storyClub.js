   //=================================//
  //    Story Club Minneapolis       //
 //  Dominic Cocchiarella 2013(c)   //
//=================================//

var TemplateLoader = (function($){
	var templateLoader = {},
		self = templateLoader,
		siteData;

	templateLoader.requestSiteInfo = function() {
		$.ajax({
			url: "/siteInfo",
			success: function(data) {
				siteData = data;
				self.renderTemplates();
				StoryClub.initialize();
			},
			error: function(a,b,c) {
				console.error("getSiteInfo ERROR: ", a, b, c);
				console.warn("Begining storyclub.initialize without siteInfo");
				StoryClub.initialize();
			}
		});
	}

	templateLoader.getSiteData = function() {
		return siteData || {};
	}

	templateLoader.writeTemplate = function(html, el) {
		$(el).html(html);
	}

	templateLoader.writeError = function(err) {
		console.error("ERROR rendering template: ", err);
	}

	templateLoader.renderTemplate = function(options) {
		var data = (options.data) ? options.data : siteData;

		dust.render(options.name, data, function(err, html) {
			if (!err) {
				options.success.call(templateLoader, html, options.el);
			} else {
				options.error.call(templateLoader, err);
			}
		})
	}

	templateLoader.renderTemplates = function() {
		var i = 0 ,
			tempsLen = templateLoader.templates.length,
			thisTpl;

		for (; i < tempsLen; i++) {
			thisTpl = templateLoader.templates[i];
			thisTpl.compiled = dust.compile(thisTpl.tpl, thisTpl.name);
			dust.loadSource(thisTpl.compiled);
			self.renderTemplate(thisTpl);
		}
	}

	templateLoader.findTemplates = function() {
		self.templates = [
			{
				tpl: $("#mobileQuickStats").html(),
				name: "mobileQuickStats",
				el: ".mobileQuickStats",
				success: self.writeTemplate,
				error: self.writeError
			},
			{
				tpl: $("#performerStylesTpl").html(),
				name: "performerStyles",
				el: "#performerStyles",
				success: self.writeTemplate,
				error: self.writeError
			},
			{
				tpl: $("#mainPerfsTpl").html(),
				name: "mainPerfs",
				el: "#mainPerfs",
				success: self.writeTemplate,
				error: self.writeError
			},
			{
				tpl: $("#nextShowTpl").html(),
				name: "nextShow",
				el: "#nextShow",
				success: self.writeTemplate,
				error: self.writeError
			},
			{
				tpl: $("#nextShowDustTemplate").html(),
				name: "nextShowTemplate",
				el: "#nextShowTemplate",
				success: self.writeTemplate,
				error: self.writeError
			},
			{
				tpl: $("#showDetails").html(),
				name: "showDetails",
				el: ".showDetails",
				success: self.writeTemplate,
				error: self.writeError
			}
		]
	}
	

	return templateLoader;
}(jQuery));


// Module style keeps gobal scope clean
var StoryClub = (function ($) {
	var storyClub = {}; //exported global var
	var siteData;
	var threePerformers;

	var loadingSpinner,
		headShotTimer,
		currentPerf,
		waitingPerf,
		windowWidth = $(window).width(),
		windowHeight = $(window).height();

		//IE fix for lasIndexOf :(
		if (!('indexOf' in Array.prototype)) {
		    Array.prototype.indexOf= function(find, i /*opt*/) {
		        if (i===undefined) i= 0;
		        if (i<0) i+= this.length;
		        if (i<0) i= 0;
		        for (var n= this.length; i<n; i++)
		            if (i in this && this[i]===find)
		                return i;
		        return -1;
		    };
		}

	storyClub.initialize = function() {

		storyClub.setSiteData();

		threePerformers = function() {
			if (siteData.performers && siteData.performers.length === 3) {
				return true;
			} else {
				return false;
			}
		}(); //special logic throughout for when we have 3 feature

		if (!threePerformers) {
			currentPerf = (Math.floor(Math.random() * 2)).toString(), //choose at random
			waitingPerf = (currentPerf === "0") ? "1" : "0"; //if 0 this will be 1 and vice versa
		} else {
			var perfArray = ['1', '2', '3'];
			
			currentPerf = (Math.floor(Math.random() * 3)).toString(); //choose at random
			perfArray.splice(perfArray.indexOf(currentPerf), 1); //remove chosen perf from possible waiting perf
			waitingPerf = perfArray[Math.floor(Math.random()*perfArray.length)]; //choose from the array
		}

		storyClub.bindWindowEvents();
		storyClub.bindPicEvents();
		storyClub.bindLightBoxEvents();
		storyClub.initHeadShotCycle();
		storyClub.flickrInterface.preFetch();
	}

	storyClub.setSiteData = function() {
		 siteData = (TemplateLoader) ? TemplateLoader.getSiteData() : {}
	}

	storyClub.initSpinner = function() {
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

		loadingSpinner = new Spinner(opts);
	}

	storyClub.startSpinner = function( el ) {
		//optional el arg, defaults to body
		var spinnerEl = (el) ? el : document.getElementsByTagName("body")[0];
		
		loadingSpinner.spin(spinnerEl);
	}

	storyClub.stopSpinner = function() {
		loadingSpinner.stop();
	}

	storyClub.bindWindowEvents = function() {
		if (window.addEventListener) {
			 window.addEventListener("orientationchange", function() { //if using a ios device, reset widths on orientation change 
				windowWidth = $(window).width();
			}, false);
		}

		$(window).resize(function() {
			windowWidth = $(window).width();
		});
	}

	storyClub.showImages = function() {
		$("#nav").fadeIn('slow');
		$("#propWrapper").fadeIn('slow');
	}

	storyClub.initHeadShotCycle = function() {
		var $this = $(".frame6 .picFrameMainLink");

		$this.removeClass("perf1 perf2 perf3").addClass("perf" + currentPerf); //assign random headshot

		storyClub.startHeadShotCycle();
	}

	storyClub.startHeadShotCycle = function() {
		var $this = $(".frame6 .picFrameMainLink"),
			cycle = function() {
				waitingPerf = (currentPerf === "0") ? "0" : "1"; //if 1 this will be 2 and vice versa
				currentPerf = (waitingPerf === "0") ? "1" : "0"; //if 1 this will be 2 and vice versa

				$(".perf" + currentPerf).fadeOut(function() {
			    	$(this).removeClass("perf" + currentPerf).addClass("perf" + waitingPerf).fadeIn();
				});

			}

			if (threePerformers) {
				cycle = function() {
					var perfArray = ['0', '1', '2'];
			
					perfArray.splice(perfArray.indexOf(currentPerf), 1); //remove chosen perf from possible waiting perf
					waitingPerf = perfArray[Math.floor(Math.random()*perfArray.length)]; //choose from the array

					$(".perf" + currentPerf).fadeOut(function() {
			    		$(this).removeClass("perf" + currentPerf).addClass("perf" + waitingPerf).fadeIn();
			    		currentPerf = waitingPerf;
					});
				}
			}

		//very 5 seconds, change to other headshot
		headShotTimer = setInterval(cycle, 5000);
	}

	storyClub.stopHeadShotCycle = function() {
		clearInterval(headShotTimer); 
	}
	
	storyClub.bindPicEvents = function() {
		var $picFrames = $(".picFrameMainLink"),
			defaultFrameTop = "205px",
			frame6Top = "210px",
			topVal = defaultFrameTop;

		$picFrames.hover(function(event){
			var $this = $(this),
				$slider = $(this).find(".picSlider");

				if ($this.parent().hasClass("frame6")) {
					topVal = frame6Top;
				}

			event.preventDefault();

			$slider.stop(true, false).animate({ top: "-" + topVal }, 500, "easeOutExpo");
		}, function(event) {
			var $this = $(this),
				$slider = $(this).find(".picSlider");

			event.preventDefault();

			$slider.stop(true, false).animate({ top: topVal }, 500, "easeOutExpo");
		});

		$(".frame6 .picFrameMainLink").mouseenter(function() {
			storyClub.stopHeadShotCycle();
		}).mouseleave(function() {
			storyClub.startHeadShotCycle();
		});

	}

	storyClub.flickApi = function() {
		var flickSelf = this,
			flickrPage = 1,
			photoSetsLoaded = false,
			preFetching = false,
			$photoBackBtn = $("#photoViewBackBtn"),
			retryAttempts = 0;

		this.picSetsInfo;
		this.picSets;

		this.getPicSets = function() {
			var url = "https://api.flickr.com/services/rest/",
				settings = {
					dataType: "json",
					error: flickSelf.getPicSetsError,
					success: flickSelf.getPicSetsSuccess,
					data: {
						user_id: "107693014@N02",
						method: "flickr.photosets.getList",
						api_key: "52c7aee500ac0d9d0a60e1264c651faf",
						format: "json",
						primary_photo_extras: "url_o",
						nojsoncallback: 1,
					}
				};

			$.ajax(url, settings);
		};

		this.getPicSetsSuccess = function(data) {
			if (data && data.stat === "ok") {
				var i = 0,
					setsLenght = data.photosets.photoset.length,
					thisSet;

				flickSelf.picSetsInfo = data.photosets.photoset;
				photoSetsLoaded = true;

				if (preFetching) {
					flickSelf.picSets = {};

					for (; i < setsLenght; i += 1) {
						thisSet = flickSelf.picSetsInfo[i];
						flickSelf.picSets[thisSet.id] = {
							title: thisSet.title._content,
							primary : thisSet.primary_photo_extras.url_o,
							id: thisSet.id
						};
						flickSelf.getPics(thisSet.id);
					}

				flickSelf.createPhotoSetViewTemplate($("#photoViewTemplate"));

				}
			} else {
				//error
				console.warn("There was a problem fetching photo sets: ", data);
				photoSetsLoaded = false;
			}
		};

		this.getPicSetsError = function(jqXHR, textStatus, errorThrown) {
			console.warn("There was a problem fetching photo sets: ", jqXHR, textStatus, errorThrown);
			photoSetsLoaded = false;
		};

		this.getPics = function(photoSetId) {
			var url = "https://api.flickr.com/services/rest/",
				settings = {
					dataType: "json",
					error: flickSelf.getPicError,
					success: flickSelf.getPicSucces,
					data: {
						method: "flickr.photosets.getPhotos",
						api_key: "52c7aee500ac0d9d0a60e1264c651faf",
						photoset_id: photoSetId,
						extras: "url_o",
						format: "json",
						nojsoncallback: 1,
						page: flickrPage,
						per_page: 25
					}
				};

			$.ajax(url, settings);
		};

		this.getPicError = function( jqXHR, textStatus, errorThrown ) {
			console.log("getPics call failed: ", jqXHR, textStatus, errorThrown); //just logging to console for now
			console.log("Attempting call once more.");

			if (retryAttempts < 2) {
				retryAttempts += 1;

				if ((navigator.userAgent.indexOf('msie') !== -1) && !jQuery.support.cors) {
					console.log("CORS disabled. Enabling and trying again.");
					jQuery.support.cors = true;
				}

				flickSelf.getPics(); //try one more time
			} else {
				console.warn("getPics retry attempts failed.");
			}
		};

		this.getPicSucces = function( data ) {

			if (data && data.stat === "ok") {

				if (data.photoset.pages > flickrPage) {
					flickrPage += 1;
				}

				if (!flickSelf.picSets) {
					flickSelf.picSets = {};
				}
				
				var i,
					thisPic,
					picSet = data.photoset.photo,
					setLength = picSet.length,
					photoSetId = data.photoset.id;

				for (i = 0; i < setLength; i += 1) {
					thisPic = picSet[i];
					if (thisPic.isprimary = "1") {
						flickSelf.picSets[photoSetId].primary = thisPic;
					}
					if (!flickSelf.picSets[photoSetId].picArr) {
						flickSelf.picSets[photoSetId].picArr = [];
					}
					
					flickSelf.picSets[photoSetId].picArr.push(thisPic);
				};

			} else {
				console.log("Invalid Server Response. Error code: ", data.code, data.message);
			}
		};

		this.createPhotoSetViewTemplate = function ($photoViewer) {
			var template = "<ul class='photoSetThumbs'>",
				thisPicSet;

			for (pic in flickSelf.picSets) {
				thisPicSet = flickSelf.picSets[pic];
				template += "<li flickrId='" + thisPicSet.id + "'><div class='picSetThumbWrapper'><img src='" + thisPicSet.primary + "'/></div><div class='picSetTitle'><span>" + thisPicSet.title + "</span></div></li>";
			}

			template += "</ul>";

			$photoViewer.html(template);
		};

		this.buildPhotoArr = function(picSetId) {
			var finalArr = [],
				i = 0,
				picSetsLength,
				thisPicSet,
				thisPic;

			if (flickSelf.picSets[picSetId]) {
				thisPicSet = flickSelf.picSets[picSetId].picArr
				picSetsLength = thisPicSet.length;
			} else {
				picSetsLength = 0;
			}

			for (; i < picSetsLength; i += 1) {
				thisPic = thisPicSet[i];

				finalArr.push({
					url: thisPic.url_o
				});
			}

			return finalArr;
		};

		this.showPhotoView = function(photoArr) {
			//photoArr ex: 
			//	[{ url: 'img/showScenes/showScene (31).jpg' },
			//	{ url: 'img/showScenes/showScene (30).jpg' },
			//	{ url: 'img/showScenes/showScene (29).jpg' }]

			this.lightBox.close();

			var renderBackBtn = function() {
				$photoBackBtn.show();
			}

			var removeBackBtn = function() {
				$photoBackBtn.hide();
			}

			storyClub.flickrInterface.lightBox = $.iLightBox(
				photoArr, 
				{ 
					skin: 'dark', 
					startFrom: 0, 
					path: 'horizontal', 
					callback: { 
						onShow: renderBackBtn,
						onHide: removeBackBtn
					} 
				}
			);
				//dark, light, parade, smooth, metro-black, metro-white and mac.
		};

		this.preFetch = function() {
			preFetching = true;
			flickSelf.getPicSets();
		};
	};

	storyClub.bindLightBoxEvents = function(picsData) {
		var bindPhotos = function() {
				var picSets = $(".ilightbox-container").find("#photoViewTemplate").find("li");

				picSets.each(function() {
					var $this = $(this);
					$this.click(function(e) {
						e.preventDefault();

						var setId = $this.attr("flickrid"),
							photoArr = storyClub.flickrInterface.buildPhotoArr(setId);


						storyClub.flickrInterface.showPhotoView(photoArr);
					})
				});
			},
			showPicSets = function() {
				var frameWidth = "85%",
					frameHeight = "85%";


				if (windowWidth < 500) {
					frameWidth = "100%";
				}

				storyClub.flickrInterface.lightBox = $.iLightBox([
					{
						URL:"#photoViewTemplate",
						type:"inline",
						options: {
							width: frameWidth,
							height: frameHeight,
							onRender: bindPhotos
						}
					}
				]);
			}

		$("#photoViewBackBtn").click(function(e) {
			e.preventDefault();

			storyClub.flickrInterface.lightBox.close();

			showPicSets();
		});

		$('#photoFrame').bind('click', function(e) {
			// stop default click behavior
			e.preventDefault();
			 
			showPicSets();

		});

		$("#newsLetterFrame").click( function(e) {
			e.preventDefault();

			var frameWidth = 500,
				frameHeight = 250;


			if (windowWidth < 500) {
				frameWidth = "100%";
			}

			$.iLightBox([
				{
					URL:"#mailChimpForm",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight,
						onRender: storyClub.instateMailChimpForm
					}
				}
			]);

		});

		$("#contactFormFrame").click( function(e) {
			e.preventDefault();

			var frameWidth = 500,
				frameHeight = 250;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "75%";
			}

			$.iLightBox([
				{
					URL:"#contactForm",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight,
						onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#nextShow").click( function(e) {
			e.preventDefault();

			var frameWidth = "90%",
				frameHeight = "95%";


			if (windowHeight > 820 ) {
				frameHeight = "90%";
			}

			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "95%";
			}

			$.iLightBox([
				{
					URL:"#nextShowTemplate",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight
					}
				}
			]);
		});

		$("#mainPerfs").click( function(e) {
			e.preventDefault();

			var frameWidth = "90%",
				frameHeight = "95%";

			if (windowHeight > 820 ) {
				frameHeight = "90%";
			}

			if (windowHeight > 820 ) {
				frameHeight = "90%";
			}

			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "95%";
			}

			$.iLightBox([
				{
					URL:"#nextShowTemplate",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight
					}
				}
			]);
		});

		$("#aboutShow").click( function(e) {
			e.preventDefault();

			var frameWidth = 900,
				frameHeight = 700;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "90%";
			}

			$.iLightBox([
				{
					URL:"#aboutShowTemplate",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight
					}
				}
			]);
		});

		$("#questions").click( function(e) {
			e.preventDefault();

			var frameWidth = 900,
				frameHeight = 700;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "85%";
			}

			$.iLightBox([
				{
					URL:"#questionsTemplate",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight
					}
				}
			]);
		});

		$("#videos").click( function(e) {
			e.preventDefault();

			var frameWidth = 700,
				frameHeight = 125;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "50%";
			}

			$.iLightBox([
				{
					URL:"#videosTemplate",
					type:"inline",
					options: {
						width: frameWidth,
						height: frameHeight
					}
				}
			]);
		});
		
	}

	storyClub.instateMailChimpForm = function() {
		var $signUpBtn = $(".ilightbox-wrapper").find("#mailChimpSignUp");

		$signUpBtn.off(); //make sure it doesn't already have a click event binder

		$signUpBtn.click( function(e) {		
			e.preventDefault();

			storyClub.mailChimpSubscribe();
		
			return false;
		});
	}

	storyClub.mailChimpSubscribe = function() {
		var $email = $(".ilightbox-wrapper").find("#email"),
			parsedData = "";

		$.ajax({
			url: 'inc/store-address.php',
			data: 'ajax=true&email=' + escape($email.val()),
			success: function( data ) {
				if (data.indexOf('href="') !== -1) {
					//replace the quote madness
					parsedData = data.replace('href="', "href='");
					parsedData = parsedData.replace('">', "'>");
					parsedData = JSON.parse(parsedData);
				} else {
					parsedData = JSON.parse(data);
				}
				console.log(data);

				if (parsedData.success === "yes") {
					$(".ilightbox-wrapper").find("#mailChimpStatus").html("<h3>Good Job!</h3>" + parsedData.msg);
				} else {
					$(".ilightbox-wrapper").find("#mailChimpStatus").html("<h3>Uh oh!</h3>" + parsedData.msg);
				}
			},
			error: function(a,b,c) {
				$(".ilightbox-wrapper").find("#mailChimpStatus").html("<h3>Uh oh!</h3><span>This doesn't look good: " + a + " -- " + b + " -- " + c + "</span>");
			}
		});
	}

	storyClub.instateContactForm = function( lightBox ) {
		$submitContactForm = $(".ilightbox-wrapper").find("#submitContactForm");

		$submitContactForm.off(); //make sure it doesn't already have a click event binder

		$submitContactForm.click( function(e) {
			e.preventDefault();

			storyClub.contactFormSubmit(lightBox);

			return false;
		});
	}

	storyClub.tubeApi = function() {
		var tubeSelf = this,
			playlistsLoaded = false,
			$vidsBackBtn = $("#vidViewBackBtn");

		this.playlists;

		this.getLists = function(callback) {
			settings = {
				type: "GET",
				data: {
					part:"id",
					channelId: "UCwUpa_FAmJ7HTxY0Vkr8t5A",
					key: "AIzaSyB7w5e071oXQDoLFo_EsNK3n5FMHlLZIHE"
				},
				url: "https://www.googleapis.com/youtube/v3/playlists",
				success: function( data ) {
					callback.call(this, data);
				},
				error: function( a,b,c ) { 
					console.warn("There was an error requesting playlists from YouTube: ", a,b,c);
				}
			}

			$.ajax(settings);
		}

		this.getVids = function(listId, callback) {
			settings = {
				type: "GET",
				data: {
					part: "id,contentDetails",
					playlistId: listId,
					key: "AIzaSyB7w5e071oXQDoLFo_EsNK3n5FMHlLZIHE"
				},
				url: "https://www.googleapis.com/youtube/v3/playlistItems",
				success: function( data ) {
					callback.call(this, data);
				},
				error: function( a,b,c ) { 
					console.warn("There was an error requesting playlists from YouTube: ", a,b,c);
				}
			}

			$.ajax(settings);
		}
	}

	storyClub.contactFormSubmit = function(lightBox) {
		var $form = $(".ilightbox-wrapper").find("#contactForm"),
			$emailAddress = $form.find("#emailAddress").val(),
			$name = $form.find("#name").val(),
			$message = $form.find("#message").val(),
			$telephoneNumber = $form.find("#telephoneNumber").val(),
			settings = {
				type: "POST",
				data: {
					name: $name,
					emailAddress: $emailAddress,
					telephoneNumber: $telephoneNumber,
					message: $message
				},
				url: "inc/send_form_email.php",
				success: function( data ) { 
					var parsedData = JSON.parse(data);

					if (parsedData.success === "yes") {
						$form.html("<h2 class='contactFormSubmitTextHeader'>Thanks!</h2><div class='contactFormSubmitText'>" + parsedData.msg + "</div>");
					} else {
						//throw error
						$form.html("<h2 class='contactFormSubmitTextHeader'>Uh oh!</h2><div class='contactFormSubmitText'>" + parsedData.msg + "</div>");
					}

					console.log(parsedData); 
				},
				error: function( a,b,c ) { 
					console.warn("There was an error submitting the form: ", a,b,c);
					$form.html("<h2 class='contactFormSubmitTextHeader submitError'>Uh oh!</h2><div class='contactFormSubmitText submitError'>There was a problem submitting that form. Sorry about that! <br> You can email us directly at <a href='mailto:StoryClubMinneapolis@gmail.com>'>StoryClubMinneapolis@gmail.com</a><span>We saved your message below, for your copy/paste pleasure</span><textarea>" +  $form.find("#message").val() + "</textarea></div>");
				}
			};

		if (this.verifyForm($form)) {
			$.ajax(settings);
		}
	}

	storyClub.verifyForm = function($form) {
		var $thingsToCheck = $form.find(".checkMe"),
			$emailAddress = $form.find("#emailAddress").val(),
			somethingNotDone = false,
			validateEmail = function(email) { 
				var re = /\S+@\S+\.\S+/; //very simply email validation. The server does a more intense validation after submit
				return re.test(email);
			};

		$thingsToCheck.each( function() {
			$this = $(this);
			if ($this.val() === "" || $this.val() === null || $this.val() === undefined) {
				$this.css('background-color', 'red');
				somethingNotDone = true;
			}
		});

		if (!validateEmail($emailAddress)) {
			somethingNotDone = true;
			$form.find("#emailAddress").css('background-color', 'red');
		}

		return (!somethingNotDone);
	};

	storyClub.flickrInterface = new storyClub.flickApi();
	storyClub.tubeInterface = new storyClub.tubeApi();

	return storyClub; //export the storyClub object and any function/vars inside it
}(jQuery));

$(document).ready(function() {
	TemplateLoader.findTemplates();
	TemplateLoader.requestSiteInfo();
});