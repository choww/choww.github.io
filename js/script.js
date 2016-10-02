jQuery(function($) {
	/***** TYPE EFFECT *****/

	setInterval(function() { blinkCursor() }, 1600);
	function blinkCursor() {
		$('.type-cursor').fadeTo(150, 0).delay(200).fadeTo(100,1);
	}

	$('.backup-type').hide();	// in case jQ doesn't load

	var chars = 'code'.split("");
	var content = '';
	$.each(chars, function(index, value) {
		content += "<span style='display:none'>" + value + "</span>"
	});
	$('.type-effect').html(content);
	$('.type-effect span').first().show("fast", function showNext() {
		$(this).next("span").show(300, showNext);
	});

	/****** SLIDER *******/
	$('.img-slider').slick({
		fade: true,
		infinite: true
	});

	/***** STICKY TOP BUTTON ****/

	$(window).scroll(function() {
		if ($(this).scrollTop() > 200) {
			$('.to-top').fadeIn(300);
		}
		else {
			$('.to-top').fadeOut(300);
		}
	});

	$('.to-top').click(function(e) {
		e.preventDefault();
		$('html, body').animate({scrollTop: 0}, 300);
		return false;
	});
	
});
