# Campus Quest

A gamified campus engagement platform built on the Stellar Testnet. Students connect a Stellar wallet, complete campus quests, earn Campus Tokens through a Soroban smart contract, and redeem them for real rewards in the Reward Store.

This project was built for the Rise In Stellar Journey to Mastery program — Level 4 (Production MVP).

## Live Demo

[https://campus-quest-six.vercel.app/](https://campus-quest-six.vercel.app/)

## Demo Video

[Watch the demo video](https://youtu.be/EaX0DR2F3lw)

## Features

- Multi-wallet connection (Freighter, Albedo, xBull, Rabet) via Stellar Wallets Kit
- Campus Token balance display, fetched live from the token contract
- Quest system: students complete quests and automatically receive Campus Tokens
- Reward Store: students redeem tokens for real rewards (e.g. free coffee)
- Admin panel: create and manage quests and rewards (visible only to the admin wallet)
- Mobile responsive layout with a hamburger navigation menu
- Loading and processing states on every wallet interaction
- Clear error handling for failed transactions and insufficient balances

## Tech Stack

- React (Vite)
- @creit.tech/stellar-wallets-kit (multi-wallet support)
- @stellar/stellar-sdk
- Soroban (Stellar smart contracts, written in Rust)
- Stellar Testnet / Horizon / Soroban RPC
- Vercel (deployment + analytics)

## Smart Contracts

Two Soroban smart contracts work together via inter-contract communication:

## Contract Deployment

### Campus Token Contract

Handles the Campus Token balance system:

- `initialize` — sets the contract admin
- `set_admin` — transfers admin rights (used to hand control to the Quest contract)
- `mint` — creates new tokens for a student (called by the Quest contract)
- `transfer` — moves tokens between addresses
- `burn` — removes tokens (used during reward redemption)
- `balance` — reads a student's token balance

**Deployed Contract ID (Testnet):**

```bash
CDVRNAS5WSTMEEBZC34UKCJZM4A4PF2A5SQTV4GS3U4D4UF7AYA2UFDM
```

### Quest & Reward Contract

```bash
CBRNJ3VUJQTLT2TUD6FX5ARPLGKPCV4V3IHXBKSVSBHVITRS7BEDNSNV
```

## Setup Instructions

### Frontend

```bash
git clone https://github.com/zuygur/campus-quest.git
cd campus-quest/campus-quest-frontend
npm install
npm run dev
```

Open the local address shown in the terminal (usually `http://localhost:5173`). Make sure a supported wallet extension is installed and set to **Testnet**.

### Smart Contracts (optional — already deployed)

```bash
cd campus-token-contract
stellar contract build
stellar contract deploy --wasm target/wasm32v1-none/release/hello_world.wasm --source <your-identity> --network testnet
```

Repeat for `quest-reward-contract`, then link the two contracts:

```bash
stellar contract invoke --id <token-contract-id> --source <your-identity> --network testnet -- initialize --admin <your-address>
stellar contract invoke --id <quest-contract-id> --source <your-identity> --network testnet -- initialize --admin <your-address> --token_contract <token-contract-id>
stellar contract invoke --id <token-contract-id> --source <your-identity> --network testnet -- set_admin --new_admin <quest-contract-id>
```

## Monitoring & Analytics

Vercel Analytics is integrated on the live deployment, tracking real visits and usage.

![Analytics dashboard](../screenshots/analytics.png)

## User Onboarding & Feedback

6 users tested the application by connecting their Stellar wallets and interacting with the smart contracts.

The application was evaluated through wallet connection, quest completion, token distribution, and reward redemption.

Feedback was collected through a Google Form asking users to rate their experience and share suggestions.

![Feedback summary 1](../screenshots/google-form-responses1.png)
![Feedback summary 2](../screenshots/google-form-responses2.png)

### Proof of Wallet Interactions

![User wallet interaction 1](../screenshots/user-wallet-1.jpeg)
![User wallet interaction 2](../screenshots/user-wallet-2.jpeg)
![User wallet interaction 3](../screenshots/user-wallet-3.jpeg)
![User wallet interaction 4](../screenshots/user-wallet-4.jpeg)
![User wallet interaction 5](../screenshots/user-wallet-5.jpeg)
![User wallet interaction 6](../screenshots/user-wallet-6.jpeg)

## Screenshots

### Product UI
![Homepage](../screenshots/user-homepage-1.jpeg)
![Reward Store](../screenshots/reward-store.png)
![Admin Panel](../screenshots/admin-panel.png)

### Mobile Responsive Design
![Mobile responsive](../screenshots/mobile-responsive.png)

## Project Structure

```bash
campus-quest/
├── campus-quest-frontend/
├── campus-token-contract/
├── quest-reward-contract/
└── screenshots/
```

## Notes

- This project uses Stellar Testnet.
- User wallets must be funded with [Friendbot](https://friendbot.stellar.org/) before interacting with the application.
- Smart contract transactions require network fees due to Soroban execution.

**Summary of feedback**

- Most users rated the wallet connection process as easy.
- The interface was considered simple and intuitive.
- The most common challenge was installing and configuring a Stellar wallet for Testnet.
- Users successfully completed quests and redeemed rewards after earning enough Campus Tokens.

## Future Improvements

- Add role-based permissions
- Support multiple reward categories
- Improve mobile experience
- Add quest expiration dates
- Display user achievement badges

## License

This project was developed as part of the Rise In Stellar Journey to Mastery – Level 4 program.
