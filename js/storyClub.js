   //=================================//
  //    Story Club Minneapolis       //
 //  Dominic Cocchiarella 2013(c)   //
//=================================//

// Module style keeps gobal scope clean
var StoryClub = (function ($) {
	var storyClub = {}; //exported global var

	var loadingSpinner,
		headShotTimer,
		currentPerf = (Math.floor(Math.random() * 2) + 1).toString(), //choose at random
		waitingPerf = (currentPerf === "1") ? "2" : "1"; //if 1 this will be 2 and vice versa

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

	storyClub.showImages = function() {
		$("#nav").fadeIn('slow');
		$("#propWrapper").fadeIn('slow');
	}

	storyClub.initHeadShotCycle = function() {
		var $this = $(".frame6 .picFrameMainLink");

		$this.removeClass("perf1 perf2").addClass("perf" + currentPerf); //assign random headshot

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

	storyClub.bindLightBoxEvents = function() {
		$('#photoFrame').bind('click', function(event) {
			// stops default click behavior
			event.preventDefault();
			 
			$.iLightBox([
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

			$.iLightBox([
				{
					URL:"#mailChimpForm",
					type:"inline",
					options: {
						width: 500,
						height: 250,
						onRender: storyClub.instateMailChimpForm
					}
				}
			]);

		});

		$("#contactFormFrame").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#contactForm",
					type:"inline",
					options: {
						width: 500,
						height: 250,
						onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#nextShow").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#nextShowTemplate",
					type:"inline",
					options: {
						width: 900,
						height: 700
						//onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#mainPerfs").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#nextShowTemplate",
					type:"inline",
					options: {
						width: 900,
						height: 700
						//onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#aboutShow").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#aboutShowTemplate",
					type:"inline",
					options: {
						width: 900,
						height: 700
						//onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#questions").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#questionsTemplate",
					type:"inline",
					options: {
						width: 900,
						height: 700
						//onRender: storyClub.instateContactForm
					}
				}
			]);
		});

		$("#videos").click( function(e) {
			e.preventDefault();

			$.iLightBox([
				{
					URL:"#videosTemplate",
					type:"inline",
					options: {
						width: 700,
						height: 125
						//onRender: storyClub.instateContactForm
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
	}

	return storyClub; //export the storyClub object and any function/vars inside it
}(jQuery));

$(document).ready(function() {
	StoryClub.bindPicEvents();
	StoryClub.bindLightBoxEvents();
	StoryClub.initHeadShotCycle();
});