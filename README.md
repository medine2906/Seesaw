# Seesaw

**Tilt the Internet.** A consumer dApp on Monad Testnet that turns content into a live seesaw game — vote with micro-payments, watch the balance shift in real-time.

> Built for the Monad Blitz Çanakkale hackathon.

---

## What It Does

1. A creator submits a tweet, YouTube link, image, or take
2. The content appears in a feed with an **animated seesaw visualization**
3. Viewers vote 👍 or 👎 — each vote costs **0.01 MON**
4. The seesaw tilts live based on vote ratio
5. After 5 minutes (demo) or 24 hours (prod), the pool settles:
   - **Positive wins** → creator gets 80%, positive voters split 20%
   - **Negative wins** → negative voters split 100%, creator keeps face

Creators never lose money (zero-risk posting). Supporters AND haters can earn. Self-sustaining opinion economy.

---

## Live Demo

🔗 [seesaw.vercel.app](https://seesaw.vercel.app) *(deploy in progress)*

📹 Demo video: *[placeholder]*

---

## Tech Stack

| Layer | Tool |
|---|---|
| Smart contract | Solidity 0.8.26, Hardhat |
| Chain | Monad Testnet (Chain ID: 10143) |
| Frontend | Next.js 14 (App Router) + TypeScript |
| Blockchain | wagmi v2 + viem |
| Auth/wallet | Privy.io (Google/email + embedded wallets) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Content embeds | react-tweet |

---

## Project Structure

```
Seesaw/
├── contracts/
│   ├── src/Seesaw.sol          # Core contract with voting + settlement logic
│   ├── test/Seesaw.test.ts     # 6 Hardhat tests
│   ├── script/Deploy.ts        # Deploy script → outputs address to frontend
│   └── hardhat.config.ts
└── frontend/
    ├── app/
    │   ├── page.tsx            # Feed (main page)
    │   ├── leaderboard/page.tsx
    │   └── submit/page.tsx
    ├── components/
    │   ├── Seesaw.tsx          # ★ SVG seesaw with Framer Motion spring physics
    │   ├── ContentCard.tsx     # Card with voting buttons + real-time updates
    │   ├── SubmitModal.tsx     # Content submission modal
    │   ├── Header.tsx
    │   ├── Leaderboard.tsx
    │   ├── ConnectButton.tsx
    │   └── Providers.tsx       # wagmi + Privy + React Query providers
    └── lib/
        ├── wagmi.ts            # Monad Testnet chain config
        ├── contracts.ts        # ABI + contract address
        └── utils.ts            # Helpers, content type detection
```

---

## How to Run

### Prerequisites
- Node.js 18+
- A Privy app ID from [dashboard.privy.io](https://dashboard.privy.io)
- A funded Monad Testnet wallet ([faucet](https://testnet.monad.xyz))

### Smart Contract

```bash
cd contracts
npm install

# Compile
node compile.js

# Deploy to Monad Testnet
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:monad
```

The deploy script outputs the contract address and updates `frontend/lib/contracts.ts` automatically.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_PRIVY_APP_ID and NEXT_PUBLIC_SEESAW_ADDRESS
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

Append `?demo=true` to the URL to enable demo mode:
- Shows a QR code overlay for live audience voting
- Voting period is displayed as 60 seconds (set `VOTING_PERIOD` in contract to 60 for live demo)

---

## Contract Details

**Monad Testnet** — Chain ID: `10143`

Contract: `Seesaw.sol`

Key parameters:
- `VOTE_AMOUNT` = 0.01 MON
- `VOTING_PERIOD` = 5 minutes (change to `24 hours` for production)

Settlement logic:
- `posPool > negPool` → creator 80% + positive voters split 20%
- `negPool >= posPool` → negative voters split 100%

Security: OpenZeppelin `ReentrancyGuard` on `settle()`, custom errors for gas efficiency.

---

## Why Monad

This only works on Monad. 1000 people voting simultaneously with <1 second finality and negligible fees makes the real-time seesaw UX possible. On Ethereum, a single vote costs more than the entire pool.

---

## Hackathon

Built at **Monad Blitz Çanakkale** — Consumer Applications track.
