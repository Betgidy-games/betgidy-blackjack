//http://www.html5rocks.com/en/mobile/fullscreen/
//using https://github.com/sindresorhus/screenfull.js

/*document.getElementById("game-status").addEventListener("click",function() {
	if (screenfull.enabled) {
        screenfull.toggle();
        //document.body.webkitRequestFullScreen();
    } else {
        // Ignore or do something else
    }
});*/

// Check initial orientation on load of game if on mobile device
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 // some code..
 	if(window.innerHeight > window.innerWidth){
    	$('<div id="orientation-warning-mask"></div>')
		.appendTo('#container');
	}
}

//TBD: cache this value
//we refresh viewport and recalculate game canvas with every orientation change
//http://moduscreate.com/orientation-change-zoom-scale-android-bug/
/*window.addEventListener('orientationchange', function(){
	function showOrientationWarning(){
		if ($('#orientation-warning-mask').length > 0){
			$('#orientation-warning-mask')
				.css({
					//'width': (window.innerWidth + 'px'), 
					//'height': (window.innerHeight + 'px'), 
				})
				.show();
		} else {
			$('<div id="orientation-warning-mask"></div>')
				.css({
					//'width': (window.innerWidth + 'px'), 
					//'height': (window.innerHeight + 'px'), 
				})
				//.appendTo('#viewporter');
				.appendTo('#container');
		}

		//$('#body').hide();
	};

	function hideOrientationWarning () {
		$('#orientation-warning-mask').hide();
		//$mask.removeClass('orientation-warning-mask').hide();
		//$('#body').show();
	};

	function checkOrientation() {
		//http://stackoverflow.com/questions/4917664/detect-viewport-orientation-if-orientation-is-portrait-display-alert-message-ad
		if(window.innerHeight > window.innerWidth){ 
			hideOrientationWarning();
		} else {
			showOrientationWarning();
		}
	}

	//checkOrientation();
	
}, false);*/


//Detect fullscreen mode in iOS 6
//http://stackoverflow.com/questions/15322915/iphone-ios-6-mobile-safari-is-there-a-way-to-detect-in-browser-fullscreen-mod
//$(document,window).on('resize orientationchange webkitfullscreenchange mozfullscreenchange fullscreenchange',  function(){
//    alert('Hi')
//});
