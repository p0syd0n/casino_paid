
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const spriteSheet = new Image();
let cardCount = 0;
spriteSheet.src = 'images/cards.png';
const suits = ["spade", "heart", "club", "diamond"];
const card_order = {"spade": 1, "heart": 2, "club": 3, "diamond": 3}
const CARD_WIDTH = 160;
const CARD_HEIGHT = 225;

// const SCALED_CARD_WIDTH = (CARD_WIDTH * canvas.width)/1350
// const SCALED_CARD_HEIGHT = (225*canvas.height)/2540
const SCALED_CARD_WIDTH = 0.5*CARD_WIDTH
const SCALED_CARD_HEIGHT = 0.5*CARD_HEIGHT
const BETWEEN_CARDS = 32;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;
const minimum_bet = 10;
const dealing_order = ["bot2", "player", "bot1", "dealer"];
const bank = document.getElementById("amount");

bank.innerHTML = localStorage.getItem("bank")
const container = document.getElementById("controls");
const hit_match_button = document.getElementById("hit/matchbet");
const stand_double_bet_button = document.getElementById("stand/doublebet");
const split_minimum_button = document.getElementById("split/minimumbet");
const double_start_button = document.getElementById("double/start");
const buttons = [hit_match_button, stand_double_bet_button, split_minimum_button, double_start_button]
const betBox = document.getElementById("bet");
let STATE;
let state_order = ["betting", "dealing", "bot2_decision", "player_decision", "bot1_decision", "reveal", "payout"];
const dealerText = document.getElementById("dealerText");
let players_cards = {"dealer": [], "bot1": [], "player": [], "bot2": []};
let bets = {"bot1": 0, "player": 0, "bot2": 0};
let running_count = 0;
let true_count = 0;
let deck;
let players_totals = {"dealer": 0, "bot1": 0, "player": 0, "bot2": 0};
let accepting_input = true;
let last_bet = localStorage.getItem("lastBet");
let player_split_decisions = [false, false]; 
let player_soft = false;
let player_split = false;

/*
 these are used to keep track of whether to keep showing the split decision box.
eg:
when player chooses to stand on his first hand, player_split_functions[0] is set to true.
*/
class BasicStrategy {
  static blackjackStrategy = {
    hardTotals: {
      5: ["hit", "hit", "hit", "hit", "hit", "hit", "hit", "hit", "hit", "hit"],
      9: ["hit", "double", "double", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      10: ["double", "double", "double", "double", "double", "double", "double", "double", "hit", "hit"],
      11: ["double", "double", "double", "double", "double", "double", "double", "double", "double", "hit"],
      12: ["hit", "hit", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
      13: ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
      14: ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
      15: ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "surrender/hit", "surrender/hit", "surrender/hit"],
      16: ["stand", "stand", "stand", "stand", "stand", "hit", "surrender/hit", "surrender/hit", "surrender/hit", "surrender/hit"],
      17: ["stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "surrender/stand", "surrender/stand"],
      18: ["stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand"],
    },
    softTotals: {
      13: ["hit", "hit", "hit", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      14: ["hit", "hit", "hit", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      15: ["hit", "hit", "double", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      16: ["hit", "hit", "double", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      17: ["hit", "double", "double", "double", "double", "hit", "hit", "hit", "hit", "hit"],
      18: ["stand", "double", "double", "double", "double", "stand", "stand", "hit", "hit", "hit"],
      19: ["stand", "stand", "stand", "stand", "double", "stand", "stand", "stand", "stand", "stand"],
      20: ["stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand"],
    },
    pairs: {
      2: ["split", "split", "split", "split", "split", "split", "hit", "hit", "hit", "hit"],
      3: ["split", "split", "split", "split", "split", "split", "hit", "hit", "hit", "hit"],
      4: ["hit", "hit", "hit", "split", "split", "hit", "hit", "hit", "hit", "hit"],
      5: ["double", "double", "double", "double", "double", "double", "double", "double", "hit", "hit"],
      6: ["split", "split", "split", "split", "split", "hit", "hit", "hit", "hit", "hit"],
      7: ["split", "split", "split", "split", "split", "split", "hit", "hit", "stand", "hit"],
      8: ["split", "split", "split", "split", "split", "split", "split", "split", "split", "split"],
      9: ["split", "split", "split", "split", "split", "stand", "split", "split", "stand", "stand"],
      10: ["stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand", "stand"],
      11: ["split", "split", "split", "split", "split", "split", "split", "split", "split", "split"],
    },
  };

  static getMove(playerHand, dealerUpcard) {
    const dealerIndex = dealerUpcard - 2; // Map dealer card to 0-9 index
    if (playerHand.isPair) {
      return this.blackjackStrategy.pairs[playerHand.value][dealerIndex];
    } else if (playerHand.isSoft) {
      return this.blackjackStrategy.softTotals[playerHand.value][dealerIndex];
    } else {
      console.log(playerHand.value, dealerIndex);
      return this.blackjackStrategy.hardTotals[playerHand.value][dealerIndex];
    }
  }
}

// // Example usage:
// const playerHand = { isPair: false, isSoft: false, value: 15 };
// const dealerUpcard = 10;
// console.log(BasicStrategy.getBlackjackMove(playerHand, dealerUpcard)); // Output: "surrender/hit"

class Card {
  
  constructor(card="pick", up, owner, hand_number=null) {
    // Defined later
    this.spriteSheet_x;
    this.spriteSheet_y;
    // Defined when drawing
    this.x;
    this.y;
    this.hand_number = hand_number;
  
    this.up = up; // face up or not face up


    if (card == "pick") {

      this.card = pickCard();
      
    } else {
      this.card = card;
      const index = deck.indexOf(card)
      if (index > -1) {
        deck.splice(index, 1);
      }
    }


    this.owner = owner;
    // Keep track of cards - to not use ourselves as "previous card" in drawing

    this.id = cardCount++;
    console.log(`Card created with ID: ${this.id}`);
    this.initialize();

    // Add it to the players cards;
    if (hand_number) {
      players_cards[this.owner][hand_number].push(this);
    } else {
      players_cards[this.owner].push(this);
    }
  }

  info() {
    // Cards are undecided until they are flipped, so that people can't cheat in the console
    console.log(`${!up ? "undecided card" : card} at ${this.x}, ${this.y}`);
  }

  initialize() {
    try {
      let card_data = this.card.split("_");
      let card_suit = card_data[1];
      let card_value = card_data[0];
      this.spriteSheet_x = BETWEEN_CARDS + BETWEEN_CARDS*(card_value-1) + CARD_WIDTH * (card_value-1);
      this.spriteSheet_y = card_order[card_suit]*BETWEEN_CARDS + (card_order[card_suit] - 1) * CARD_HEIGHT;
    } catch (e) {
      return;
    }
  }

  flip() {
    if (this.up) {
      window.location.href = "https://stackoverflow.com";
      return;
    }

    this.up = true;

    this.draw();
  }


  getValue() {
    if ( parseInt(this.card.split("_")[0]) > 10) return 10
    return  parseInt(this.card.split("_")[0])
  }

  draw() {
    if (this.hand_number) console.log(this)
    let canvasX;
    let canvasY;

    switch (this.owner) {
      case "dealer":
        try {
          // Find the index of the current card and get the previous card's x
          const dealerCards = players_cards.dealer;
          const currentIndex = dealerCards.findIndex(card => card.id === this.id);
          if (currentIndex > 0) {
            canvasX = dealerCards[currentIndex - 1].x +  32; // Previous card's x minus 32
          } else {
            throw new Error("No previous card exists for the dealer");
          }
        } catch (e) {
          canvasX = 0.5 * canvasWidth; // Default position for the first card
        }
        canvasY = 0.2 * canvasHeight;
        break;

      case "bot1":
        //console.log("Drawing card for bot1.")
        try {
         // console.log("trying.")
          const bot1Cards = players_cards.bot1;
          //console.log("at this moment, bot1 cards are: " + bot1Cards)
          const currentIndex = bot1Cards.findIndex(card => card.id === this.id);
          //console.log("My index in bot1 cards is " + currentIndex)
          if (currentIndex > 0) {
            //console.log("I'm not the first! drawing myself.")
            canvasX = bot1Cards[currentIndex - 1].x + 32; // Previous card's x plus 32
          } else {
            //console.log("I'm the first :( throwing error to skip to first draw ")
            throw new Error("No previous card exists for bot1");
          }
        } catch (e) {
          //console.log("drawing my first self. lonely :(")
          canvasX = 0.1 * canvasWidth;
        }
        canvasY = canvasHeight - 0.5 * canvasHeight;
        break;

      case "player":
        try {
          const playerCards = players_cards.player;
          const currentIndex = playerCards.findIndex(card => card.id === this.id);
          if (currentIndex > 0) {
            canvasX = playerCards[currentIndex - 1].x + 32;
          } else {
            throw new Error("No previous card exists for the player");
          }
        } catch (e) {
          canvasX = 0.5 * canvasHeight;
        }
        canvasY = canvasHeight - 0.38 * canvasHeight;
        break;

      case "bot2":
        try {
          const bot2Cards = players_cards.bot2;
          const currentIndex = bot2Cards.findIndex(card => card.id === this.id);
          if (currentIndex > 0) {
            canvasX = bot2Cards[currentIndex - 1].x - 32;
          } else {
            throw new Error("No previous card exists for bot2");
          }
        } catch (e) {
          canvasX = canvasWidth - 0.2 * canvasWidth;
        }
        canvasY = canvasHeight - 0.55 * canvasHeight;
        break;

      default:
        return;
    }

    this.x = canvasX;
    this.y = canvasY;

    if (!this.up) {
        // Draw a blue rectangle when this.up is false
        ctx.fillStyle = "blue";
        ctx.fillRect(canvasX, canvasY, SCALED_CARD_WIDTH, SCALED_CARD_HEIGHT);
    } else {
      //console.log("drawing normally.")
        // Draw the card normally
        ctx.drawImage(
            spriteSheet,  // The sprite sheet image
            this.spriteSheet_x, this.spriteSheet_y, // The coordinates of the top-left corner of the card in the sprite sheet
            CARD_WIDTH, CARD_HEIGHT, // The size of the card in the sprite sheet
            canvasX, canvasY, // The position of the card's top-left corner on the canvas
            SCALED_CARD_WIDTH, SCALED_CARD_HEIGHT // The size of the card on the canvas (it can be the same size as in the sprite sheet)
        );
    }
  }


}

function populate_deck() {
  var deck = [];
  var current_suit = 0;
  for (let j=0; j<4; j++) {
    for (let i = 1; i<=13; i++) {
      let prefix = i;
      deck.push(`${prefix}_${suits[current_suit]}`);
    }
    current_suit++
  }
  return deck;
}

function pickCard() {
  let card = deck[Math.floor(Math.random() * deck.length)];
  const index = deck.indexOf(card)
  if (index > -1) {
    deck.splice(index, 1);
  }
  return card;
}

// function deal_cards() {
//   const turns = ["bot2", "player", "bot1", "dealer"];
//   for (let i = 0; i < 4; i++) {
//     const newCard = new Card("pick", true, turns[0]);
//     newCard.draw();
//   }

//   for (let i = 0; i < 2; i++) {
//     const newCard = new Card("pick", true, turns[0]);
//     newCard.draw();
//   }
//   const newCard = new Card("pick", false, "dealer");
//   newCard.draw();
// }

function notEnough() {
  alert("not enough monay brokie")
}

function updateBetBox() {
  betBox.value = bets.player;
}

function updateBetBoxWithTotal() {
  betBox.value = "Current Total: " + ((player_soft) ? "S " : "") + JSON.stringify( (player_soft) ? players_totals.player + 10 : players_totals.player);
}

function updateBankLabel() {
  bank.innerHTML = localStorage.getItem("bank");
}

function updateDealerLabel(revealed) {
  // If cards have been revealed, proceed as usual. If not, subtract the dealers second card (and so, return only the faceup card.)
  dealerText.innerHTML = players_totals.dealer - ( (revealed) ? 0 : players_cards.dealer[1].getValue() );
}

function disableButtons() {
  for (let button of buttons) {
    button.disabled = true;
    button.style.backgroundColor = "gray";
    button.style.color = "white";
    button.style.cursor = "not-allowed";
    console.log(button.style.cursor, button.disabled)
  }
}

function enableButtons() {
  for (let button of buttons) {
    button.disabled = false;
    button.style.backgroundColor = ""; // Reset to default or specify a new color
    button.style.color = "";
    button.style.cursor = "";
  }
}

container.addEventListener("click", (event) => {
  // div for buttons. 
  console.log("state: " + STATE)
  if (event.target.tagName === "BUTTON" && accepting_input) { // Make sure that we reject everything when the program is not expecting input from the user.
    const buttonId = event.target.id;

    if (STATE === state_order[0]) {
      // state order 0 is betting.
      handleBetting(buttonId);
    } else if (STATE === state_order[3]) {
      // state order 3 is player decision.
      handlePlayerActions(buttonId);
    }
  }
});

function handleBetting(buttonId) {
  // Game state 0. Player is expected to make a bet.
  // Switch case to determine actions based on which button was pressed.
  // Each button represents two actions, depending on the game state.
  
  switch (buttonId) {
    case "hit/matchbet":
      bets.player = localStorage.getItem("lastBet");
      updateBetBox();
      break;
    case "stand/doublebet":
      bets.player = 2 * localStorage.getItem("lastBet");
      updateBetBox();
      break;
    case "split/minimumbet":
      bets.player = minimum_bet;
      updateBetBox();
      break;
    case "double/start":
      bets.player = parseInt(betBox.value);
      if (bets.player > localStorage.getItem("bank")) {
        bets.player = 0;
        notEnough();
        break;
      }
      accepting_input = false;
      break;
    default:
      // Not sure what this would even be. Kinda like the integral of position 
      break;
  }
}

async function handlePlayerActions(buttonId) {
  // Game state 3. Player is expected to make decisions about their hand. (*sigh* decisions, decisions....)
  // TODO: add a counter below the hand to display the total.
  // TODO: hard vs soft hands.
  switch (buttonId) {
    case "hit/matchbet":
      const new_card = new Card("pick", true, "player");
      new_card.draw();
      // update the totals counter
      players_totals.player += new_card.getValue();
      
      // Don't allow the player to hit more if they busted or have blackjack
      console.log("about to check player totals.player and player.soft: " + players_totals.player + " " + player_soft)
      if (players_totals.player + 10 > 21 && player_soft) {
        console.log("just now he hit and got hard")
        player_soft = false;
        players_totals.player -= 10;
      } else if (players_totals.player >= 21) {
        accepting_input = false;
      } else {}
      console.log("jsut hit. " + player_soft)
      updateBetBoxWithTotal()
      break;
    case "stand/doublebet":
      updateBetBoxWithTotal()
      // Simply exit. The player is finished making decisions
      accepting_input = false;
      break;
    case "split/minimumbet":
      player_split = true;

      // ugh this is a fucking pain to make

      // Make sure they're not betting with imaginary money ($500i ??!)
      if (bank.innerHTML < bets.player) {
        console.log("You don't have enough money to split your hand.")
        break;
      }

      // First of all, split into two bets.
      bets.player = [bets.player, bets.player];

      // Then, split their hand into two hands. 
      /*
      Expected current(after next line) anatomy of players_cards:
      {
        "dealer": [ Card, Card ...],
        "bot2": [ Card, Card ...],
        "bot1": [Card, Card ...],
        "player": 
          [
            [ Card ],
            [ Card ]
          ]
      }
      */
      players_cards.player = [[players_cards.player[0]], [players_cards.player[1]]];
      players_totals.player = [players_cards.player[0][0].getValue(), players_cards.player[1][0].getValue()];

      /*
      player_split_decisions boolean array exists solely for the purpose of knowing whether to continue showing the dialog for 1 hand or continueing to the next.
      In C, this could have been done with pointers. yet another bulletpoint in the manifest of C superiority
      */
      player_split_decisions = [false, false]
     console.log("waiting for split hand 1")
      while (!player_split_decisions[0]) { // While its false, show the dialog with the correct hand array and hand #
        console.log("About to show split option")
        await showSplitOptions(players_cards.player[0], 0);
        console.log("checking total: " + players_totals.player[0])
         if (players_totals.player[0] >= 21) {
          break; // Make sure to not keep showing the dialog if they busted
         }
      }

      console.log("waiting for split hand 2")
      while (!player_split_decisions[1]) { // While its false, show the dialog with the correct hand array and hand #
        await showSplitOptions(players_cards.player[1], 1);
        if (players_totals.player[1] >= 21) {
          console.log("player 1 total 1: " +players_totals[1])
          break; // Make sure to not keep showing the dialog if they busted
         }
      }
      // Done. We exit. This will allow the game loop to continue
      updateBetBoxWithTotal()
      accepting_input = false;
      break;
    case "double/start":
      // Make sure they're not betting with imaginary money ($500i ??! (its just as funny the second time dont worry about it))
      if (bank.innerHTML < bets.player) {
        console.log("You don't have enough money to double your bet.")
        break;
      }

      // So theyre unfathomably wealthy (they have enough money to double their bet.)
      bets.player *= 2;

      const new_card0 = new Card("pick", true, "player"); //  new_card was taken i guess
      new_card0.draw();
      players_totals.player += new_card0.getValue() // TODO: just add the value to the total in the constructor.
      updateBetBoxWithTotal()
      accepting_input = false;
      break;

    default:
      break;
  }
}
async function showSplitOptions(cards, hand_number) {
  let sum = 0;
  for (let card of cards) {
    sum += card.getValue();
  }

  // Await the user's decision
  const result = await Swal.fire({
    title: "Split Options for Hand " + (hand_number + 1),
    text: "Decide whether to hit or stand on: " + players_totals.player[hand_number] + " vs " + players_cards.dealer[0].getValue(),
    showCancelButton: true,
    confirmButtonText: "Hit",
    cancelButtonText: "Stand",
  });

  console.log(result);

  if (result.isConfirmed) {
    const new_card = new Card("pick", true, "player", hand_number);
    new_card.draw();

    const value = new_card.getValue();
    players_totals.player[hand_number] += value;
    console.log("Card you got: " + value + "\nNew Total: " + players_totals.player[hand_number]);

    // Recursively call the function to keep showing the dialog if they want to hit
    // await showSplitOptions(players_cards.player[hand_number], hand_number);
  } else {
    player_split_decisions[hand_number] = true; // Mark as done
  }
}



function stage_2() {

  console.log("bot 1 decision")
  STATE = state_order[4]; // Bot 1 decision

  current_hand_sum = 0; // Reset from last use
  soft = false;

  for (let card of players_cards.bot1) {
    let value = card.getValue();
    current_hand_sum += value;
    if (value == 1) {
      soft = true;
    }
  }

  if (current_hand_sum + 10 == 21 && soft) {
    current_hand_sum = 21; // check soft hand. subtracting 1 (ace) and adding 11 (ace) is equivalent to adding 10.
  }
  console.log("bot1 dealer strats. starting totla:" + current_hand_sum)
  // More dealer strats.
  while (current_hand_sum < 17) {
    console.log("hand sum is " + current_hand_sum+". hitting")
    const new_card = new Card("pick", true, "bot1");
    new_card.draw();
    current_hand_sum += new_card.getValue();
  }
  console.log("ended wth a sum of" + current_hand_sum)
  players_totals.bot1 = current_hand_sum;


  STATE = state_order[5]; // dealer decision

  current_hand_sum = 0; // clearing, blah blah blah
  soft = false;
  for (let card of players_cards.dealer) {
    let value = card.getValue();
    current_hand_sum += value;
    if (value == 1) {
      soft = true;
    }
  }
  // Check blackjack again 
  if (current_hand_sum+10 == 21 && soft) {
    current_hand_sum = 21
  }

  // Dealer strats again
  // (btw, in bots, basic strategy implementation was too tedious for the deadline. I was going to do it, which explains the unused class.)
  if (current_hand_sum != 21) {
    while (current_hand_sum < 17) {
      const new_card = new Card("pick", true, "dealer");
      new_card.draw();
      current_hand_sum += new_card.getValue();
    }
  }

  players_totals.dealer = current_hand_sum;

  STATE = state_order[5]; // Reveal

  for (let card of players_cards.dealer) { // TODO: standardize this to dot notation. Actually, just standardize dot notation within this project. }
    card.up = true;
    card.draw();
  }

  STATE = state_order[6];
  let text, title;
 // alert(players_totals.player[0] + " " + players_totals.player[1] + " " + players_totals.dealer)
  function checkTotalAndUpdateBank(player_total, hand_number = null) {
    let dealer_total = players_totals.dealer;
    let bank = Number(localStorage.getItem("bank")) || 0; // Ensure bank is a number
    //alert(bank)
    let resultMessage = "";
    let bet = hand_number==null ? bets.player : bets.player[hand_number]
    if (player_total > 21) {
      // Player busts → Automatic loss
      bank -= bet
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: You busted (You lose)! (${player_total})`;
    } else if (dealer_total > 21) {
      // Dealer busts → Player wins
      bank += 2 * bet;
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: Dealer busted (You win) ! (${dealer_total})`;
    } else if (player_total === 21 && dealer_total !== 21) {
      // Player has blackjack and dealer does not
      bank += 2.5 * bet; // Blackjack typically pays 3:2
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: Blackjack (You win)!`;
    } else if (player_total === dealer_total) {
      // Push (tie)
      bank += bet; // Return the original bet
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: Push (${player_total} vs ${dealer_total})`;
    } else if (player_total > dealer_total) {
      // Player wins by having a higher total
      bank += 2 * bet;
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: You win! (${player_total} vs ${dealer_total})`;
    } else {
      // If none of the above conditions matched, player loses
      bank -= bet;
      resultMessage = `Hand ${hand_number !== null ? hand_number + 1 : ""}: You lose! (${player_total} vs ${dealer_total})`;
    }
    //alert(bank)
    localStorage.setItem("bank", bank);
    return resultMessage;
  }
  
  // Determine outcomes for each hand
  let outcomes = [];
  if (player_split) {
    players_totals.player.forEach((total, index) => {
      outcomes.push(checkTotalAndUpdateBank(total, index));
    });
  } else {
    outcomes.push(checkTotalAndUpdateBank(players_totals.player));
  }
  
  // Update UI labels
  updateBankLabel();
  updateDealerLabel(true);
  
  async function showOutcomes() {
    for (let outcome of outcomes) {
      await Swal.fire({
        title: outcome.includes("win") ? "Win" : outcome.includes("lose") ? "Loss" : "Push",
        text: outcome,
        showCancelButton: false,
        confirmButtonText: "Continue",
      });
    }
  
    // After all modals have been confirmed, reload the page
    history.replaceState('data to be passed', 'Title of the page', '/game');
    location.reload();
  }
  
  showOutcomes();
  



  return;



  //break;



  // players_totals.player += new_card.card.split("_")[0]


  // split first time
  // double up to twice



}




function stage_1() {


  STATE = state_order[1]; // dealing

  // deal cards to all at table, in order of constant dealing order array.
  // Use ternary operators to automatically not flip dealers second card.

 // const card1 = new Card("6_spade", true, "player");
 // const card2 = new Card("6_club", true, "player");
 // card1.draw();
 // card2.draw();

  for (let guy of dealing_order) {
    for (let i = 0; i < 2; i++) {
      console.log("making a new card. guy: " + guy + ", i: " + i +", so: " + ((guy === "dealer" && i == 1) ? false : true))
      const card = new Card("pick", (guy === "dealer" && i == 1) ? false : true, guy);
      card.draw();
    }
  }

  console.log("BOT2 IS PLAYING")

  // Variables which will be re-used for each bot
  let soft = false;
  let current_hand_sum = 0;


  STATE = state_order[2] // bot 2 decision

  // Get his sum
  for (let card of players_cards.bot2) {
    let value = card.getValue();
    current_hand_sum += value;
    if (value == 1) {
      soft = true;
    }
  }

  

  if (current_hand_sum + 10 == 21 && soft) {
    current_hand_sum = 21; // check soft hand. subtracting 1 (ace) and adding 11 (ace) is equivalent to adding 10.
  }

  // Dealer strats.
  while (current_hand_sum < 17) { // This does not fire if he has blackjack.
    const new_card = new Card("pick", true, "bot2");
    new_card.draw();
    current_hand_sum += new_card.getValue();
  }

  players_totals.bot2 = current_hand_sum;
  soft = false;
  console.log("bot 2 total: " + players_totals.bot2)


  players_totals.dealer = 0;
  // Render the dealers total, for user decision convenience
  for (let card of players_cards.dealer) {
    players_totals.dealer += card.getValue();
  }

  updateDealerLabel(false);



  STATE = state_order[3]; //player decision
  
  enableButtons();

  current_hand_sum = 0;
  player_soft = false;

  let arr = ["hit", "stand", "split", "double"];
  for (let i = 0; i < arr.length; i++) {
    buttons[i].innerHTML = arr[i];
  }
  // Open the floodgates. From here, all logic is handled by event listeners and subsequent condition handlers.
  accepting_input = true;

  for (let card of players_cards.player) {
    current_hand_sum += card.getValue();
    if (card.getValue() == 1) {
      player_soft = true;
    }
  }

  players_totals.player = current_hand_sum;

  updateBetBoxWithTotal()
  
  async function waitForExit() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        console.log(accepting_input)
        if (!accepting_input) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  (async () => {
    console.log("waitng for exit........")
    await waitForExit();
    console.log("accepting_input is now false. Continuing execution...");
    disableButtons();
    stage_2();
    return;
  })();
}


function main() {
  if (Number(localStorage.getItem("bank")) <= 0) {
    let money = prompt("You went bankrupt. How much money do you want")
    localStorage.setItem("bank", Number(money) == NaN ? 50 : Number(money))
   //  history.replaceState('data to be passed', 'Title of the page', '/');
    location.reload();
  }
  updateBetBox()
  document.getElementById("dealerText").value = "";
  disableButtons();
  
  deck = populate_deck();
  console.log("maining")

// Game Loop
  STATE = state_order[0] // BETTING
  console.log(STATE);// debug

  bets.bot1 = minimum_bet;
  bets.bot2 = minimum_bet;





  let arr = ["match previous bet", "double previous bet", "minimum bet", "start"];
  for (let i = 0; i < arr.length; i++) {
    buttons[i].innerHTML = arr[i];
  }
  enableButtons();
  accepting_input = true;
  
  async function waitForExit() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        console.log(accepting_input)
        if (!accepting_input) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  (async () => {
    console.log("waitng for exit (betting)........")
    await waitForExit();
    console.log("accepting_input is now false (betting). Continuing execution...");
    localStorage.setItem("bank", localStorage.getItem("bank") - bets.player);
    localStorage.setItem("lastBet", bets.player);
    updateBankLabel() 
    disableButtons();
    stage_1()
  })();

  
}







/*
  for (let i = 0; i < 3; i++) {
    current_card_value = players_cards.bot1[i-1].card.split("_")[0] ? players_cards.bot1[i-1].card.split("_")[0] : 0;
    if (current_card_value == prev_card_value) { pair = true; } 
    //////////////////// dictionary ( array ( Card Object . card  ))  ///////    Card Object . card = "number _ suite"
    card_total += current_card_value;
    console.log("card total: " + card_total)

    prev_card_value = current_card_value;
    if (current_card_value == 1) one_is_an_ace = true;
  }
    */