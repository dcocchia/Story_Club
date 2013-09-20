//Coming Soon

(function($) {

	var expandSoon = function($elm){
		$elm.animate({
			width: "35%"
				}, 250, function(){
					$elm.animate({
						height: "186px"
					}, 250, function(){
						$elm.addClass('hover').append('<div id="suprise" class="suprise">I promise.</div>')
						$('#suprise').fadeIn(2000);
				});
		});

		
	}

	var collapseSoon = function($elm){
		$('.suprise').remove();
		$elm.removeClass('hover');

		$elm.animate({
			width: "10%"
				}, 250, function(){
					$elm.animate({
						height: "32px"
					}, 250);
		});
	}

	var expandApp = function($elm){
		$elm.animate({
			left: "493px"
				}, 250);
	}

	var collapseApp = function($elm){
		$elm.animate({
			left: "348px"
				}, 250);
	}

	$(document).ready(function() {
		$soon = $('#soon');
		$plug = $('#plug');
		$soon.one('mouseover', function() {
			expandSoon($soon);
		});

		$soon.one({
			click: function() {
				collapseSoon($soon);
			}
		});

		$plug.bind({
				mouseover: function(){
				expandApp($plug);
			},	mouseout: function(){
				collapseApp($plug);
			},	click: function(){
				location.href = "http://www.dominic-c.com/instaviewer/";
			}
		});
	});

})(jQuery);