all: vulnerable-service

vulnerable-service: vulnerable-service.c
    gcc -o vulnerable-service vulnerable-service.c -fno-stack-protector -z execstack
    chmod u+s vulnerable-service

clean:
    rm -f vulnerable-service