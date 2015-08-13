/* Game controller constructor */
function BJ (player, dealer, desk) {
  //Game model variables
    var actualBet = 0,
      handLength = 1,
      /*minimumBet = 1,*/
      minimumBet = configObj.min_bet,
      betLimit = configObj.max_bet,
      /*betLimit = 10,*/
      betAmount = 1,
      cash = player.cash,
      chipsOnStack = 0,
      betsDoubled = false,
      self = this,
      messages = {
        "initialBetWarning": "Push chips to place your bets",
        "placeYourBets": "Place your bets",
        "youBetMaximum": "Bet limit reached, start playing.",
        "youCanBetMaximum": "You can bet maximum ",
        "playerWins": "Player wins",
        "playerWinsBlackjack": "BLACKJACK! Player wins",
        "dealerWinsBlackjack": "Dealer has Blackjack",
        "playerLost": "Player lost",
        "dealerWins": "Dealer wins",
        "youWon": "You won:",
        "tieGame": "Game tie",
        "nobodyLost": "Nobody lost",
        "minimumBet": "Minimum bet: ",
        "maximumBet": "Maximum bet: ",
        "currency": " euro ",
        "surrender": "Surrendered Hand",
        "insure": "Do you want to Insure your Hand?"
      }
    ;

    //Shortcuts for desk objects
  var $container = desk.$container,
      $messages = desk.$messages,
      $finalMessage = desk.$finalMessage,
      $bet = desk.$bet,
      $betsScopeMin = desk.$betsScopeMin,
      $betsScopeMax = desk.$betsScopeMax,
      $betLimit = desk.$betLimit,
      $betWarning = desk.$betWarning,
      $cash = desk.$cash,
      $buttons = desk.$buttons,
      $stack = desk.$stack;
      $dealButton = desk.$dealButton,
      $dealersHand = desk.$dealersHand,
      $player = desk.$player,
      $playersHand = desk.$playersHand,
      $playersHands = desk.$playersHands,
      $placeBet = desk.$placeBet,
      $placeYourBets = desk.$placeYourBets,
      $chips = desk.$chips,
      $playersChips = desk.$playersChips,
      $playersChipsStack = desk.$playersChipsStack ,
      $chipsCounter = desk.$chipsCounter ,
      $chipsContainer = desk.$chipsContainer,
      $individualChip = desk.$individualChip,
      $betsAnnulate = desk.$betsAnnulate,
      $hit = desk.$hit,
      $stand = desk.$stand,
      $double = desk.$double,
      $split = desk.$split,
      $newGame = desk.$newGame,
      $surrender = desk.$surrender,
      $noInsure = desk.$noInsure,
      $yesInsure = desk.$yesInsure,
      $holeCard = desk.$holeCard,
      $cardBack = desk.$cardBack,

      $audio = desk.$audio,

      $insuranceBet = desk.$insuranceBet,
      $insuranceCounter = desk.$insuranceCounter;
      //TBD: remove to initialisation function
    $holeCard.append($cardBack);

    var cardDeal = new Howl({
      urls: ['sounds/card-flip.wav']
    });

    var buttonPress = new Howl({
      urls: ['sounds/push-btn.wav']
    });

  /* Game logic related functions */

  //Resets all players hands both in model and view
  this.resetPlayersHands = function () {

    var playersHandsCount = player.hands.length;

    unset2Hand();

    for (var i = 0; i < playersHandsCount; i ++) {
      var $playersHand = $($(desk.$playersHands)[i]);
      var playersHand = player.hands[i];

      $playersHand.resetCardsInHand();
      $playersHand.removeFocus();

      // did player use double in past game?
      // if YES, we remove one half of chips and bet from hand model and update view accordingly
      if (playersHand.betsDoubled) {
        actualBet = actualBet/2;
        player.cash = configObj.player.balance; //player.cash - actualBet;
        player.divideChips();

        playersHand.divideChips();

        $bet.renderText(actualBet);
        $cash.renderText(player.cash);

        desk.splitBetsOnStack(actualBet);
        playersHand.betsDoubled = false;

      //if NOT, we leave all chips
      }

      //We insert empty card message in the first (only) hand
      //TBD: constant instead of 0
      if (i === 0) {
        $playersHand.insertEmptyCard(messages.initialBetWarning);
      }
    }

    player.reset();
  };

  //Game initialisation
  this.newGame = function () {

    //reset dealer's hand
    dealer.reset();

    $dealersHand.resetView();
    $dealersHand.removeFocus();

    //reset player's hands
    self.resetPlayersHands();
    handLength = 1;

    //did player use double in past game?
    if (betsDoubled) {
      //if YES, we remove one half of chips and update view accordingly
      self.splitActualBet();
      betsDoubled = false;
    }

    //desk.resetChipsStack();
    //show bets annulation button if there are some chips on the stack
    if (chipsOnStack > 0) {
      desk.resetChipsStack($betsAnnulate);
      $dealButton.deactivateButton();

      actualBet = 0;

      player.removeAllChips();

      //desk.showBetsAnnulate();
      //player.cash = player.cash - actualBet;
      //this.resetChips();
    } else {
      desk.hideBetsAnnulate();
    }

    $insuranceBet.css("top","0px");
    $insuranceBet.css("transform","rotateZ(0deg)");
    $insuranceBet.css("display","none");
    //$insuranceBet.removeAttr( "style" );

    //init card stack for card dealing (animations)
    desk.initStack();

    //remove badges for card hands values
    desk.removeBadges();

    //we recreate mask for user interaction blocking
    desk.createMask();

    //We show chips container for bets placement
    $chipsContainer.show();

    //update actual bet info
    $bet.renderText(actualBet);

    //update betLimit info
    $betLimit.renderText(betLimit);

    //update cash info
    $cash.renderText(player.cash);

    $betsScopeMin.renderText(messages.minimumBet + minimumBet + messages.currency);
    $betsScopeMax.renderText(messages.maximumBet + betLimit+ messages.currency);


    $finalMessage.hide();
    $holeCard.hide();

    //we prepare messages panel
    $messages.show();

    //and show only deal button
    $dealButton.show();

    //we hide another buttons for this game state
    $newGame.hide();

  };


  // places bets for actual hand
  // respects limits according to the setup
  // uses TimeoutChain because visual chip placement is animated
  this.placeBet = function (betAmount, $chip) {
    var minBetAmount = 1;
    //TBD: betLimit should be moved here
    var betState = actualBet + betAmount;

    var addingChipChain = new TimeoutChain();
    var interval = 1500;

    //Is there possible to place the bet?
    if ((betState) <= betLimit){
      actualBet = betState;
      player.cash = player.cash - betAmount;


      var chipValue = $chip.getChipValue();
      player.addChip(chipValue);
      chipsOnStack = chipsOnStack + 1;

      $bet.renderText(actualBet);
      $cash.renderText(player.cash);

      addingChipChain.add(
        function(){
          desk.renderChipAtStack($playersChipsStack, $chip, betState, interval);
      }, 0);


      if (betState == betLimit) {
        addingChipChain.add(
          function(){
            desk.renderWarningMessage(messages.youBetMaximum);
        }, interval);
      }

      addingChipChain.add(
        function(){$dealButton.activateButton();
      }, 0);

      addingChipChain.start();
    }
    //if there is no possible to bet actual chip value, we issue appropriate warning
    else {
      if ((actualBet + minBetAmount) > betLimit) {
        desk.renderWarningMessage(messages.youBetMaximum);
      } else {
        desk.renderWarningMessage(messages.youCanBetMaximum + (betLimit - actualBet));
      }
    }
  };

  function hideButtons() {
    $hit.hide();
    $stand.hide();
    $double.hide();
    $split.hide();
    $noInsure.hide();
    $yesInsure.hide();
    $surrender.hide();
    $newGame.hide();
  };

  function checkGameButtons(allowedActions, gameOver) {
    if (allowedActions.hit) {
      $hit.activateButton();
      $hit.show();
    } else {
      $hit.hide();
    }
    if (allowedActions.stand) {
      $stand.show();
    } else {
      $stand.hide();
    }
    if (allowedActions.double) {
      $double.show();
    } else {
      $double.hide();
    }
    if (allowedActions.split) {
      $split.show();
    } else {
      $split.hide();
    }
    if (allowedActions.insurance) {
      desk.renderFinalMessage(messages.insure);
      $noInsure.show();
      $yesInsure.show();
    } else {
      $noInsure.hide();
      $yesInsure.hide();
    }
    if (allowedActions.surrender) {
      $surrender.show();
    } else {
      $surrender.hide();
    }
    if (gameOver) {
      $newGame.show();
    } else {
      $newGame.hide();
    }
  }

  function addDealerCard(dealingCardsChain, obj, interval, i) {
    dealingCardsChain.add(function(){
      var newCard =  new Card(obj.dealer_cards[i].num, obj.dealer_cards[i].suit);
      dealer.addCard(newCard);
      desk.renderCardInHand($dealersHand, newCard.fname(), dealer.actualHand.score, interval);
      cardDeal.play();
    }, interval);
  }

  function addPlayerCard(chain, obj, interval, i, hand) {
    chain.add(function(){
      var newCard = new Card(obj.hands[hand].cards[i].num, obj.hands[hand].cards[i].suit);
      player.actualHand = player.hands[hand-1];
      if (hand === 2) {
        $('.first-hand').removeClass('focus actual-players-hand');
        $('.second-hand').addClass('actual-players-hand');
      } else  {
        $('.second-hand').removeClass('actual-players-hand');
        $('.first-hand').addClass('actual-players-hand');
      }
      $playersHand = $('.actual-players-hand');
      player.addCard(newCard);
      desk.renderCardInHand($playersHand, newCard.fname(), player.actualHand.score, interval);
      cardDeal.play();
    }, interval);
  }

  function startDeal(dealObject) {
    dealObj = dealObject;
    if (dealObject.active_hand_num !== 0) {
      configObj.activeHand = dealObject.active_hand_num;
    } else {
      configObj.activeHand = 1;
    }

    configObj.player.balance = dealObj.balance_after;
    player.cash = dealObject.balance_after;
    activeHand = configObj.activeHand;
    actualBet = dealObject.hands[activeHand].original_bet;
    $bet.renderText(actualBet);
    $cash.renderText(player.cash);

    $messages.hide();
    $dealButton.hide();
    $chipsContainer.hide();
    desk.hideBetsAnnulate();

    configObj.sessionID = dealObject.session_id;
    configObj.activeHandID = dealObject.hands[activeHand].hand_id;

    var $playersHand = desk.getActualPlayersHand();
    $playersHand.removeEmptyCard();

    var dealingCardsChain = new TimeoutChain();
    var interval = 900;

    //We put mask blocking user interaction during dealing
    dealingCardsChain.add(function(){
      desk.showMask();
    }, 0);

    //We deal first player's card
    addPlayerCard(dealingCardsChain, dealObj, interval, 0, activeHand);

    //We deal first dealer's card
    addDealerCard(dealingCardsChain, dealObj, interval, 0);

    //We deal second player's card
    addPlayerCard(dealingCardsChain, dealObj, interval, 1, activeHand);


    if (dealObj.ended === false) {
      //We deal hole card
      dealingCardsChain.add(function(){
        $holeCard.show();
        desk.putHandInFocus($playersHand);
      }, interval);

      dealingCardsChain.add(function(){
        checkGameButtons(dealObject.hands[activeHand].allowed_actions);
      }, 10);

      //We recommend next move
     /* dealingCardsChain.add(function(){
        self.recommendMove();
      }, 10);*/

      //And remove UI blocking mask
      dealingCardsChain.add(function(){
        desk.hideMask();
      }, 10);
    } else {
      var dealerCards = dealObj.dealer_cards;
      for (var i = 1; i < dealerCards.length; i++) {
        addDealerCard(dealingCardsChain, dealObj, interval, i);
      }

      dealingCardsChain.add(function(){
        winner(dealObj, 1, dealingCardsChain);
      }, interval);

      //And remove UI blocking mask
      dealingCardsChain.add(function(){
        desk.hideMask();
      }, 10);

      dealingCardsChain.add(function(){
        checkGameButtons(dealObj.hands[activeHand].allowed_actions, true);
        console.log('Game Over');
      }, interval);
    }

    dealingCardsChain.start();
  }

  this.deal = function() {
    console.log(configObj);
    var deal_data = {'player_id': playerID, 'game_id': gameID, 'balance': configObj.player.balance, 'currency':configObj.player.currency, 'bets':actualBet};
    console.log(deal_data);
    hideButtons();
    $.ajax({
      type: "POST",
      url: '/blackjack/deal',
      //HTTP Request Content Type
      contentType: 'application/json',
      dataType:'json', //defaults to text/html,
      data: JSON.stringify(deal_data),
      success: function(data, textStatus, jqXHR){
        self.dealObject = data;
        $.publish('dealSuccesfull',[data]);
        console.log(self.dealObject);

        startDeal(self.dealObject);
      },
      error: function(jqXHR, textStatus, errorThrown){
        $.publish('renewInit',[errorThrown]);
        console.log(jqXHR.response);
      }
    });
  };

  // HIT functionality
  function startHit(obj) {
    activeHand = configObj.activeHand;
    configObj.player.balance = obj.balance_after;
    newCard = obj.hands[activeHand].cards.length-1;

    var hitChain = new TimeoutChain(),
        interval = 1200;

    addPlayerCard(hitChain, obj, interval, newCard, activeHand);

    hitChain.add(function(){
      checkActiveHand(obj);
    }, interval+200);

    hitChain.start();
  }

  // STAND functionality
  function startStand(obj) {
    var standChain = new TimeoutChain(),
        interval = 1200;
    checkActiveHand(obj);
  }

  // DOUBLE functionality
  function startDouble(obj) {
    configObj.player.balance = obj.balance_after;
    activeHand = configObj.activeHand;
    newCard = obj.hands[activeHand].cards.length-1;

    var doubleChain = new TimeoutChain(),
        interval = 800;

    addPlayerCard(doubleChain, obj, interval, newCard, activeHand);

    self.doubleActualBet(obj);

    doubleChain.add(function(){
      checkActiveHand(obj);
    }, interval+200);

    doubleChain.start();
  }

  // SURRENDER functionality
  function startSurrender(obj) {
    configObj.player.balance = obj.balance_after;
    activeHand = configObj.activeHand;

    player.cash = configObj.player.balance;
    $cash.renderText(player.cash);

    var surrenderChain = new TimeoutChain(),
        interval = 800;

    checkActiveHand(obj);
  }

  // SPLIT functionality
  function startSplit(obj) {
    if (obj.active_hand_num !== 0) {
      configObj.activeHand = obj.active_hand_num;
    } else {
      configObj.activeHand = 1;
    }

    handLength = handLength +1;

    var splitCardsChain = new TimeoutChain();
    var interval = 900;

    $playersHand.resetCardsInHand();
    player.reset();
    set2Hand();

    configObj.player.balance = obj.balance_after;
    player.cash = configObj.player.balance; //= obj.balance_after;
    $cash.renderText(player.cash);
    actualBet = obj.total_bet;
    $bet.renderText(actualBet);

    addPlayerCard(splitCardsChain, obj, interval, 0, 2);
    addPlayerCard(splitCardsChain, obj, interval, 0, 1);
    addPlayerCard(splitCardsChain, obj, interval, 1, 2);
    addPlayerCard(splitCardsChain, obj, interval, 1, 1);

    splitCardsChain.add(function(){
      player.actualHand = player.hands[configObj.activeHand];
    }, 0);

    splitCardsChain.add(function(){
      $('.actual-players-hand').addClass('focus');
    }, 0);

    splitCardsChain.add(function(){
      checkActiveHand(obj);
    }, 0);

    splitCardsChain.start();
  }

  // INSURE functionality
  function startInsure(obj) {
    configObj.player.balance = obj.balance_after;
    activeHand = configObj.activeHand;

    player.cash = configObj.player.balance;
    $cash.renderText(player.cash);

    checkActiveHand(obj);
    //checkGameButtons(obj.hands[activeHand].allowed_actions);
  }

  function checkActiveHand(obj) {
    if (obj.active_hand_num === 0) {
      endOfGame(obj);
    } else {
      configObj.activeHand = obj.active_hand_num;
      if (configObj.activeHand === 1) {
        $('.second-hand').removeClass('focus actual-players-hand ');
        $('.first-hand').addClass('focus actual-players-hand ');
        configObj.activeHandID = obj.hands[configObj.activeHand].hand_id;
        $player.activeHand = configObj.activeHand;
      } else if (configObj.activeHand === 2){
        $('.first-hand').removeClass('focus actual-players-hand');
        $('.second-hand').addClass('focus actual-players-hand');
        configObj.activeHandID = obj.hands[configObj.activeHand].hand_id;
        $player.activeHand = configObj.activeHand;
      }
      checkGameButtons(obj.hands[configObj.activeHand].allowed_actions);
    }
  }

  function endOfGame(obj) {

    var endChain = new TimeoutChain();
    var interval = 900;

    endChain.add(function(){
      desk.showMask();
    }, 0);

    if (obj.dealer_cards.length > 1) {
      endChain.add(function(){
        $holeCard.hide();
      }, interval);

      var dealerCards = obj.dealer_cards;
      for (var i = 1; i < dealerCards.length; i++) {
        addDealerCard(endChain, obj, interval, i);
      }
    }

    endChain.add(function(){
      for (var j = 1; j <= handLength; j ++) {
        winner(obj, j, endChain);
      }
    }, 0);

    endChain.add(function(){
      player.cash = obj.balance_after;
      $cash.renderText(player.cash);
    }, interval);

    /*endChain.add(function(){
      checkGameButtons(obj.hands[activeHand].allowed_actions, true);
      console.log('Game Over');
    }, 1200);

    endChain.add(function(){
      desk.hideMask();
    }, 0);*/

    endChain.start();
  }

  function showSideBet(betValue){
    $insuranceBet.css("display","inline-block");
    $insuranceCounter.css("display","inline-block");
    $insuranceCounter.text(betValue);
  }

  function moveInsurance(side) {
    var distance;
    console.log(side);
   /* $insuranceBet.css("display","inline-block");*/
    $insuranceCounter.css("display","none");
    if (side === 'dealer') {
      distance = -2000;
    } else {
      distance = 500;
    }

    Velocity($insuranceBet,
      { top: distance+"px",
        rotateZ: "-360deg"
      },
      {duration: 2000/*,
        complete: function() {
          $insuranceBet.css("transform","none");
          //$insuranceBet.css("transform","none");
        }*/
      }
    );
  }

  function gameAction (action, insureTrue) {
    hideButtons();
    var action_data = {'session_id': configObj.sessionID, 'hand_id':configObj.activeHandID, 'balance': configObj.player.balance, 'currency':configObj.player.currency, 'action': action};
    if (action === 'insurance') {
      if (insureTrue) {
        action_data.insure = true;
        action_data.all_hands = true;
        action_data.insurance_bet =  actualBet / 2;
        showSideBet(action_data.insurance_bet);
      } else {
        action_data.insure = false;
        action_data.all_hands = true;
        action_data.insurance_bet = 0;
      }
    }
    $.ajax({
      type: "POST",
      url: '/blackjack/action',
      //HTTP Request Content Type
      contentType: 'application/json',
      dataType:'json', //defaults to text/html,
      data: JSON.stringify(action_data),
      success: function(data, textStatus, jqXHR){
        self.actionObject = data;
        $.publish(action + ' Succesfull', [data]);
        console.log(self.actionObject);

        if ((action === 'insurance') && (insureTrue))  {
          if (self.actionObject.active_hand_num === 0) {
            moveInsurance('player');
          } else {
            moveInsurance('dealer');
          }
        }

        switch(action) {
          case 'hit' :
            startHit(self.actionObject);
            break;
          case 'stand' :
            startStand(self.actionObject);
            break;
          case 'double' :
            startDouble(self.actionObject);
            break;
          case 'surrender' :
            startSurrender(self.actionObject);
            break;
          case 'split' :
            startSplit(self.actionObject);
            break;
          case 'insurance' :
             startInsure(self.actionObject);
             break;
        }
      },
      error: function(jqXHR, textStatus, errorThrown){
        $.publish('renewInit',[errorThrown]);
        console.log(jqXHR.response);
      }
    });
  }


  this.recommendMove = function () {
    var playerScore = player.actualHand.score;

    //TBD: much more complex strategist
    //http://en.wikipedia.org/wiki/Blackjack
    switch (true) {
      case (playerScore < 11):
        desk.recommendMove('double');
        break;

      case (playerScore < 17):
        desk.recommendMove('hit');
        break;

      case (playerScore >= 17):
        desk.recommendMove('stand');
        break;

      default:
        break;
    }
  };

  // SPLIT implementation
  // TBD:
  // If you get additional pairs (in the first two cards of a hand),
  // most casinos will allow you to resplit, making yet another hand.

  set2Hand = function () {
    $player.css("left", "40%");
    $playersHands.css("position","relative");
    $playersHands.addClass( "first-hand" );
    $('.actual-players-hand .card').remove();
    var secondHand = $playersHands.clone();
    secondHand.removeClass( "actual-players-hand focus first-hand" );
    secondHand.addClass( "second-hand" );
    $player.prepend(secondHand);
  };

  unset2Hand = function () {
    $player.css("left", "50%");
    var secondHand = $('.second-hand');
    secondHand.remove();
    $('.first-hand').addClass('actual-players-hand ');
  };


  this.doubleActualBet = function (obj){
    actualBet = obj.hands[configObj.activeHand].total_bet; //2*actualBet;
    player.actualHand = player.hands[configObj.activeHand-1];

    player.doubleChips();
    player.actualHand.doubleChips();
    configObj.player.balance = obj.balance_after;
    player.cash = configObj.player.balance; //= obj.balance_after;
    $cash.renderText(player.cash);
    $bet.renderText(obj.total_bet);
    desk.doubleChipsOnStack(actualBet, desk.getActualPlayersHand());

    if (configObj.activeHand === 1) {
      betsDoubled = true;
    }
  };


  this.splitActualBet = function(){
    actualBet = actualBet/2;
    player.cash = configObj.player.balance;
    player.divideChips();

    player.actualHand.divideChips();

    $bet.renderText(actualBet);
    $cash.renderText(player.cash);

    desk.splitBetsOnStack(actualBet, desk.getActualPlayersHand());
  };

  // final evaluation
  // sets properly cash and final message
  function winner (obj, hand, endChain) {

    endChain.add(function(){
      if (hand === 1) {
          $(".second-hand").removeClass("focus actual-players-hand");
          $(".first-hand").addClass("focus actual-players-hand");
      } else {
          $(".first-hand").removeClass("focus actual-players-hand");
          $(".second-hand").addClass("focus actual-players-hand");
      }
    }, 500);

    endChain.add(function(){
      switch(obj.hands[hand].winner) {
        case 'P' :
          if (obj.hands[hand].value === 0) {
            desk.renderFinalMessage(messages.playerWinsBlackjack, messages.youWon, obj.hands[hand].return_amount);
          } else {
            desk.renderFinalMessage(messages.playerWins, messages.youWon, obj.hands[hand].return_amount);
          }
          break;
        case 'D' :
          if (obj.dealer_value === 0) {
            desk.renderFinalMessage(messages.dealerWinsBlackjack, messages.playerLost, obj.hands[hand].total_bet);
          } else {
            desk.renderFinalMessage(messages.dealerWins,messages.playerLost,  obj.hands[hand].total_bet);
          }
          break;
        case 'T' :
          desk.renderFinalMessage(messages.tieGame, messages.nobodyLost, "");
          break;
        case 'S' :
           desk.renderFinalMessage(messages.surrender, messages.playerLost,  obj.hands[hand].total_bet/2);
      }
    }, 500);

    endChain.add(function(){
      checkGameButtons(obj.hands[activeHand].allowed_actions, true);
      console.log('Game Over');
    }, 500);

    endChain.add(function(){
      desk.hideMask();
    }, 0);
  }

  this.resetChips = function () {
    desk.resetChipsStack(this);
    $dealButton.deactivateButton();

    player.cash = player.cash + actualBet;
    actualBet = 0;

    player.removeAllChips();

    $cash.renderText(player.cash);
    $bet.renderText(actualBet);
  };


  this.betChipValue = function(){
    var $chip = $(this);
    var chipValue = $chip.getChipValue();
    self.placeBet(chipValue, $chip);
  };

  /* Event listeners */
  /**
    TBD: replace bind and bindIf with on and onIf
    TBD: replace click with touch for touchscreen devices

    We use bindIf in some listeners: button click/touch triggers handler function only if the button is active

    Status is actually indicated using CSS class, might be changed to data- attribute
  */

  // helper for bindIf - binding will be done only if the button has CSS indicated status active
  // (resp. has not class deactivated)
  function thisButtonIsActive (button) {

    if ($(button).hasClass('deactivated')){
      return false;
    } else {
      return true;
    }
  }

  function isMute(button) {
    if ($(button).hasClass('soundOff')) {
      return false;
    } else {
      return true;
    }
  }

  $dealButton.bindIf('click', function() {
    buttonPress.play();
    self.deal();
  }, thisButtonIsActive);
  //var soundFile = 'sounds/push-but.wav';

  //$dealButton.bindIf('click', this.deal, thisButtonIsActive);

  $newGame.bind('click', function() {
    buttonPress.play();
    self.newGame();
  });

  $hit.bind('click', function() {
    buttonPress.play();
    gameAction('hit');
  });

  $stand.bind('click', function() {
    buttonPress.play();
    gameAction('stand');
  });

  $double.bind('click', function() {
    buttonPress.play();
    gameAction('double');
  });

  $split.bind('click', function() {
    buttonPress.play();
    gameAction('split');
  });

  $surrender.bind('click', function() {
    buttonPress.play();
    gameAction('surrender');
  });

  $noInsure.bind('click', function() {
    buttonPress.play();
    gameAction('insurance', false);
  });

  $yesInsure.bind('click', function() {
    buttonPress.play();
    gameAction('insurance', true);
  });

  $chipsContainer.delegate($individualChip, 'click', this.betChipValue);

  $betsAnnulate.bind('click', function() {
    buttonPress.play();
    self.resetChips();
  });

  $audio.bind('click', function() {
    buttonPress.play();
    $audio.toggleClass('soundOff');
    if ($audio.hasClass('soundOff')) {
      Howler.mute();
    } else {
      Howler.unmute();
    }
  });


  /* Subscribers */

  // Update chips stack after every change
 /* $.subscribe('chips', function (chips){
    console.log(chips);

    //desktop.renderChipsOnStack(chips, actualBet);
  });*/

  /* Initialisation */
  self.newGame();
};
