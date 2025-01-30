#include <openssl/evp.h>
#include <stdio.h>        // For printf, standard input/output functions
#include <stdlib.h>       // For exit() function
#include <string.h>       // For memset(), strlen(), etc.
#include <unistd.h>       // For close() function
#include <arpa/inet.h>    // For socket functions (inet_addr, sockaddr_in, etc.)
#include <sys/types.h>    // For socket types (e.g., AF_INET)
#include <sys/socket.h>   // For socket functions (socket, bind, accept, etc.)
#include <openssl/ssl.h>  // For OpenSSL SSL functions
#include <openssl/err.h>  // For OpenSSL error handling


int main() {
  OPENSSL_init_ssl(0, NULL);  // Initialize OpenSSL SSL library
  OpenSSL_add_all_algorithms();
  SSL_load_error_strings();

  SSL_CTX *ctx;

  ctx = SSL_CTX_new(TLS_server_method());

  if (ctx == NULL) {
    perror("SLL ctx creation failed.");
    exit(EXIT_FAILURE);
  }

  if (SSL_CTX_use_certificate_file(ctx, "cert.pem", SSL_FILETYPE_PEM) <= 0) {
    perror("Certificate loading failed.");
    exit(EXIT_FAILURE);
  }

  if (SSL_CTX_use_PrivateKey_file(ctx, "key.pem", SSL_FILETYPE_PEM) <= 0) {
    perror("Private key loading failed.");
    exit(EXIT_FAILURE);
  }

  if (!SSL_CTX_check_private_key(ctx)) {
    perror("Certificate does not match private key!");
    exit(EXIT_FAILURE);
  }

  int server_socket;
  struct sockaddr_in server_address;

  server_socket = socket(AF_INET, SOCK_STREAM, 0);
  if (server_socket < 0) {
    perror("Server socket creation failed.");
    exit(EXIT_FAILURE);
  }

  memset(&server_address, 0, sizeof(server_address));
  server_address.sin_family = AF_INET;
  server_address.sin_addr.s_addr = INADDR_ANY;
  server_address.sin_port = htons(808);

}


