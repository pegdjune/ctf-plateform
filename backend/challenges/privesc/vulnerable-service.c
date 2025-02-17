// vulnerable-service.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

// Service vulnérable avec SUID bit
int main(int argc, char *argv[]) {
    char buffer[64];
    int admin_rights = 0;

    // Copie non sécurisée qui permet un buffer overflow
    printf("Enter your username: ");
    gets(buffer);

    if(admin_rights) {
        printf("Access granted!\n");
        setuid(0);
        system("/bin/sh");
    } else {
        printf("Access denied.\n");
    }

    return 0;
}
