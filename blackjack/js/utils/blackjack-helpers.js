	/**
	 * 
	 * HELPERS
	 * 
	 */
	
	/**
	 * 
	 * Helper for easy array item removal
	 *
	 * Use:
	 * array.remove(/index/ from, /index/ to)
	 * Used mainly for manipulation with chips
	 * 
	 * Source:
	 * 	http://ejohn.org/blog/javascript-array-remove/
	 *
	 * 	Array Remove - By John Resig (MIT Licensed)
	 * 
	 * @param  {index} from [description]
	 * @param  {index} to   [description]
	 * @return {Array}      [description]
	 */
	Array.prototype.remove = function (from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};

	
	/**
	 * 
	 * Helper for timeouts chaining
	 *
	 * Source:
	 * http://stackoverflow.com/questions/6921275/is-it-possible-to-chain-settimeout-functions-in-javascript
	 * 
	 */
	 function TimeoutChain () {
	    var This = this;
	    this._timeoutHandler = null;
	    this.chain = new Array();
	    this.currentStep = 0;
	    this.isRunning = false;

	    this.nextStep = function(){
	        This.currentStep = This.currentStep +1;
	        if (This.currentStep == This.chain.length) {
	            This.stop();
	        } else {
	            This.processCurrentStep();
	        }
	    },
	    this.processCurrentStep = function(){
	        This._timeoutHandler = window.setTimeout(function(){
	            This.chain[This.currentStep].func();
	            This.nextStep();
	        },This.chain[This.currentStep].time);
	    },
	    this.start =function(){
	        if (This.chain.length == 0) {
	            return;
	        }
	        if (This.isRunning == true) {
	            return;
	        }
	        This.isRunning = true;
	        This.currentStep = 0;
	        This.processCurrentStep();
	    },
	    this.stop = function(){
	        This.isRunning = false;
	        window.clearTimeout(This._timeoutHandler)
	    },
	    this.add = function(_function,_timeout){
	        This.chain[This.chain.length] = {func : _function, time : _timeout};
	    }
	};

	/**
		change set of variables into json format

	*/

	function parseToJson(playerID, gameID, balance, currency, player, dealer, action) {
 		var text = '{ "player_id": "' + playerID + '"'
 		+ ',"game_id": "' + gameID + '"'
 		+ ',"balance": "' + balance + '"'
 		+ ',"currency": "' + currency + '"'
 		+ ',"participants": {'
 		+ '"player": ' +  JSON.stringify(player)
 		+ ',"dealer": ' + JSON.stringify(dealer)
 	    +'}'
 	    + ',"action": "' + action + '"'
 		+'}'

 		console.log(text);
 	}
	/**
		PUB/SUB library
	    
	    Used for custom events, communication 
	    
	    Defines:
	    $.publish for publishing events
	    $.subscribe for subscribe to event
	    
	    Source:
	    https://github.com/martinjuhasz/pubsub-zepto/blob/master/pubsub.js

        Zepto pub/sub plugin by Martin Juhasz, proted from Peter Higgins jQuery Zepto pub/sub plugin (dante@dojotoolkit.org)

        Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.

        Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
        http://dojofoundation.org/license for more information.
    */  
    (function ($) {

        // the topic/subscription hash
        var cache = {};

        $.publish = function(/* String */topic, /* Array? */args){
            // summary: 
            //      Publish some data on a named topic.
            // topic: String
            //      The channel to publish on
            // args: Array?
            //      The data to publish. Each array item is converted into an ordered
            //      arguments on the subscribed functions. 
            //
            // example:
            //      Publish stuff on '/some/topic'. Anything subscribed will be called
            //      with a function signature like: function(a,b,c){ ... }
            //
            //  |       $.publish("/some/topic", ["a","b","c"]);
            if(typeof cache[topic] === 'object') {  
                cache[topic].forEach(function(property){
                    property.apply($, args || []);
                });
            }
        };

        $.subscribe = function(/* String */topic, /* Function */callback){
            // summary:
            //      Register a callback on a named topic.
            // topic: String
            //      The channel to subscribe to
            // callback: Function
            //      The handler event. Anytime something is $.publish'ed on a 
            //      subscribed channel, the callback will be called with the
            //      published array as ordered arguments.
            //
            // returns: Array
            //      A handle which can be used to unsubscribe this particular subscription.
            //  
            // example:
            //  |   $.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
            //
            if(!cache[topic]){
                cache[topic] = [];
            }
            cache[topic].push(callback);
            return [topic, callback]; // Array
        };

        $.unsubscribe = function(/* Array */handle){
            // summary:
            //      Disconnect a subscribed function for a topic.
            // handle: Array
            //      The return value from a $.subscribe call.
            // example:
            //  |   var handle = $.subscribe("/something", function(){});
            //  |   $.unsubscribe(handle);

            var t = handle[0];
            cache[t] && $.each(cache[t], function(idx){
                if(this == handle[1]){
                    cache[t].splice(idx, 1);
                }
            });
        };

    })(jq);