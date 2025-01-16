
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const spriteSheet = new Image();
let cardCount = 0;
spriteSheet.src = 'images/cards.png';
const suits = ["spade", "heart", "club", "diamond"];
let players_cards = {"dealer": [], "bot1": [], "player": [], "bot2": []};
const card_order = {"spade": 1, "heart": 2, "club": 3, "diamond": 3}
const CARD_WIDTH = 160;
const CARD_HEIGHT = 225;
const SCALED_CARD_WIDTH = (CARD_WIDTH * canvas.width)/1350
const SCALED_CARD_HEIGHT = (225*canvas.height)/2540
const BETWEEN_CARDS = 32;
let deck;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;


class Card {
  
  constructor(card="pick", up, owner) {
    // Defined later
    this.spriteSheet_x;
    this.spriteSheet_y;
    // Defined when drawing
    this.x;
    this.y;
  
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
    try {
      let card_data = this.card.split("_");
      let card_suit = card_data[1];
      let card_value = card_data[0];
      this.spriteSheet_x = BETWEEN_CARDS + BETWEEN_CARDS*(card_value-1) + CARD_WIDTH * (card_value-1);
      this.spriteSheet_y = card_order[card_suit]*BETWEEN_CARDS + (card_order[card_suit] - 1) * CARD_HEIGHT;
    } catch (e) {
      return;
    }
    if (this.up) this.draw();

    // Add it to the players cards;
    players_cards[this.owner].push(this);
  }

  info() {
    // Cards are undecided until they are flipped, so that people can't cheat in the console
    console.log(`${!up ? "undecided card" : card} at ${this.x}, ${this.y}`);
  }

  flip() {
    if (this.up) {
      window.location.href = "https://stackoverflow.com";
      return;
    }
    this.card = pickCard(deck);

    this.up = true;

    this.draw();
  }

  draw() {
    let canvasX;
    let canvasY;

    switch (this.owner) {
      case "dealer":
        // Try getting the previous card. If it errors, there is no previous card. In that case, give it a default value
        try {
          canvasX = players_cards["dealer"][players_cards["dealer"].length - 1].x - 32;
          if (players_cards["dealer"][players_cards["dealer"].length - 1].id == this.id) throw new Error("the previous card is the current card, throwing to exit the try block and draw the default first card");
        } catch (e) {
          canvasX = 0.5 * canvasWidth;
        }
        
        canvasY = 0.2 * canvasHeight
        break;
      case "bot1":
        try {
          canvasX = players_cards["bot1"][players_cards["bot1"].length - 1].x + 32;
          if (players_cards["bot1"][players_cards["bot1"].length - 1].id == this.id) throw new Error("the previous card is the current card, throwing to exit the try block and draw the default first card");

        } catch (e) {
          canvasX = 0.2 * canvasWidth;
        }
        canvasY = canvasHeight - 0.4 * canvasHeight;
        break;
      case "player":
        try {
          canvasX = players_cards["player"][players_cards["player"].length - 1].x + 32;
          if (players_cards["player"][players_cards["player"].length - 1].id == this.id) throw new Error("the previous card is the current card, throwing to exit the try block and draw the default first card");
        } catch (e) {
          canvasX = 0.5 * canvasHeight
        }
        canvasY = canvasHeight - 0.2 * canvasHeight;
        break;
      case "bot2":
        try {
          canvasX = players_cards["bot2"][players_cards["bot2"].length - 1].x - 32;
          if (players_cards["bot2"][players_cards["bot2"].length - 1].id == this.id) throw new Error("the previous card is the current card, throwing to exit the try block and draw the default first card");
        } catch (e) {
          canvasX = canvasWidth - 0.2 * canvasWidth;
        }
        canvasY = canvasHeight - 0.4 * canvasHeight;
        break;
      default:
        return;
    }
    this.x = canvasX;
    this.y = canvasY;
    ctx.drawImage(
      spriteSheet,  // The sprite sheet image
      this.spriteSheet_x, this.spriteSheet_y, // The coordinates of the top-left corner of the card in the sprite sheet
      CARD_WIDTH, CARD_HEIGHT, // The size of the card in the sprite sheet
      canvasX, canvasY, // The position of the card's top-left corner on the canvas
      SCALED_CARD_HEIGHT, SCALED_CARD_WIDTH // The size of the card on the canvas (it can be the same size as in the sprite sheet)
    );
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
  let card = deck[Math.floor(Math.random() * deck.length())];
  const index = deck.indexOf(card)
  if (index > -1) {
    deck.splice(index, 1);
  }
  return card;
}



