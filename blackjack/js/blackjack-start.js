//orientationWarning();

var card_width = '105px';
var card_height = '145px';
var configObj; //, dealObj;
var playerID = 'demo';
var gameID = '3';


function startGame() {
  var playersInitialCredit = configObj.player.balance,   // TBD: take it from init object
    player = new Participant(playersInitialCredit, 'player1'),  // player init - we have only one player now. Belongs to the MODEL
    dealer = new Participant(0, 'dealer'),  // dealer init. Belongs to the MODEL.
    desk = new HTMLDesk(),  // we use HTML game rendering. Belongs to the VIEW.
    bj = new BJ(player, dealer, desk);// we initialize bj, which is game controller. Belongs to the CONTROLLER.*/
}


function configSetup(configObject) {
  configObj = configObject;
  console.log('OBJECT: ' + configObj);

  document.getElementById("bets-limit-min").innerHTML = "Min: " + configObj.min_bet;
  document.getElementById("bets-limit-max").innerHTML = "Max: " + configObj.max_bet;

  //Note: images if chips have values
  document.getElementById("chip1").setAttribute('data-value', configObj.coin_values[0]);
  document.getElementById("chip2").setAttribute('data-value', configObj.coin_values[1]);
  document.getElementById("chip3").setAttribute('data-value', configObj.coin_values[2]);

  startGame();
}



function init() {
  var init_data = {'player_id': playerID, 'game_id': gameID};
  console.log('INIT');
  $.ajax({
    type: "POST",
    url: '/blackjack/init',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(init_data),
    success: function (data) {
      console.log(data);
      configSetup(data);
      $.publish('initSuccesfull', [data]);
    },
    error: function (jqXHR, errorThrown) {
      $.publish('renewInit', [errorThrown]);
      console.log('shit :/');
      console.log(jqXHR.response);
    }
  });
} //END of init()

function auth() {
  console.log('AUTH');
  $.ajax({
    type: "POST",
    url: '/blackjack/auth',
    contentType: 'application/json',
    dataType: 'json',
    data: '',
    success: function (data) {
      console.log(data);
      setTimeout(function () { init(); }, 1000);
      $.publish('initSuccesfull', [data]);
    },
    error: function (jqXHR, errorThrown) {
      $.publish('renewInit', [errorThrown]);
      console.log('shit :/');
      console.log(jqXHR.response);
    }
  });
} //END of auth()

/**
 *
 * Game initialisation
 *
 */
auth();


