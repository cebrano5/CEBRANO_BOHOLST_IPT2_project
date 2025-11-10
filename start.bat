@echo off
echo Starting MySQL and Laravel services...

REM Start MySQL
echo Starting MySQL...
cd "C:\xampp\mysql\bin"
start /B mysqld --standalone

REM Wait for MySQL to start
timeout /t 5

REM Start Laravel
echo Starting Laravel...
cd "C:\Users\User\Downloads\very_final\CEBRANO_BOHOLST_IPT2"
php artisan serve