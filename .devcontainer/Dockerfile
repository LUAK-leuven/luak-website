FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye
COPY ./supabase_1.178.2_linux_amd64.deb .
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install git && sudo dpkg -i ./supabase_1.178.2_linux_amd64.deb