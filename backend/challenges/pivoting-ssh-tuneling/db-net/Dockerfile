

FROM mysql:latest


# Configuration additionnelle pour MySQL
COPY ./init.sql /docker-entrypoint-initdb.d/


ENV MYSQL_ROOT_PASSWORD=my-secret-pw
EXPOSE 3306
