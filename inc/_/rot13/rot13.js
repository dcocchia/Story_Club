var alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
	alphaLen = alpha.length;

shiftAlpha = function( string, inShiftAmt ) {
	var returnString = "",
		foundString,
		foundStringIndex,
		string = string.toLowerCase(),
		shiftAmt = inShiftAmt || 0;

	for (var i = 0, len = string.length; i < len; i++) {
		foundStringIndex = alpha.indexOf(string[i]);

		if ( foundStringIndex !== -1 ) {
			foundStringIndex += shiftAmt;

			if ( foundStringIndex >= alphaLen ) {
				foundStringIndex = ((foundStringIndex % alphaLen));
			}

			foundString = alpha[foundStringIndex];

			returnString += foundString
		 }else {
			returnString += string[i].toString();
		}
	}

	return returnString;
}

returnShiftKey = function( shiftAmt ) {
	return 26 - (shiftAmt % 26);
}

textToBinary = function( string ) {
	var st,i,j,d,
		arr = [],
		len = string.length;

	for (i = 1; i<=len; i++){

		d = string.charCodeAt(len-i);
		
		for (j = 0; j < 8; j++) {
			arr.push(d%2);
			d = Math.floor(d/2);
		}
	}

	return arr.reverse().join("");
}

binToText = function( string ) {
    var output = '',
    	i, j,
    	c = 0,
    	len = string.length;

    for (i = 0; i < len; i+= 8) {
        c = 0;

        for (j = 0; j < 8 ; j++) {
            c <<= 1;
            c |= parseInt(string[i + j]); 
        }

        output += String.fromCharCode(c);
    }

    return output;
}

$(document).ready( function() {
	var $theOutPut = $("#output"),
		$text = $("#text"),
		$manText = $("#caesarText"),
		$manOutPut = $("#caesarOutput"),
		$shiftBy = $("#shiftByNum"),
		$shiftKey = $("#shiftKey"),
		$binOutPut = $("#binOutput"),
		$binToFrom = $("#toFromBinWrapper").find("input:radio"),
		$binText = $("#binText");

	$("#translatebtn").click(function() {
		$theOutPut.slideUp('fast', function() {
			$theOutPut.html( shiftAlpha($("#text").val(), 13) ).slideDown();
		}); 
	});

	$text.keydown(function(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			$theOutPut.slideUp('fast', function() {
				$theOutPut.html( shiftAlpha($text.val(), 13) ).slideDown();
			});
		}
	});

	$("#caesarTranslatebtn").click(function() {
		$manOutPut.slideUp('fast', function() {
			$manOutPut.html( shiftAlpha($manText.val(), parseInt( $shiftBy.val() ) ) ).slideDown();
			$shiftKey.html( returnShiftKey( parseInt( $shiftBy.val() ) ) );
		}); 
	});

	$manText.keydown(function(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			$manOutPut.slideUp('fast', function() {
				$manOutPut.html( shiftAlpha($manText.val(), parseInt( $shiftBy.val() ) ) ).slideDown();
			});
			$shiftKey.html( returnShiftKey( parseInt( $shiftBy.val() ) ) );
		}
	});

	$("#binaryTranslatebtn").click(function() {
		var toFrom = $binToFrom.filter(":checked").attr("data-bin"),
			func = function() {
				var theFunc;

					if (toFrom === "TO") {
						theFunc = textToBinary;
					}else {
						theFunc = binToText;
					}

				return theFunc
			}(); //self calling

		$binOutPut.slideUp('fast', function() {
			$binOutPut.html( func( $binText.val() ) ).slideDown();
		}); 
	});

});