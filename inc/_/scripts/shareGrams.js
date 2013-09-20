//Grabs photos from Instragram to view and manipulate
//
//Dominic Cocchiarella, 2012

(function($) {
	var clientID = "1bcfbaf1d4074726823c56caa7579d02";
	var docLengthened = false;

	var getInstaGramAccessToken = function(){
		console.log('getGramAccessToken started');

		var access_token = location.hash.split('=')[1];

		if (location.hash) {
			createCookie('instaviewer-authorized', access_token, 365);
			return access_token;
		}else{
			var $spinner = $('#spinner');
			$spinner.removeClass('spinnerNotLoading spinnerInit').addClass('spinnerLoading');

			$('#statusBox').append("<div id='connectionWarning' class='connectionWarning'><p>Connecting to Instragram...</p></div>");	    
		    setTimeout(function(){
		    	location.href="https://instagram.com/oauth/authorize/?display=touch&client_id=" + clientID + "&redirect_uri=http://www.dominic-c.com/instaviewer/&response_type=token";
		    }, 2000);
		}
	}

	var getUserID = function(access_token){
		var jsonObj;
		var theUser_id;

		$.ajax({
			type: "GET",
			dataType: "jsonp",
			async: false,
			cache: false,
			url: "https://api.instagram.com/v1/users/self/?access_token=" + access_token,
			success: function(data) {
					console.log("Get ID returned object below");
					console.log(data);
					jsonObj = data; // Keeps things more private
					theUser_id = jsonObj.data.id;
					getPersonalGrams(access_token, theUser_id);
				}
			});
	}

	var init_GetPersonalGrams = function(targetUser){
		var isAuthorized = readCookie('instaviewer-authorized');
		var access_token = "";

		if (isAuthorized === null || isAuthorized === ""){
			access_token = getInstaGramAccessToken();
		}else{
			access_token = isAuthorized;
		}

		if (targetUser == "you"){
			var user_id = getUserID(access_token); //getUserID will call the next ajax func on success
		}else{
			getDomGrams(access_token);
		}
	}

	var getPersonalGrams = function(access_token, user_id){

		if (user_id !== "" && user_id !== null){
			var $spinner = $('#spinner');
			$spinner.removeClass('spinnerNotLoading spinnerInit').addClass('spinnerLoading');

			$.ajax({
				type: "GET",
				dataType: "jsonp",
				cache: false,
				url: "https://api.instagram.com/v1/users/" + user_id + "/media/recent/?access_token=" + access_token,
				success: function(data) {
						instaGramObj = data;
						setTimeout(function(){
							$spinner.removeClass('spinnerLoading').addClass('spinnerNotLoading');
						}, 1500)
						parseGramArray(instaGramObj.data);
						createPaginator(instaGramObj.pagination.next_url); //Make the 'Next' button
						$('#youConnectLine').removeClass('bottomShrinkRight').addClass('bottomGrowLeft');
					}
				});
		}else{
			setTimeout(function(){alert("Could not get access to your Instragram ID")},8000);
		}
	}

	var getDomGrams = function(access_token){
		//Hey, I just met you
		domID = "17984082"
		if (access_token !== "" && access_token !== null){

			var $spinner = $('#spinner');
			$spinner.removeClass('spinnerNotLoading spinnerInit').addClass('spinnerLoading');

			$.ajax({
		//And this is crazy
				type: "GET",
				dataType: "jsonp",
				cache: false,
				url: "https://api.instagram.com/v1/users/" + domID + "/media/recent/?access_token=" + access_token,
				success: function(data) {
		//But here's my json object
						instaGramObj = data;
						setTimeout(function(){
							$spinner.removeClass('spinnerLoading').addClass('spinnerNotLoading');
						}, 1500)
						parseGramArray(instaGramObj.data);
						createPaginator(instaGramObj.pagination.next_url); //Make the 'Next' button
						$('#domConnectLine').removeClass('topShrinkRight').addClass('topGrowLeft');
					}
				});
		//So call me, maybe? 	
		}else{
			setTimeout(function(){alert("Could not get access the access token from Instragram")},8000);
		}
	}

	var createPaginator = function(obj){
		$('#paginator').remove();
		$('<div id="paginator">Next</div>').appendTo('#outerInstaPopHolder').bind('click', function(){
			paginateIt(obj);
		});
	}

	var clearPaginator = function(){
		$('#paginator').remove();
	}

	var paginateIt = function(urlObj){
		$.ajax({
				type: "GET",
				dataType: "jsonp",
				cache: false,
				url: urlObj,
				success: function(data) {
						instaGramObj = data;
						parseGramArray(instaGramObj.data);
						createPaginator(instaGramObj.pagination.next_url); //Make the 'Next' button
					}
				});
	}

	var getPopGrams = function(){
		var popGramObj;
		console.log('Starting getPopularGrams(). Obj is now: ' + popGramObj);
		var theURL = 'https://api.instagram.com/v1/media/popular?client_id=' + clientID;

		var $spinner = $('#spinner');
		$spinner.removeClass('spinnerNotLoading spinnerInit').addClass('spinnerLoading');
		
		console.log(theURL);

		$.ajax({
			type: "GET",
			dataType: 'jsonp',
			cache: false,
			url: theURL,
			success: function(data) { 
				setTimeout(function(){
					$spinner.removeClass('spinnerLoading').addClass('spinnerNotLoading');
				}, 1500);

				popGramObj = data;
				console.log('ajax call successful -- returned object below');
				console.log(popGramObj);
				console.log('calling parseGramArray()');
				parseGramArray(popGramObj.data);
				$('#popConnectLine').removeClass('topShrinkLeft').addClass('topGrowRight'); //extend line to status box
			}
		});		
	}

	var parseGramArray = function(popArray){
		console.log(popArray);
		console.log('starting parseGramArray()');
		var $instaPopHolder = $('#instaPopHolder');
		var instaPopIMGArray = new Array(); 
		var popArrayLength = popArray.length;

		//clear the field
		$instaPopHolder.html('');

		for (i = 0; i < popArrayLength; i += 1) {
			var thePopGram = popArray[i];
			instaPopIMGArray[i] = $('<li id="infoHolder_' + i + '" class="instaPic rounded"></li>');

			var $theImgDiv = instaPopIMGArray[i];
			var theIMG = new Image();
			theIMG.src = thePopGram.images.standard_resolution.url;
			theIMG.id = "popGram" + i;
			$(theIMG).addClass('instaPic corners listedPic').appendTo($theImgDiv);

			var popTemp = generatePopTemp(thePopGram, theIMG.id);
			$theImgDiv.append(theIMG, popTemp);
			$theImgDiv.appendTo($instaPopHolder);
		}

		//bind the click animation to each picture
		$.each($('img.instaPic'), function(i, v) { 
			$(this).click(function() {
				growPic(this, popArrayLength, true);
			});
		});

		appendImages(instaPopIMGArray, $instaPopHolder);
	}

	var generatePopTemp = function(jsonObj, popGramID){
		var memName;
		var memPicSrc;
		var gramCaption;
		var gramLikes;
		var gramTags = "";
		var gramFilter;

		if (jsonObj.user.full_name !== null){
			memName = jsonObj.user.full_name;
			memNameShort = memName.substring(0, 13);
		}else{
			memName = "Anonymous";
		}

		if (jsonObj.user.profile_picture !== null){
			memPicSrc = jsonObj.user.profile_picture;
		}else{
			memPicSrc= "";
		}

		if (jsonObj.caption !== null){
			gramCaption = jsonObj.caption.text;
		} else {
			gramCaption = "No caption";
		}

		if (jsonObj.likes.count !== null){
			gramLikes = jsonObj.likes.count;
		} else {
			gramLikes = 0;
		}

		if (jsonObj.tags.length !== 0){
			gramTags = jsonObj.tags.join(" ");
		}else{
			gramTags = "No Tags"
		}

		if (jsonObj.filter !== null){
			gramFilter = jsonObj.filter;
		}else{
			gramFilter = "n/a"
		}

		imgID = jsonObj.id;

		var gramDivID = memName + "info";

		var view = {
			refMemName: memName,
			refMemNameShort: memNameShort,
			refMemPicSrc: memPicSrc,
			refGramCaption: gramCaption,
			refGramLikes: gramLikes,
			refGramDivID: gramDivID,
			refImgID: imgID,
			refPopGramID: popGramID,
			refGramTags: gramTags,
			refGramFilter: gramFilter
		}

		var theTemp = "<div id='{{refGramDivID}}' class='instaInfo'><p class='instaInfo'><img class='instaProfPic' src='{{refMemPicSrc}}' alt='Profile Pic' title='{{refMemName}}'/><span class='memNameShort'>{{refMemNameShort}}</span></p><p class='likeButton'>{{refGramLikes}}</p><input type='hidden' name='{{refPopGramID}}-ID' id='{{refPopGramID}}-ID' value='{{refImgID}}'><input type='hidden' name='{{refPopGramID}}-Caption' id='{{refPopGramID}}-Caption' value='{{refGramCaption}}'><input type='hidden' name='{{refPopGramID}}-Tags'  id='{{refPopGramID}}-Tags' value='{{refGramTags}}'><input type='hidden' id='{{refPopGramID}}-Filter' name='{{refPopGramID}}-Filter' value='{{refGramFilter}}'><input type='hidden' id='{{refPopGramID}}-full_name' value='{{refMemName}}'></div>";

		var musObj = Mustache.render(theTemp, view);
		return musObj;
	}	

	var appendImages = function(imgArray, appElm){
		var $instaHolder = appElm;
		$instaHolder.show();

		for (i = 0; i < imgArray.length; i += 1){
			$instaHolder.append(imgArray[i]);
			$(imgArray[i]).fadeIn('slow');
		}

		if (!docLengthened){
			var $docHeight = $(document).height();	//cross browser height hack
			$('body').height($docHeight); 
			docLengthened = true;		
		}
	}

	var growPic = function(imgElm, arrayLength, doAnimation){
		var $imgElm = $(imgElm);
		var $imgElmParent = $imgElm.parent();
		var imageWrapperTemp = "<div class='imageWrapper' id='imageBox'></div>";
		var imageInfoPane = "<div id='imageInfoPane' class='imageInfoPane'></div>"; 
		var $imageWrapper = $(imageWrapperTemp).appendTo('body');
		var $imgElmCln = $imgElm.clone().appendTo($imageWrapper);
		var $imageInfoPane = $(imageInfoPane).appendTo($imageWrapper);

		//getting all the info for the infoPane
		var memName = $imgElmParent.find('span').text();
		var fullMemName = $('#' + imgID + '-full_name').val();
		var imgLikeCount = $imgElmParent.find('p.likeButton').text();
		var imgID = $imgElm.attr('id');
		var imgFilter = $('#' + imgID + '-Filter').val();
		var imgTags = $('#' + imgID + '-Tags').val();
		var imgCaption = $('#' + imgID + '-Caption').val();

		var infoTemp = "<p id='memName' class='instaMemName'>" + memName + '</p>' + '<p id="imgCaption">' + '<span class="bigQuote">"</span>' + imgCaption + '<span class="bigQuote">"</span>' + '<p id="imgFilter">' + '<span id="filterHeader">Filter</span>' + '<span id="imgFilterText">' + imgFilter + '</span>' + '</p>' + '<p class="bigLikeButton">' + imgLikeCount + ' Likes</p>' + '<span class="tagsHeader">Tags</span>' + '<p id="imgTags">' + imgTags + '</p>';
		var arrowTemplate = '<div id="leftArrow" class="arrow"><</div><div id="rightArrow" class="arrow">></div><div id="closeButton" class="closeButton">X<div>';

		$imageInfoPane.append(infoTemp);

		$imageWrapper.append(arrowTemplate);
		$imageWrapper.find('#leftArrow').bind('click', function(){
			moveLeft($imgElmParent, arrayLength);
		});

		$imageWrapper.find('#rightArrow').bind('click', function(){
			moveRight($imgElmParent, arrayLength);
		});

		$imgElmParent.addClass('childExpanded');
		
		if (doAnimation){
			$('#photoViewOverlay').fadeIn();
			
			
			$imageWrapper.css('height', '1px').animate({
						height: "614px"
					}, 200);
		}

		$('#closeButton').bind('click', function(){
			shrinkPic($imageWrapper);
		});

		$imgElmCln.addClass('picExpanded').removeClass('instaPic listedPic').one("click", function() {
  			moveRight($imgElmParent, arrayLength);
		});
	}

	var shrinkPic = function(imgElm){
		var $imgElm = $(imgElm);
		$('#photoViewOverlay').fadeOut();
		$imgElm.remove();
	}

	var moveLeft = function(fromTarget, arrayLength){
		var $fromID = fromTarget.attr('id').split('_');
		var fromID = parseInt($fromID[1]);
		var toIDNum = fromID - 1;
		var toID = "infoHolder_" + toIDNum;

		if (fromID <= 0){
			//go to end
			toID = "infoHolder_19";
		}

		var $imgElm = $('#' + toID).find('img:first');
		$('#imageBox').remove();
		growPic($imgElm, arrayLength, false);
	}

	var moveRight = function(fromTarget, arrayLength){
		var $fromID = fromTarget.attr('id').split('_');
		var fromID = parseInt($fromID[1]);
		var toIDNum = fromID + 1;
		var toID = "infoHolder_" + toIDNum;

		if (fromID >= (arrayLength - 1)){
			//go to end
			toID = "infoHolder_0";
		}

		var $imgElm = $('#' + toID).find('img:first');
		$('#imageBox').remove();
		growPic($imgElm, arrayLength, false);
	}

	var upateStatusBox = function(status){
		$statusText = $('#statusText');
		$statusText.hide();
		$statusText.html(status).fadeIn();
	}

	var checkConnectionStatus = function(){
		var isConnected = false;
		var isAuthorized = readCookie('instaviewer-authorized');

		if (isAuthorized !== '' && isAuthorized !== null || location.hash){
			isConnected = true;
		}

		displayConnectionStatus(isConnected);
		return isConnected;
	}

	var displayConnectionStatus = function(isConnected){
		var $statusText = $('#statusText');
		var $connectButton = $('#connectButton').find('.instaButton');

		if (isConnected){
			upateStatusBox("Connected");
			$connectButton.removeClass('notConnected');
			$('#statusBox').addClass('status-connected');
			$('#connectLine').addClass('bottomGrowRight');
			setTimeout(function(){
				init_GetPersonalGrams("you");
				upateStatusBox("You");
			}, 1500)

		}else{
			upateStatusBox("Not Connected");
			$connectButton.addClass('notConnected');
			$('#statusBox').removeClass('status-connected');
			setTimeout(function(){
				getPopGrams();
				upateStatusBox("Popular");
			}, 1500)
		}
	}

	var clearConnectionLines = function(currentLine) {
		var $youConnectLine = $('#youConnectLine');
		var $domConnectLine = $('#domConnectLine');
		var $popConnectLine = $('#popConnectLine');

		switch(currentLine){
			case "popular":
				$youConnectLine.removeClass('bottomGrowLeft').addClass('bottomShrinkRight');
				$domConnectLine.removeClass('topGrowLeft').addClass('topShrinkRight');
			break;
			case "dom":
				$popConnectLine.removeClass('topGrowRight').addClass('topShrinkLeft');
				$youConnectLine.removeClass('bottomGrowLeft').addClass('bottomShrinkRight');
			break;
			case "you":
				$popConnectLine.removeClass('topGrowRight').addClass('topShrinkLeft');
				$domConnectLine.removeClass('topGrowLeft').addClass('topShrinkRight');
			break;
			default:
				$youConnectLine.removeClass('bottomGrowLeft').addClass('bottomShrinkRight');
				$domConnectLine.removeClass('topGrowLeft').addClass('topShrinkRight');
			break;
		}
	}

	var checkForFirst = function(){
		//checks to see if it's the user's first time.
		//If yes, save a new cookie and show tutorial
		//If no, move along
		var cookie = readCookie('visited');

		if (cookie === null || cookie === ""){
			//no cookie found
			createCookie('visited', true, 365);
			initTutorial(); // start first-time tutorial
		}else{
			$('#tutorial').remove();
		}
	}

	var createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}else{
			var expires = "";
		}
		document.cookie = name+"="+value+expires+"; path=/";
	}

	var readCookie =function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	var initTutorial = function(){
		var $tutorial = $('#tutorial');
		var $closeButton = $tutorial.find('#closeTutButton');

		$tutorial.removeClass('tutInit').addClass('openTut'); //show tutorial. CSS handles fade-in
		$closeButton.one('click', function(){
			$tutorial.removeClass('openTut').addClass('closeTut');
			setTimeout(function(){
				$tutorial.remove();
			}, 800)
		});
	}

	$(document).ready(function() {
		var isConnected = checkConnectionStatus();
		$('#instaPopButton').bind('click', function() {
			clearPaginator();
			getPopGrams();
			upateStatusBox('Popular');
			clearConnectionLines('popular');
		});

		$('#instaDomButton').bind('click', function() {
			clearPaginator();
			init_GetPersonalGrams('dom');
			upateStatusBox('Dominic');
			clearConnectionLines('dom');
		});

		$('#instaYouButton').bind('click', function() {
			clearPaginator();
			init_GetPersonalGrams('you');
			upateStatusBox('You');
			clearConnectionLines('you');
		});

		$('#photoViewOverlay').bind('click', function(){
			shrinkPic($('#imageBox'));
		});

		$('#connectButton').bind('click', function() {
			if (isConnected){
				displayConnectionStatus("Connected");
			}else{
				getInstaGramAccessToken();
			}
		});

		checkForFirst();
	});

})(jQuery);