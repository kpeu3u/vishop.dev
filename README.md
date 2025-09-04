# ViShop - Vehicle Shopping Platform

A full-stack vehicle shopping platform built with React frontend and Symfony backend API.

## Project Structure
```
vishop.dev/ 
├── api/ # Symfony 7.3 Backend API 
│ ├── src/ 
│ ├── public/ 
│ ├── config/ 
│ └── ... 
├── frontend/ # React 19.1 Frontend 
│ ├── src/ 
│ ├── public/ 
│ └── ... 
└── README.md
```

## Technology Stack

### Backend (API)
- **Symfony 7.3.3** - PHP web framework
- **PHP 8.2+** - Programming language
- **Doctrine ORM 3.5** - Database ORM
- **SQLite** - Lightweight database engine
- **LexikJWTAuthenticationBundle** - JWT authentication
- **PHPUnit** - Testing framework
- **PHPStan** - Static analysis
- **CSFixer** - Code style fixer

### Frontend
- **React 19.1.1** - JavaScript library
- **MobX 6.13** - State management
- **React Router 7.8** - Client-side routing
- **React Hook Form 7.62** - Form handling
- **Zod 4.1** - Schema validation
- **Axios 1.11** - HTTP client
- **Testing Library** - Component testing

## Environment Setup

### Prerequisites

- **PHP 8.2+** with extensions: `pdo`, `pdo_sqlite`, `mbstring`, `xml`, `ctype`, `iconv`, `intl`, `dom`, `filter`, `gd`, `json`
- **Composer 2.x** - PHP dependency manager
- **Node.js 18+** and **npm** - JavaScript runtime and package manager
- **Apache 2.4+** with mod_rewrite enabled - Web server
- **SQLite 3.x** - Database (usually included with PHP)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/kpeu3u/vishop.dev.git vishop.dev
cd vishop.dev
```

# Install PHP dependencies
```bash
cd api
```
```bash
composer install
```

## Copy environment file
```bash
cp .env .env.local
```
## Configure database connection in .env.local
## DATABASE_URL="sqlite:///%kernel.project_dir%/data/database.sqlite"

# Generate JWT keys
```bash
php bin/console lexik:jwt:generate-keypair
```

# Install Node.js dependencies
```bash
cd frontend
```
```bash
npm install
```
```bash
npm run build
```

## Copy environment file
```bash
cp .env.example .env
```

# Option 1: Separate Subdomains

## Configure API URL in .env

#### `frontend/.env`:
### REACT_APP_API_URL=https://api.vishop.dev

#### `api/.env.local`:
### FRONTEND_URL=https://vishop.dev
### CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|^https?://vishop\.dev$'


### Symfony API Backend - api.vishop.dev
```
<VirtualHost *:80>
    ServerName api.vishop.dev
    DocumentRoot /path/to/vishop.dev/api/public

    <Directory /path/to/vishop.dev/api/public>
        AllowOverride All
        Require all granted

        RewriteEngine On
        
        # Pass all requests to Symfony (including OPTIONS)
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>

    # Logging
    ErrorLog /opt/homebrew/var/log/httpd/api.vishop.dev.error.log
    CustomLog /opt/homebrew/var/log/httpd/api.vishop.dev.access.log combined
</VirtualHost>

<VirtualHost *:443>
    DocumentRoot "/path/to/vishop.dev/api/public"
    ServerName api.vishop.dev
    SSLEngine on
    SSLCertificateFile "/opt/homebrew/etc/httpd/certs/api.vishop.dev.pem"
    SSLCertificateKeyFile "/opt/homebrew/etc/httpd/certs/api.vishop.dev-key.pem"

    <Directory /path/to/vishop.dev/api/public>
        AllowOverride All
        Require all granted

        RewriteEngine On
        
        # Pass all requests to Symfony (including OPTIONS) 
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>

    ErrorLog /opt/homebrew/var/log/httpd/api.vishop.dev.ssl.error.log
    CustomLog /opt/homebrew/var/log/httpd/api.vishop.dev.ssl.access.log combined
</VirtualHost>
```

# React Frontend - vishop.dev
```
<VirtualHost *:80>
    ServerName vishop.dev
    DocumentRoot /path/to/vishop.dev/frontend/build

    <Directory /path/to/vishop.dev/frontend/build>
        AllowOverride All
        Require all granted

        RewriteEngine On

        # Handle client-side routing - serve index.html for all non-file requests
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
        Header append Cache-Control "public"
    </LocationMatch>

    # Logging
    ErrorLog /opt/homebrew/var/log/httpd/vishop.dev.error.log
    CustomLog /opt/homebrew/var/log/httpd/vishop.dev.access.log combined
</VirtualHost>

<VirtualHost *:443>
    DocumentRoot "/path/to/vishop.dev/frontend/build"
    ServerName vishop.dev
    ServerAlias www.vishop.dev
    SSLEngine on
    SSLCertificateFile "/opt/homebrew/etc/httpd/certs/vishop.dev.pem"
    SSLCertificateKeyFile "/opt/homebrew/etc/httpd/certs/vishop.dev-key.pem"

    <Directory /path/to/vishop.dev/frontend/build>
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
        Header append Cache-Control "public"
    </LocationMatch>

    ErrorLog /opt/homebrew/var/log/httpd/vishop.dev.ssl.error.log
    CustomLog /opt/homebrew/var/log/httpd/vishop.dev.ssl.access.log combined
</VirtualHost>
```
## Access the application at `https://vishop.dev`

# Option 2: Single Domain with Path-based Routing

## Configure API URL in .env

#### `frontend/.env`:
### REACT_APP_API_URL=https://vishop.dev/api

#### `api/.env.local`:
### FRONTEND_URL=https://vishop.dev
### CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|^https?://vishop\.dev$'

```
<VirtualHost *:80>
ServerName vishop.dev
DocumentRoot /path/to/vishop.dev/frontend/build

    # API requests - proxy to Symfony
    Alias /api /path/to/vishop.dev/api/public
    
    <Directory /path/to/vishop.dev/api/public>
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>
    
    # Frontend - React build files
    <Directory /path/to/vishop.dev/frontend/build>
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
        Header append Cache-Control "public"
    </LocationMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/vishop_error.log
    CustomLog ${APACHE_LOG_DIR}/vishop_access.log combined
</VirtualHost>

<VirtualHost *:443>
    DocumentRoot "/path/to/vishop.dev/frontend/build"
    ServerName vishop.dev
    ServerAlias www.vishop.dev
    SSLEngine on
    SSLCertificateFile "/path/to/certs/vishop.dev.pem"
    SSLCertificateKeyFile "/path/to/certs/vishop.dev-key.pem"
</VirtualHost>
```

## Access the application at `https://vishop.dev`


# Option 3: Running in Development Mode

## Configure API URL in .env

#### `frontend/.env`:
### REACT_APP_API_URL=http://localhost:8000

#### `api/.env.local`:
### FRONTEND_URL=http://localhost:3000
### CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'

#### Backend (Symfony):
```bash
cd api
symfony server:start
```

#### Frontend (React):
```bash
cd frontend
npm start
```
## Access the application at `http://localhost:3000`