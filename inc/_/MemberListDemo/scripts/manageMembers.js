//Populates Member List, functions for removing Members and unremoving
//
// Dominic Cocchiarella, 2012

(function($) {
	var removedListExists = false;
	var numbOfRemovedMembers = 0;

	var updateRemovedList = function(card){
		numbOfRemovedMembers +=1;
		var $memName = card.find('.memName').text();
		var $removedList = $('#removedList');
		var remCardID = 'removedMember' + numbOfRemovedMembers;
		var removeCard = "<li id='" + remCardID + "' class='removedMemberName'>" + $memName  + "<span class='undoBttn'>Undo</span></li>";
		
		console.log("Active Members: " + (10 - numbOfRemovedMembers));

		$removedListBox = $('#removedListBox');
		if (!removedListExists){
			$removedListBox.show();
			removedListExists = true;
		}

		$removedList.append(card);
		card.hide();
		$removedList.append(removeCard);

		var $remCard = $('#' + remCardID);

		$remCard.find('.undoBttn').one('click', function(e){
			$(this).fadeOut(300, function(){
				console.log($memName + " has been placed back in the Member List");
				$remCard.fadeOut('fast', function() {
					$remCard.remove();
					updateMemberList(card);
				});
			});
		});
	}

	var updateMemberList = function(card){
		numbOfRemovedMembers -=1;
		console.log("Removed Members: " + numbOfRemovedMembers);
		$('#memberListContainer').append(card);

		if (numbOfRemovedMembers <= 0){
			$('#removedListBox').hide();
			removedListExists = false;
		}

		card.fadeIn().find('.removeBttn').replaceWith('<span class="removeBttn">X<span>');

		card.fadeIn().find('.removeBttn').one('click', function(e){
			$thisMemberCard = $(this).closest('li').fadeOut(300, function(){
				$memName = $thisMemberCard.find('.memName').text();
				console.log($memName + " has been removed");
				updateRemovedList($thisMemberCard);
			});	
		});
	}

	$(document).ready(function(){

		//get the elements we'll need
		$members = $(".memberCard");
		$removeButtons = $(".removeBttn");
		//bind hanlders to the elements

		//hover over MemberCard
		$members.hover(
			function () {
				var $rmbButton = $(this).find('.removeBttn');
				$rmbButton.fadeToggle('fast');
			}
		);
		
		//click on remove Member button
		$removeButtons.one('click', function(e){
			$thisMemberCard = $(this).closest('li').fadeOut(300, function(){
				$memName = $thisMemberCard.find('#memName').text();
				console.log($memName + " has been removed");
				updateRemovedList($thisMemberCard);
			});			
		});
	});

})(jQuery);