// Basic Photo Slider
// Dominic Cocchiarella, 2012

(function($) {

	var _initSlider = function(elm, direction, autoLoop, delay) {
		var $elm = $(elm); //caching

		if (direction === "left"){
			slideLeft($elm, autoLoop, 5000);
		}else{
			slideRight($elm, autoLoop, 5000);
		}
	}

	var slideLeft = function(elm, autoLoop, delay) {

		if (elm.hasClass('slideIMG1')){
			elm.removeClass('slideIMG1').addClass('slideIMG3');
			updateInfo(1, "left");
		}else{
			if (elm.hasClass('slideIMG2')){
				elm.removeClass('slideIMG2').addClass('slideIMG1');
				updateInfo(2, "left");
			}else{
				elm.removeClass('slideIMG3').addClass('slideIMG2');
				updateInfo(3, "left");
			}
		}

		if (autoLoop){
			setTimeout(function(){
		    	slideLeft(elm, autoLoop, delay); //and repeat
		    }, delay);
		}
	}

	var slideRight = function(elm, autoLoop, delay) {
		
		if (elm.hasClass('slideIMG1')){
			elm.removeClass('slideIMG1').addClass('slideIMG2');
			updateInfo(1, "right");
		}else{
			if (elm.hasClass('slideIMG2')){
				elm.removeClass('slideIMG2').addClass('slideIMG3');
				updateInfo(2, "right");
			}else{
				elm.removeClass('slideIMG3').addClass('slideIMG1');
				updateInfo(3, "right");
			}
		}

		if (autoLoop){
			setTimeout(function(){
		    	slideRight(elm, autoLoop, delay); //and repeat
		    }, delay);
		}
	}

	var updateInfo = function(sliderPos, direction) {
		//sliderPos is the current position of slider

		switch(sliderPos){
			case 1:
				$('#sliderInfo-1').hide();

				if (direction === "right"){
					$('#sliderInfo-2').show();
				}else{
					$('#sliderInfo-3').show();
				}
			break;

			case 2:
				$('#sliderInfo-2').hide();

				if (direction === "right"){
					$('#sliderInfo-3').show();
				}else{
					$('#sliderInfo-1').show();
				}
			break;

			case 3:
				$('#sliderInfo-3').hide();

				if (direction === "right"){
					$('#sliderInfo-1').show();
				}else{
					$('#sliderInfo-2').show();
				}
			break;

			default:
			//something went wront, fall back to slide 1
				$('#sliderInfo-3 sliderInfo-2').hide();
				$('#sliderInfo-1').show();
			break;
		}
	}

	$(document).ready(function () {
		var $imgBox = $('#sliderImageBox');

		setTimeout(function(){
		    	_initSlider($imgBox, "right", true, 5000);
		    }, 5000);
	});

})(jQuery);