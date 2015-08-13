/**
*
* CARDS
*
*/

/**
 *
 * Card object constructor
 *
 * @param {Integer} num  Number on the card
 * @param {String} suit Suit on the card
 */
function Card(num, suit) {
  this.num = num;
  this.suit = suit;
  // The function fname() makes a filename for an image.
  // The filenames are a concatenation of card number and suit
  // Ace = 1 and King = 13
  this.fname = function () {
    return './img/PNG/' + this.num + this.suit + ".png";
  };

}

/**
 *
 * Participant = dealer and player constructor
 *
 * @param {Integer} initialCash [description]
 *
 * @param {String} name [description]
 *
 */
function Participant(initialCash, name) {
  var self = this;

  /**
   * Hand constructor
   */
  function Hand() {
    var self = this;
    // cards in hand
    this.cards = [];
    // chips put on the stack
    this.chips = [];
    // score of the hand
    this.score = 0;
    // are we doubling bets?
    this.betsDoubled = false;
    // calculates and returns score of the hand
    // doesn't modify this.score directly

    this.countScore = function () {

      var cards = this.cards,
        total = 0,
        soft = 0, // This variable counts the number of aces in the hand.
        pips = 0; // The trump pictures on a card used to be called pips.

      for (i = 0; i < cards.length; i++) {
        pips = cards[i].num;
        if (pips == 1 || pips == 'a')  {
          soft = soft + 1;
          total = total + 11;
        } else {
            if (pips == 11 || pips == 12 || pips == 13 || pips == 'j' || pips == 'q' || pips == 'k'){
              total = total + 10;
            } else {
              total = total + pips;
            }
          }
      }

      while ( soft > 0 && total > 21 ) {  // Count the aces as 1 instead
        total = total - 10;              // of 11 if the total is over 21
        soft = soft - 1;
      }

      return total;
    };

    // inserts new card into hand
    // we use it in Participant's method with the same name
    // as it allows use player.addCard instead of player.actualHand.addCard
    this.addCard = function (card) {

      // adds card to the deck
      this.cards.push(card);

      // recalculates score of the hand
      this.score = this.countScore(this.cards);
    };

    // equals initial two cards in hand
    // returns TRUE if those are equal
    // used after initial dealing for eventual SPLIT choice
    /*this.equalCardValues = function () {
      //console.log(self.cards)
      if (self.cards[0].num == self.cards[1].num) {
        return true;
      } else {
        return false;
      }
    };*/

    /**
     *
     * Resets chips for given hand.
     *
     * Actually used for the new game
     *
     * @return {[type]} [description]
     */
    this.removeAllChips = function () {
        var chips = self.chips;
        chips.length = 0;
        //$.publish('chips', [chips]);
    };


    /**
     * Doubles chips in the hand.
     *
     * Used for BJ Double bets
     *
     * @return {[type]} [description]
     */
      this.doubleChips = function () {
        var chips = self.chips,
          chipsLength = chips.length
        ;

        for (var i = 0; i < chipsLength; i++) {
          var chip = chips[i];
          chips.push(chip);
        };

        //$.publish('chips', [chips]);
      };

      /**
       *
       * Divides chips - called during new game initialisation if the previous game used Double (doubleChips)
       *
       * @return {[type]} [description]
       */
      this.divideChips = function () {
        var chips = self.chips;
        var chipsLength = chips.length; //debugger;

        chips.remove(0, ((chipsLength/2) - 1));

        //$.publish('chips', [chips]);
      };


      /**
       *
       * Resets hand
       *
       * @return {undefined}
       */
    this.reset = function () {
      this.cards.length = 0;
      //this.chips.length = 0;
      this.score = 0;
    };

  }; /* END of HAND constructor*/

  // initialises hands of participant with two hands
  this.hands = [(new Hand()), (new Hand())];

  // sets pointer on the actual hand
  this.actualHand = this.hands[0];

  // participants name used for easier identification, useful for example for debuging
  this.name = name;

  // participants cash
  this.cash = initialCash;

  /**
   * Returns actual hand score according to common BlackJacjk rules
   *
   * @param  {Array of Cards} hand [description]
   * @return {Integer}      [description]
   */
  function score (hand) {
    var total = 0,
      soft = 0, // This variable counts the number of aces in the hand.
      pips = 0 // The trump pictures on a card used to be called pips.
    ;
    for (var i = 0; i < hand.length; i++) {
      pips = hand[i].num;
      if (pips == 1) {
        soft = soft + 1;
        total = total + 11;
      } else {
        if (pips == 11 || pips == 12 || pips == 13) {
          total = total + 10;
        } else {
          total = total + pips;
        }
        }
    }
    while (soft > 0 && total > 21) {  // Count the aces as 1 instead
      total = total - 10;              // of 11 if the total is over 21
      soft = soft - 1;
    }

    return total;
  }


  // adds card into actual player's hand
  this.addCard = function (card) {
    //self.hand.push(card);

    self.actualHand.addCard(card);

    self.score = score(self.actualHand);
  };

  // resets participants setting for new game
  // actually it only resets all his hands
  // but some extra functionality might be added here later
  this.reset = function () {
    //self.hand.length = 0;
    //self.score = 0;
    self.resetAllHands();
    self.score = 0;
  };

  /**
   *
   * Resets all hands of given participant
   *
   * @return {undefined} [description]
   */
  this.resetAllHands = function () {
    var allHands = self.hands,
      allHandsLength = allHands.length
    ;

    for (var i = 0; i < allHandsLength; i++) {
        allHands[i].reset();
    };
  };

  // adds one chip on the stack
  this.addChip = function (chip) {
    //var chips = self.chips;

    //chips.push(chip);

    self.actualHand.chips.push(chip);

    //$.publish('chips', [chips]);
  };


  // removes all chips from the hand
  // used for new game start
  this.removeAllChips = function () {
    var chips = self.actualHand.chips;
    chips.length = 0;

    //$.publish('chips', [chips]);
  };


  // doubles chips
  // used for DOUBLE
  this.doubleChips = function () {
    var chips = self.actualHand.chips,
      chipsLength = chips.length
    ;

    for (var i = 0; i < chipsLength; i++) {
      var chip = chips[i];
      chips.push(chip);
    };

    $.publish('chips', [chips]);
  };

  // reduces number of chips to half of original amount
  // used after DOUBLE in previous game
  this.divideChips = function () {
    var chips = self.actualHand.chips,
      chipsLength = chips.length
    ;

    chips.remove(0, ((chipsLength/2)-1));

    $.publish('chips', [chips]);
  };

};
