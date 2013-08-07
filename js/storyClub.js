   //=================================//
  //    Story Club Minneapolis       //
 //  Dominic Cocchiarella 2013(c)   //
//=================================//

// Module style keeps gobal scope clean
var StoryClub = (function ($) {
	var storyClub = {}; //exported global var
	
	storyClub.bindPicEvents = function() {
		var $picFrames = $(".picFrameMainLink");

		$picFrames.hover(function(event){
			var $this = $(this),
				$slider = $(this).find(".picSlider");

			event.preventDefault();

			$slider.stop(true, false).animate({ top: "-205px" }, 500, "easeOutExpo");
		}, function(event) {
			var $this = $(this),
				$slider = $(this).find(".picSlider");

			event.preventDefault();

			$slider.stop(true, false).animate({ top: "205px" }, 500, "easeOutExpo");
		});
	}

	storyClub.bindLightBoxEvents = function() {
		$('#vertGroup').bind('click', function(event) {
			// stops default click behavior
			event.preventDefault();
			 
			$.iLightBox([
				{ url: 'img/image1.jpg' },
				{ url: 'img/image2.jpg' },
				{ url: 'img/image3.jpg' },
				{ url: 'img/image4.jpg' }], 
				{ skin: 'dark', startFrom: 0, path: 'vertical' }
			);
				//dark, light, parade, smooth, metro-black, metro-white and mac.
		});

		$('#horGroup').bind('click', function(event) {
				// stops default click behavior
				event.preventDefault();

			$.iLightBox([
				{ url: 'img/image1.jpg' },
				{ url: 'img/image2.jpg' },
				{ url: 'img/image3.jpg' },
				{ url: 'img/image4.jpg' }], 
				{ skin: 'dark', startFrom: 0, path: 'horizontal' }
			);
				//dark, light, parade, smooth, metro-black, metro-white and mac.
		});

		$('#ilightbox').iLightBox();
		$('#youTubeVid').iLightBox();
		$('#vimeoVid').iLightBox();

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
		})
		
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

				if (data.success === "yes") {
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
						$form.html("<h2>Thanks!</h2><div>" + parsedData.msg + "</div>");
					} else {
						//throw error
						$form.html("<h2>Uh oh!</h2><div>" + parsedData.msg + "</div>");
					}

					console.log(parsedData); 
				},
				error: function( a,b,c ) { 
					console.warn("There was an error submitting the form: ", a,b,c); 
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
});