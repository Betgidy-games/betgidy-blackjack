/**
 *
 * HTML Desk View constructor
 *
 */
function HTMLDesk() {
  var self = this;

    //Caching different DOM positions
  this.$container = $('#container');
  this.$messages = $('#messages');
  this.$finalMessage = $('#final-message');
  this.$finalMessageBox = $('#final-message-box');
  this.$bet = $('#bet');
  this.$betsScope = $('#bets-scope');
  this.$betsScopeMax = $('#bets-limits-max');
  this.$betsScopeMin = $('#bets-limits-min');
  this.$betLimit = $('#bet-limit');
  this.$betWarning = $('#bet-warning');
  this.$cash = $('#cash');
  this.$buttons = $('#buttons');
  this.$stack = $('#stack');
  this.$dealButton = $('#start-button');
  this.$dealersHand = $('#dealer #dealers-hand');
  this.$player = $('#players');
  this.$playersHand = $('#players .actual-players-hand');
  this.$playersHands = $('#players .hand');
  this.$placeBet = $('.place-bet');
  this.$placeYourBets = $('#place-your-bets');
  this.$chips = $('#chips .casino-chip');
  this.$chipsContainer = $('#chips');
  this.$individualChip = $('.casino-chip');
  this.$playersChips = $('.players-chips');
  this.$playersChipsStack = $('.players-chips-stack');
  this.$chipsCounter = $('.chips-counter');
  this.$betsAnnulate = $('.bets-annulate');
  this.$hit = $('#hit');
  this.$stand = $('#stand');
  this.$double = $('#double');
  this.$split = $('#split');
  this.$newGame = $('#new-game');
  this.$surrender = $('#surrender');
  this.$noInsure = $('#no-insure');
  this.$yesInsure = $('#yes-insure');
  this.$holeCard = $('#hole-card');
  this.$cardBack = $('<img width=' + card_width + ' height=' + card_height + ' src="./img/PNG/back_blue.png">');
  this.$cardBackImage = $('#card-back');

  this.$audio = $('#audio');
  this.$audioImage = $('#audio .btn-audio');

  this.$insuranceBet = $('#insurance-bet');
  this.$insuranceCounter = $('#insurance-bet .chips-counter');

  var chipPress = new Howl({
    urls: ['sounds/poker-chip.wav']
  });

    //Some plugins
  (function ($) {
    // resets given DOM elements
    $.fn.resetView = function () {
      this.html('');
    };

    $.fn.resetCardsInHand = function () {
      var $cards = $(this).find('.card'),
      $emptyCard = $(this).find('.empty-card');

      $cards.remove();
      $emptyCard.remove();
    };

    $.fn.insertEmptyCard = function (cardLabel) {
      var cardLabel = !!(cardLabel) ?  cardLabel : '',
        $emptyCard = $('<div class="empty-card"><span >'+ cardLabel +'</span></div>')
      ;
      this.append($emptyCard);
    };

    $.fn.removeEmptyCard = function () {
      $(this).find('div.empty-card').remove();
    };

    $.fn.removeFocus = function () {
      $(this).removeClass('focus');
    };

    // shows tool for bets annulation (chips removal)
    this.showBetsAnnulate = function () {
      $(this).find('.bets-annulate').show();
    };

    // hides tool for bets annulation (chips removal)
    this.hideBetsAnnulate = function () {
      $(this).find('.bets-annulate').hide();
    };

    // outputs text on given position
    // used for all messages and statistics
    $.fn.renderText = function(text){
      //var text = text.toString(); //console.log('renderText ' + text + ' at position ' + this[0]);
      this.html(text);
    };

    // gets value of placed chip
    $.fn.getChipValue = function(){
      return parseInt(this.attr('data-value'));
    };

    // visually indicates deactivated button
    $.fn.deactivateButton = function(){
      this.addClass('greyed');
      this.addClass('deactivated');
    };

    // visually indicates activated button
    $.fn.activateButton = function(){
      this.removeClass('greyed');
      this.removeClass('deactivated');
    };

    //http://www.bennadel.com/blog/1771-Enable-And-Disable-jQuery-Event-Handlers-Rather-Than-Bind-And-Unbind-.htm
    //This jQuery plugin creates proxied event handlers that consult with an additional conditional callback to see if the original event handler should be executed.
    //TBD: modify for on
    $.fn.bindIf = function(eventType, eventHandler, ifCondition){
        // Create a new proxy function that wraps around the
        // given bind callback.
        var proxy = function(event){
          // Execute the IF condition callback first to see if
          // the event handler should be executed.
          if (ifCondition(this)){ //RK modification: added "this" parameter
            // Pass the event onto the original event
            // handler.
            eventHandler.apply( this, arguments );
        }
      };

      // Bind the proxy method to the target.
      this.bind(eventType, proxy);

      // Return this to keep jQuery method chaining.
      return (this);
    };

    //Test if given selector exists
    $.fn.exists = function(){
      return (this.length > 0);
    };
  })(jq);

  this.createMask = function () {
    if(!($('#mask').exists())){
      var $mask = $('<div id="mask"></div>')
            .css({
                'height': (window.innerHeight + 'px'),
                'width': (window.innerWidth + 'px'),
                'opacity': 0,
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'z-index': 10000,
                'display':'none'
                })
            .appendTo($('body'));
    }
  };

  //Show mask blocking user interaction
  this.showMask = function () {
    var $mask = $('#mask');
    $mask.show();
  };

  //Remove mask blocking user interaction
  this.hideMask = function () {
    var $mask = $('#mask');
    $mask.hide();
  };


  //Initiates card stack for next dealing of cards
  this.initStack = function () {
    var $stack = self.$stack;
    var $cardBack = self.$cardBack;
    var cardShift = -3;

    //First we reset stack
    $stack.html('');

    //First card - purely for estetic effect
    $('<div />').append($cardBack.clone()).appendTo($stack).css({'position':'absolute', 'right': '0px', 'top': '0px'});
    //Second card - purely for estetic effect
    $('<div />').append($cardBack.clone()).appendTo($stack).css({'position':'absolute', 'right': -cardShift + 'px', 'top': -cardShift + 'px'});
    //Third card - container for flip effect
    var $lastCardInStack = $('<div id="last-card-in-stack"><div class="cards-for-flip"><div class="card front" style="position:absolute"><img width='+card_width+' height='+card_height+' src="./img/PNG/back_blue.png"></div><div class="card back" style="position:absolute"></div></div></div>');
    /*<img width="179px" height="250px" src="./img/PNG/back_blue.png">*/
    //$lastCardInStack.find('.front .card').append($cardBack.clone());
    $lastCardInStack.appendTo($stack).css({'position':'absolute', 'right': -2*cardShift + 'px', 'top': 2*(-cardShift) + 'px'});
  };


  //Emphasizes actual participants hand card stack
  this.putHandInFocus = function ($hand) {
    this.$playersHand.removeClass('focus');
    this.$dealersHand.removeClass('focus');

    $hand.addClass('focus');
  };

  this.getActualPlayersHand = function () {
    return $('#players .actual-players-hand');
  };

  this.renderCardOnStack = function (cardfname) {
    var $lastCardInStack = $('#last-card-in-stack');
    var $backCard = $('<img width='+card_width+' height='+card_height+' src="' + cardfname + '">');
    var $card = $('<div class="card"><img width='+card_width+' height='+card_height+' src="' + cardfname + '"></div>');
    var $backCardPosition = $('#last-card-in-stack .back');
    var $cardsForFlip = $('#last-card-in-stack .cards-for-flip');

    $backCardPosition.append($backCard)
    $cardsForFlip.addClass('flipped');
  }


  //Renders individual card in hand
  this.renderCardInHand = function ($hand, cardfname, score, mainInterval) {

    var $backCardPosition = $('#last-card-in-stack .back');
    var $backCard = $('<img width='+card_width+' height='+card_height+' src="' + cardfname + '">');
    var $card = $('<div class="card"><img width='+card_width+' height='+card_height+' src="' + cardfname + '"></div>');
    var $backCardPosition = $('#last-card-in-stack .back');
    var $cardsForFlip = $('#last-card-in-stack .cards-for-flip');
    var $lastCardInStack = $('#last-card-in-stack');

    var cardChain = new TimeoutChain();
    var interval = (mainInterval/2);

    cardChain.add(function(){
      //we append card image to card stack
      $backCardPosition.append($backCard)

      //and then we show it using flip effect
      $cardsForFlip.addClass('flipped');
    }, 200);

    cardChain.add(function(){
      //Now we reset the card stack
      $lastCardInStack.html('<div class="cards-for-flip"><div class="card front" style="position:absolute"><img width='+card_width+' height='+card_height+' src="./img/PNG/back_blue.png"></div><div class="card back" style="position:absolute"></div></div>');

      //and insert card in players hand
      $hand.append($card);

      //Card height and width for future use
      var cardHeight = $card[0].clientHeight;
      var cardWidth = $card[0].clientWidth;

      //Count of cards in hand
      var cardsInHandCount = $hand.find('.card').length;

      //Card shift (in px) in hand
      var cardsShift = 15;

      //TBD: use players model instead, implement chips like a part of player object?
      var $lastCard = $hand.find('.card:last-child');

      //If there is more then one card, we have to remove counter and add new card with shift
      if(cardsInHandCount > 1){
        $hand.find('.counter').remove();
        $lastCard.css({'left': (cardsInHandCount-1)*cardsShift + 'px'});
      };

      //Here we append counter to the last card in hand
      $lastCard.append('<span class="counter">' + score + '</span>')

      //Height and width of hand set for easier focus setup
      $hand.css({'height': cardHeight + 'px', 'width': cardWidth + (cardsShift*(cardsInHandCount-1)) + 'px'})
    }, interval);

    cardChain.start()
  };



  this.renderFinalMessage = function (who, what, amount){
    this.$buttons.hide();
    if (what) {
      this.$finalMessageBox.html('<div>'+ who + '</div><div class="italic">' + what + '&nbsp;'+ amount + ' euro </div>');
    } else {
       this.$finalMessageBox.html('<div>'+ who + '</div>');
    }
    this.$finalMessage.show();
    //this.$cash.renderText(player.cash);
    this.$finalMessage.bind('click', function() {
      self.$finalMessage.hide();
      self.$buttons.show();
    });
    //setTimeout(function(){self.$finalMessage.hide();}, 1500)
  };

  this.renderWarningMessage = function (message){
    self.$finalMessageBox.html('<div>'+ message + '</div>');
    self.$finalMessage.show();

    this.$finalMessage.bind('click', function() {
      self.$finalMessage.hide();
    });
  };

  this.removeBadges = function () {
      $('.button .badge').remove();
  };

  this.appendBadge = function ($button) {
      $button.append('<span class="badge">HINT</span>');
  };

  this.showBetsAnnulate = function () {
    $('.bets-annulate').show();
  };

  this.hideBetsAnnulate = function () {
    $('.bets-annulate').hide();
  };


  this.recommendMove = function (move) {
    var $hitButton = this.$hit;
    var $standButton = this.$stand;
    var $doubleButton = this.$double;

    self.removeBadges();

    switch (move) {
      case "hit":
        self.appendBadge($hitButton);
      break;
      case "stand":
        self.appendBadge($standButton);
      break;
      case "double":
        self.appendBadge($doubleButton);
      break;
      default:
      break;
    }

  };



  this.renderChipAtStack = function($playersChips, $chip, betState, interval) {

    //http://stackoverflow.com/questions/13929972/absolute-position-of-an-element-on-the-screen-using-jquery

    //For testing purposes
    //$playersChips.css({'height':'50px', 'width':'50px', 'background': 'red'})

    //var $lastChipLeftMargin = 0;
    var $chipsStack = $('#chips');
    //var $playersChips = $('#players-chips .players-chips-stack');
    var chipsOnStack = $playersChips.find('.casino-chip').length;
    var $chipDuplicate = $chip.clone();
    var chipShift = -6; /* px */
    var chipShiftTop = -2; /* px */
    var $chipsCounter = $playersChips.find('span.chips-counter');
    var $betsAnnulate = $playersChips.find('span.bets-annulate');

    var chipsStackPosition = $chipsStack.offset();
    var chipPosition = $chip.offset();
    var playersChipsPosition = $playersChips.offset();

    var chipShiftX = chipPosition.left - playersChipsPosition.left - (chipShift*chipsOnStack);
    var chipShiftY = chipPosition.top - playersChipsPosition.top;


    $chip.append($chipDuplicate);

    Velocity($chipDuplicate,
      {translateX: -chipShiftX+"px",
        translateY: -chipShiftY+"px",
        rotateZ: "-360deg"
      },
      {duration: 1000,
        display: "inline-block",
        begin: function() {
          self.showMask();//$chipDuplicate.addClass('bet-chip');
        },
        complete: function() {
          afterChipMove();
          chipPress.play();
          self.hideMask();
        }
      }
    );

    /*TweenLite.to($chipDuplicate, 2,
      {x: -chipShiftX, rotation:-360, onComplete:afterChipMove});//.call(afterChipMove);*/

    /*$chipDuplicate.css3Animate({
      x: -chipShiftX, y: -chipShiftY,  rotateX: '-360deg',
      time: interval, timingFunction: 'ease-in-out', previous: 'true',
      callback: afterChipMove
    });*/

    function afterChipMove () {
      //This doesn't work on mobile devices
      //$chipDuplicate.removeAttr('style');

      $chipDuplicate.attr({'style':''});
      $playersChips.append($chipDuplicate);
      $chipDuplicate.css({'margin-left': chipShift*chipsOnStack + "px", 'margin-top': chipShiftTop*chipsOnStack + "px"/*, 'z-index': -1*/});

      $chipsCounter.text(betState);
      $chipDuplicate.append($chipsCounter.show());
      $chipDuplicate.append($betsAnnulate.show());
    };
  };


  // doubles chips on the stack
  // used for DOUBLE
  this.doubleChipsOnStack = function (actualBet, $hand) {
    var $playersChips = $($hand.find('.players-chips-stack'));
    var $lastChip = $playersChips.find('.casino-chip').eq(-1);
    var lastMargin = parseInt($lastChip.css('marginLeft'));
    var $chipsCounter = $($hand.find('.chips-counter'));
    //var $chipsCounter = $lastChip.find('span.chips-counter');
    // var $betsAnulate = $lastChip.find('span.bets-anulate');
    var chipOffset = -6;

    $chipsCounter.renderText(actualBet);

    $playersChips.find('.casino-chip').each(function(i){
      var $this = $(this);
      $playersChips.append($this.clone().css({'marginLeft': lastMargin + ((i+1)*chipOffset) + 'px'}));
    });

    //remove new positions for chipsCounter and betsAnnulator
    $playersChips.find('.casino-chip').eq(-1).find('span').remove();
    //and move to the last chip the old one
    $lastChip.find('span').appendTo($playersChips.find('.casino-chip').eq(-1));
  };


  // reduces chips in the stack to the half of original amount
  // used if the previous game used DOUBLE
  this.splitBetsOnStack = function (actualBet, $hand) { console.log(actualBet)
    var $playersChips = $($hand.find('.players-chips-stack'));
    var $chipsStack = $playersChips.find('.casino-chip');
    //var $chipsStack = $('#players-chips .casino-chip');
    var chipsStackLength = $chipsStack.length;
    var $counter = $playersChips.find('.chips-counter');

    $chipsStack.each(function(i){
      $this = $(this);

      if (i < chipsStackLength/2){
        $this.remove();
      } else {
        var actualLeftMargin = parseInt($this.css('marginLeft')); 
        var offset = (chipsStackLength/2)*10
        $this.css({'marginLeft': (actualLeftMargin - offset) + 'px'})
      };
    });

    $counter.renderText(actualBet);
  };


  this.resetChipsStack = function($betsAnnulate){console.log($($betsAnnulate))
    var $playersChipsStack = $($betsAnnulate).parents('.players-chips-stack');
    var $chipsCounter = $playersChipsStack.find('.chips-counter');
    var $betsAnnulate = $playersChipsStack.find('.bets-annulate');

    $playersChipsStack.append($chipsCounter.hide());
    $playersChipsStack.append($betsAnnulate.hide());
    $playersChipsStack.find('.casino-chip').remove();
  };

}
