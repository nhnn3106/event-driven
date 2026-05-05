FROM postgres:16-alpine

# Copy all scripts from init folder to the docker-entrypoint-initdb.d directory
# These scripts are executed only if the data directory is empty
COPY ./init/init-db.sql /docker-entrypoint-initdb.d/
