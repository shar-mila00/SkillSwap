# SkillSwap Pro - Local Installation

This project is configured to run in `C:\xampp\htdocs\SkillSwap`.

## 1. Prerequisites
*   **XAMPP**: Download and install from [Apache Friends](https://www.apachefriends.org/).
*   **Node.js**: Ensure you have npm installed.

## 2. Backend Setup
1.  Open XAMPP Control Panel.
2.  Start **Apache** and **MySQL**.
3.  Navigate to `http://localhost/phpmyadmin`.
4.  Create a new database called `skillswap_pro`.
5.  Import the contents of `database.sql` into this database using the "SQL" tab.
6.  Ensure `api.php` exists in `C:\xampp\htdocs\SkillSwap\api.php`.

## 3. Frontend Setup
1.  Open your terminal in `C:\xampp\htdocs\SkillSwap`.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start the Vite development server.

## 4. Usage
*   The app runs at `http://localhost:5173`.
*   It automatically communicates with the PHP API at `http://localhost/SkillSwap/api.php`.
*   **Login**: Use `alex@example.com` / `password123` or `admin@skillswap.com` / `admin`.

## Troubleshooting
*   **CORS Errors**: `api.php` includes headers to allow requests from `localhost:5173`.
*   **Database Error**: Double check that `db_name`, `user`, and `pass` in `api.php` match your local MySQL settings.
