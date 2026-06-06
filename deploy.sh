#!/bin/bash
git pull origin main
composer install --no-dev
php artisan optimize
rm -rf ../public_html/build
cp -r public/build ../public_html/build
