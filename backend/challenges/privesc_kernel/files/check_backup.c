#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

void check_backup(const char* path) {
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "/usr/bin/ls -l %s", path);
    system(cmd);
}

int main(int argc, char *argv[]) {
    if(argc != 2) {
        printf("Usage: %s <backup_path>\n", argv[0]);
        return 1;
    }
    
    if(setuid(0) != 0) {
        perror("setuid");
        return 1;
    }

    check_backup(argv[1]);
    return 0;
}