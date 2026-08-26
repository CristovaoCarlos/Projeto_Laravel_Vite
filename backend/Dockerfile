FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Usuário com o mesmo UID/GID do seu usuário na WSL (crist), usado
# tanto pelo php-fpm quanto pelos comandos via "docker compose exec"
RUN groupadd -g 1000 appuser \
    && useradd -u 1000 -g appuser -m -s /bin/bash appuser \
    && chown -R appuser:appuser /var/www \
    && chmod -R 755 /var/www/storage /var/www/bootstrap/cache \
    && sed -i "s/user = www-data/user = appuser/" /usr/local/etc/php-fpm.d/www.conf \
    && sed -i "s/group = www-data/group = appuser/" /usr/local/etc/php-fpm.d/www.conf

EXPOSE 9000