#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <sys/socket.h>

#define PORT 8080
#define BUFFER_SIZE 1024

// Function to handle client connection
void handle_client(int client_sock) {
    char buffer[BUFFER_SIZE];
    ssize_t bytes_received;

    // Send a greeting message to the client
    const char *welcome_message = "Hello from the server!\n";
    send(client_sock, welcome_message, strlen(welcome_message), 0);

    // Receive data from the client
    while ((bytes_received = recv(client_sock, buffer, BUFFER_SIZE - 1, 0)) > 0) {
        buffer[bytes_received] = '\0';  // Null-terminate the string
        printf("Received from client: %s\n", buffer);

        // Echo the message back to the client
        send(client_sock, buffer, bytes_received, 0);
    }

    if (bytes_received == 0) {
        printf("Client disconnected.\n");
    } else if (bytes_received < 0) {
        perror("recv failed");
    }

    // Close the client socket
    close(client_sock);
}

int main() {
    int server_sock, client_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);

    // Create socket
    if ((server_sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    // Prepare server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;  // Listen on any available interface
    server_addr.sin_port = htons(PORT);

    // Bind the socket to the address and port
    if (bind(server_sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    // Listen for incoming connections
    if (listen(server_sock, 3) < 0) {
        perror("Listen failed");
        close(server_sock);
        exit(EXIT_FAILURE);
    }

    printf("Server listening on port %d...\n", PORT);

    // Accept incoming connections in an infinite loop
    while ((client_sock = accept(server_sock, (struct sockaddr*)&client_addr, &client_len)) >= 0) {
        printf("New client connected: %s:%d\n", inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

        // Handle the client connection
        handle_client(client_sock);
    }

    if (client_sock < 0) {
        perror("Accept failed");
    }

    // Close the server socket
    close(server_sock);
    return 0;
}
