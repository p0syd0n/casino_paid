#include <stdio.h>

int main() {
  typedef struct Card {
    int suit;
    int number;
  } Card;


  struct Card deck[52];
  int card = 0;
  for (int i = 1; i < 5; i++) {
    for (int j = 1; j < 14; j++) {
      Card new_card;
      new_card.suit = i;
      new_card.number = j;
      deck[card] = new_card;
      card ++;
    }
  }

  for (int g = 0; g < 52; g++) {
    printf("%d %d\n", deck[g].suit, deck[g].number);
  }
  //printf("%d\n", *deck->length);
  return 6;


 }

