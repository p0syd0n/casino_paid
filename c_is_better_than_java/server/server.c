#include <openssl/evp.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <pthread.h>

void info(char data[100]) {
  printf("%s\n", data);
}


void handle_request(SSL *ssl) {
  char buffer[1024];
  int bytes_read;

  bytes_read = SSL_read(ssl, buffer, sizeof(buffer)-1);
  if (bytes_read <= 0) {
    perror("Unable to read from SSL connection");
    return;
  }

  buffer[bytes_read] = '\n';
  printf("Received request:\n%s\n", buffer);
  const char* response = "200: ok";
  SSL_write(ssl, response, strlen(response));
}

void *connection_handler(void *client_socket) {
  int sock = *(int *)client_socket;
  SSL_CTX *ctx = (SSL_CTX *)client_socket;
  SSL *ssl = SSL_new(ctx);
  SSL_set_fd(ssl, sock);

  if (SSL_accept(ssl) <= 0) {
    ERR_print_errors_fp(stderr);
  } else {
    handle_request(ssl);
  }

  SSL_shutdown(ssl);
  SSL_free(ssl);
  close(sock);
  return NULL;
}

int main() {
  OPENSSL_init_ssl(0, NULL);
  OpenSSL_add_all_algorithms();
  SSL_load_error_strings();

  SSL_CTX *ctx = SSL_CTX_new(TLS_server_method());
  if (ctx == NULL) {
    perror("SSL context creation failed.");
    exit(EXIT_FAILURE);
  }
  info("Made context");

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
  socklen_t len = sizeof(server_address);

  server_socket = socket(AF_INET, SOCK_STREAM, 0);
  if (server_socket < 0) {
    perror("Server socket creation failed.");
    exit(EXIT_FAILURE);
  }

  memset(&server_address, 0, sizeof(server_address));
  server_address.sin_family = AF_INET;
  server_address.sin_addr.s_addr = INADDR_ANY;
  server_address.sin_port = htons(8080);

  if (bind(server_socket, (struct sockaddr *)&server_address, sizeof(server_address)) < 0) {
    perror("Failed to bind socket.");
    exit(EXIT_FAILURE);
  }

  if (listen(server_socket, 5) < 0) {
    perror("Failed to listen for connections.");
    exit(EXIT_FAILURE);
  }

  while (1) {
    int client_socket = accept(server_socket, (struct sockaddr *)&server_address, &len);
    if (client_socket < 0) {
      perror("Unable to accept connection.");
      continue;
    }

    pthread_t thread_id;
    if (pthread_create(&thread_id, NULL, connection_handler, (void *)&client_socket) < 0) {
      perror("Could not create thread.");
      continue;
    }

    pthread_detach(thread_id);  // Detach the thread so it cleans up automatically
  }

  close(server_socket);
  SSL_CTX_free(ctx);
  EVP_cleanup();
  return 0;
}
