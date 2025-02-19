#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

int main() {
  int player_hand_pointer = 0;
  int dealer_hand_pointer = 0;
  int player_total = 0;
  int dealer_total = 0;
  bool player_done_betting = false;
  bool player_done_playing = false;
  int bank = 0;

  typedef struct Card {
    int suit;
    int number;
    bool used;
  } Card;

  typedef struct Hand {
    char name[7];
    Card* list[10];
    int card_count;
  } Hand;


  struct Card* deck[52];

  int card = 0;
  for (int i = 1; i < 5; i++) {
    for (int j = 1; j < 14; j++) {
      deck[card] = malloc(sizeof(Card));
      deck[card]->used = false;
      deck[card]->suit = i;
      deck[card]->number = j;
      card++;
    }
  }
  

  Hand player_hand;
  strcpy(player_hand.name, "player");
  player_hand.card_count = 0;


  Hand dealer_hand;
  strcpy(dealer_hand.name, "dealer");
  dealer_hand.card_count = 0;
  


  FILE* bank_fp;
  if ((bank_fp = fopen("bank.txt", "r")) == NULL) {
    perror("Failed to open bank.");
    exit(EXIT_FAILURE);
  }
  fscanf(bank_fp, "%d", &bank);
  printf("%d\n", bank);



  printf("Enter a bet: ");
  
  // Setting cards in hands

  srand(time(NULL));   // Initialization, should only be called once.

  int r;
  for (int i=1; i<5; i++) {
    // Start with a random number
    r = rand() % 53;
    // Get a new one until it is not "used"
    while ((*deck[r]).used == true)  {
      r = rand() % 53;
    }
    printf("Found r. \n");

    // Set it to "used"
    deck[r]->used = true;

    if ((i == 1) || (i == 2)) {
        player_hand.list[player_hand_pointer] = deck[r];
        player_hand_pointer++;
        player_hand.card_count++;
    } else {
        dealer_hand.list[dealer_hand_pointer] = deck[r]; 
        dealer_hand_pointer++;
        dealer_hand.card_count++;
    }
  }
  printf("done dealing\n");
  for (int i = 0; i < player_hand.card_count; i++) {
      printf("Player card %d: Suit %d, Number %d\n", i+1, player_hand.list[i]->suit, player_hand.list[i]->number);
  }

  for (int i = 0; i < dealer_hand.card_count; i++) {
      printf("Dealer card %d: Suit %d, Number %d\n", i+1, dealer_hand.list[i]->suit, dealer_hand.list[i]->number);
  }



  printf("Your total: ");
  return 6;
 }

