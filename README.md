# Duduitku

A personal finance management app built with Laravel 13, React 19, and Inertia.js v3. Track your income, expenses, budgets, and get AI-powered financial insights.

## Features

- **Dashboard** — Overview of your financial health
- **Accounts** — Manage multiple bank accounts/wallets
- **Transactions** — Record income & expenses with categories
- **Budgets** — Set monthly budgets per category
- **AI Chat** — Ask "Sekretaris Negara" about your finances (powered by Gemini)
- **Receipt Scanner** — AI-powered receipt scanning & auto-categorization
- **Insights** — AI-generated spending analysis & budget advice
- **Fiscal Months** — Close/open monthly periods
- **PWA** — Install as a standalone app on desktop/mobile
- **Auth** — Login, 2FA (TOTP), Passkeys (WebAuthn), email verification

## Tech Stack

| Layer    | Tech                                         |
| -------- | -------------------------------------------- |
| Backend  | Laravel 13, PHP 8.4                          |
| Frontend | React 19, TypeScript, Inertia v3             |
| Styling  | Tailwind CSS v4, shadcn/ui (new-york)        |
| Auth     | Laravel Fortify + Passkeys                   |
| AI       | Laravel AI SDK (Gemini)                      |
| Routes   | Laravel Wayfinder (typed route codegen)      |
| Database | SQLite (default), MySQL/PostgreSQL supported |
| Testing  | Pest 4, PHPStan level 7                      |

## Requirements

- PHP 8.3+
- Composer
- Node.js 22+
- npm

## Quick Start

```bash
# Clone the repo
git clone https://github.com/ricko-v/duduitku.git
cd duduitku

# One-command setup (installs deps, creates .env, migrates, builds frontend)
composer setup

# Start development server
composer dev
```

The app will be available at `http://localhost:8080` (or the URL shown in terminal).

### Manual Setup

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create SQLite database & migrate
touch database/database.sqlite
php artisan migrate

# Install Node dependencies & build
npm install
npm run build
```

## Environment Variables

Key variables in `.env`:

```env
APP_NAME=Duduitku
APP_URL=http://localhost

# Database (SQLite is default, no config needed)
DB_CONNECTION=sqlite

# AI features (required for chat, receipt scanning, insights)
GEMINI_API_KEY=your-gemini-api-key
```

## Development Commands

```bash
# Start dev server (Laravel + Vite + queue + logs)
composer dev

# Build for production
npm run build

# Lint & format
composer lint          # PHP (Pint)
npm run lint           # JS (ESLint)
npm run format         # JS (Prettier)

# Type checking
composer types:check   # PHPStan
npm run types:check    # TypeScript

# Tests
composer test          # Full test suite
php artisan test --compact --filter=TestName  # Single test

# Generate typed routes
php artisan wayfinder:generate
```

## Project Structure

```
app/
├── Ai/                 # AI agents & tools (Gemini integration)
├── Http/Controllers/   # Money controllers (accounts, transactions, etc.)
├── Models/             # Eloquent models
└── Actions/Fortify/    # Auth actions (registration, 2FA, passkeys)

resources/js/
├── pages/              # Inertia React pages
├── components/         # UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── routes/             # Wayfinder generated routes (do not edit)
└── actions/            # Wayfinder generated actions (do not edit)

database/
├── migrations/         # Database migrations
├── factories/          # Model factories
└── seeders/            # Database seeders
```

## Testing

Tests use in-memory SQLite. Run:

```bash
# Full suite
composer test

# Single test file
php artisan test --compact --filter=TransactionTest

# With filter
php artisan test --compact --filter=test_user_can_create_transaction
```

## License

MIT
