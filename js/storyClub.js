   //=================================//
  //    Story Club Minneapolis       //
 //  Dominic Cocchiarella 2013(c)   //
//=================================//

// Module style keeps gobal scope clean
var StoryClub = (function ($) {
	var storyClub = {}; //exported global var
	var threePerformers = true; //special logic throughout for when we have 3 features

	var loadingSpinner,
		headShotTimer,
		currentPerf,
		waitingPerf,
		windowWidth = $(window).width();

		if (!threePerformers) {
			currentPerf = (Math.floor(Math.random() * 2) + 1).toString(), //choose at random
			waitingPerf = (currentPerf === "1") ? "2" : "1"; //if 1 this will be 2 and vice versa
		} else {
			var perfArray = ['1', '2', '3'];
			
			currentPerf = (Math.floor(Math.random() * 3) + 1).toString(); //choose at random
			perfArray.splice(perfArray.indexOf(currentPerf), 1); //remove chosen perf from possible waiting perf
			waitingPerf = perfArray[Math.floor(Math.random()*perfArray.length)]; //choose from the array
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
				waitingPerf = (currentPerf === "1") ? "1" : "2"; //if 1 this will be 2 and vice versa
				currentPerf = (waitingPerf === "1") ? "2" : "1"; //if 1 this will be 2 and vice versa

				$(".perf" + currentPerf).fadeOut(function() {
			    	$(this).removeClass("perf" + currentPerf).addClass("perf" + waitingPerf).fadeIn();
				});

			}

			if (threePerformers) {
				cycle = function() {
					var perfArray = ['1', '2', '3'];
			
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
			preFetching = false;

		this.picSetsInfo;
		this.picSets;

		this.getPicSets = function() {
			var url = "http://api.flickr.com/services/rest/",
				settings = {
					dataType: "json",
					error: flickSelf.getPicSetsError,
					success: flickSelf.getPicSetsSuccess,
					data: {
						user_id: "107693014@N02",
						method: "flickr.photosets.getList",
						api_key: "52c7aee500ac0d9d0a60e1264c651faf",
						format: "json",
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
						flickSelf.picSets[thisSet.id] = {setTitle: thisSet.title._content};
						flickSelf.getPics(thisSet.id);
					}
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
			var url = "http://api.flickr.com/services/rest/",
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

			if ($.browser.msie && !jQuery.support.cors) {
				console.log("CORS disabled. Enabling and trying again.");
				jQuery.support.cors = true;
			}

			getPics(); //try one more time
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
					flickSelf.picSets[photoSetId][i] = thisPic;
				};


			} else {
				console.log("Invalid Server Response. Error code: ", data.code, data.message);
			}
		};

		this.createPhotoSetViewTemplate = function () {
			var template = "<ul class='photoSetThumbs'>",
				thisPicSet;

			for (pic in flickSelf.picSets) {
				thisPicSet = flickSelf.picSets[pic];
				template += "<li><img src='" + thisPicSet.primary.url_o + "'/></li>";
			}

			template += "</ul>";

			return template;
		}

		this.preFetch = function() {
			preFetching = true;
			flickSelf.getPicSets();
		};
	};

	storyClub.instatePhotoView = function() {

	};

	storyClub.bindLightBoxEvents = function(picsData) {
		$('#photoFrame').bind('click', function(event) {
			// stops default click behavior
			event.preventDefault();
			 
			$.iLightBox([
				{ url: 'img/showScenes/showScene (10).jpg' },
				{ url: 'img/showScenes/showScene (11).jpg' },
				{ url: 'img/showScenes/showScene (12).jpg' },
				{ url: 'img/showScenes/showScene (13).jpg' },
				{ url: 'img/showScenes/showScene (14).jpg' },
				{ url: 'img/showScenes/showScene (15).jpg' },
				{ url: 'img/showScenes/showScene (16).jpg' },
				{ url: 'img/showScenes/showScene (17).jpg' },
				{ url: 'img/showScenes/showScene (18).jpg' },
				{ url: 'img/showScenes/showScene (19).jpg' },
				{ url: 'img/showScenes/showScene (20).jpg' },
				{ url: 'img/showScenes/showScene (1).jpg' },
				{ url: 'img/showScenes/showScene (4).jpg' },
				{ url: 'img/showScenes/showScene (6).jpg' },
				{ url: 'img/showScenes/showScene (8).jpg' },
				{ url: 'img/showScenes/showScene (9).jpg' }], 
				{ skin: 'dark', startFrom: 0, path: 'horizontal' }
			);
				//dark, light, parade, smooth, metro-black, metro-white and mac.
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

			var frameWidth = 900,
				frameHeight = 700;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "75%";
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

			var frameWidth = 900,
				frameHeight = 700;


			if (windowWidth < 500) {
				frameWidth = "100%";
				frameHeight = "75%";
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

	return storyClub; //export the storyClub object and any function/vars inside it
}(jQuery));

$(document).ready(function() {
	StoryClub.bindWindowEvents();
	StoryClub.bindPicEvents();
	StoryClub.bindLightBoxEvents();
	StoryClub.initHeadShotCycle();
	StoryClub.flickrInterface.preFetch();
});