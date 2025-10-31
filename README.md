<div align="center">
  <h1>AidLedger</h1>
  <p>Blockchain-powered humanitarian aid distribution with on-chain transparency (Solana + Helius)</p>
  <br/>
</div>

## Overview

AidLedger is a React + Node.js application that enables NGOs to issue and track humanitarian aid with verifiable, tamper-evident records on the Solana blockchain. It supports both an NGO Admin portal and a Refugee portal, with privacy-preserving ID hashing and direct Solana Explorer links for every transaction.

## Features

- Admin portal: issue aid, history, analytics
- Refugee portal: view and claim aid, history with explorer links
- Privacy: UNHCR IDs hashed with SHA-256
- Blockchain: Solana devnet/mainnet via Helius RPC, real-time network stats
- UX: toasts, loading states, responsive design

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express
- Blockchain: @solana/web3.js, Helius RPC

Monorepo Structure

```
aidledger/
├── backend/          # Express API + Solana integration
├── frontend/         # React app (Vite)
└── src/              # Legacy UI (re-exported)
```

## Quick Start

1) Backend env
```
cp backend/.env backend/.env.example  # if you have one
```
Create or edit `backend/.env` with:
```
HELIUS_API_KEY=your-helius-api-key   # optional but recommended
HELIUS_NETWORK=devnet
PORT=8080
```

2) Install & run
```
# Terminal 1
cd backend
npm install
npm run dev    # http://localhost:8080

# Terminal 2
cd frontend
npm install
npm run dev    # http://127.0.0.1:5173
```

The frontend proxies `/api` calls to the backend.

## Helius Setup (Recommended)

1. Sign up at https://www.helius.dev/ (generous free tier)
2. Put your key in `backend/.env` as `HELIUS_API_KEY`
3. Keep `HELIUS_NETWORK=devnet` for testing, switch to `mainnet` for production

## Usage

- Open the app at `http://127.0.0.1:5173`
- NGO Admin Portal → login with password `admin`
- Issue aid (NGO, type, notes). Refugee can then see and claim it
- Each action is recorded on-chain with a Solana Explorer link

## Troubleshooting

- Airdrop 429 on devnet: Use the faucet at https://faucet.solana.com or try later
- No Helius key: App falls back to public RPC (rate-limited)
- Port conflicts: change `PORT` in `backend/.env` or run frontend with `--port 5174`

## Scripts

```
# Frontend (from ./frontend)
npm run dev
npm run build
npm run preview

# Backend (from ./backend)
npm run dev
npm start
```

## Contributing

PRs welcome. Please avoid committing large artifacts (dist, deployment zips, backups). The repo `.gitignore` excludes these.

## License

Proprietary – All rights reserved

# Aidledger

<img width="1680" height="959" alt="Screenshot 2025-10-31 at 4 15 28 AM" src="https://github.com/user-attachments/assets/0886c43e-e7ef-4930-8050-90b49204a255" />


<img width="1680" height="959" alt="Screenshot 2025-10-31 at 4 17 07 AM" src="https://github.com/user-attachments/assets/a22142e9-8a7b-4012-ab2b-3f0b2ab53001" />




