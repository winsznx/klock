# PULSE - Social Ritual dApp

PULSE is a decentralized application (dApp) that gamifies daily on-chain interactions through a quest-based system. Users complete daily rituals, maintain streaks, earn points, and level up their profiles. The application supports multiple blockchain networks including Base (Ethereum L2) and Stacks (Bitcoin L2).

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Smart Contracts](#smart-contracts)
5. [Contract Addresses](#contract-addresses)
6. [Quest System](#quest-system)
7. [Streak and Points System](#streak-and-points-system)
8. [Getting Started](#getting-started)
9. [Development](#development)
10. [Deployment](#deployment)
11. [Security](#security)
12. [License](#license)

---

## Overview

PULSE introduces the concept of "social rituals" to blockchain - regular, gamified interactions that build habits and community engagement. The application tracks user activity across multiple chains, rewarding consistent participation with points, streak bonuses, and level progression.

### Supported Networks

| Chain | Network | Status |
|-------|---------|--------|
| Base | Mainnet | Deployed |
| Base | Sepolia (Testnet) | Deployed |
| Stacks | Mainnet | Deployed |
| Stacks | Testnet | Deployed |

---

## Features

### Core Features

- **Daily Check-In System**: Users check in daily to maintain their streak
- **Quest-Based Interactions**: 10 unique quest types with varying point rewards
- **Streak Tracking**: Consecutive daily participation is tracked and rewarded
- **Point Multipliers**: Longer streaks yield higher point multipliers (1x, 2x, 3x)
- **Level Progression**: Points accumulate toward level advancement
- **Combo Bonuses**: Complete specific quests within a time window for bonus rewards
- **Multi-Chain Support**: Automatically uses the correct contract based on connected network

### Wallet Support

- EVM Wallets (MetaMask, Coinbase Wallet, Rainbow, etc.)
- Bitcoin Wallets (Leather, Xverse)
- WalletConnect compatible wallets

---

## Architecture

```
klock/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx            # Landing page
│   │   └── dashboard/          # Protected dashboard route
│   │       └── page.tsx
│   ├── components/             # React components
│   │   ├── ConnectButton.tsx   # Wallet connection UI
│   │   ├── QuestDashboard.tsx  # Quest interface
│   │   ├── EngagementCard.tsx  # Individual quest cards
│   │   └── ...
│   ├── config/
│   │   ├── index.tsx           # Wagmi and chain configuration
│   │   └── contracts.ts        # Contract addresses and ABI
│   ├── context/
│   │   ├── index.tsx           # Providers (Wagmi, AppKit)
│   │   └── AuthContext.tsx     # Authentication state
│   └── hooks/
│       └── usePulseContract.ts # Contract interaction hook
│
├── packages/
│   └── pulse-sdk/              # Publishable TypeScript SDK for Base + Stacks integration
│
├── contracts/
│   ├── clarity/                # Stacks smart contracts
│   │   ├── pulse.clar          # Main Clarity contract
│   │   ├── Clarinet.toml       # Clarinet configuration
│   │   └── settings/           # Network-specific settings
│   │
│   └── solidity/               # Ethereum smart contracts
│       ├── src/
│       │   └── Pulse.sol       # Main Solidity contract
│       ├── scripts/
│       │   └── deploy.js       # Deployment script
│       └── hardhat.config.js   # Hardhat configuration
│
└── public/                     # Static assets
```

---

## SDK Package

This repository now includes a publishable SDK in `packages/pulse-sdk`.

### What the SDK exposes

- PULSE contract addresses and ABI
- Quest IDs and points constants
- Base network helpers and read clients
- Stacks read-only helpers and quest bitmap utilities

### Install

```bash
npm install @pulseprotocol/sdk
```

### Example

```ts
import { readBaseUserProfile, readStacksUserProfile } from '@pulseprotocol/sdk'

const baseProfile = await readBaseUserProfile('0xYourAddress', {
  network: 'mainnet',
})

const stacksProfile = await readStacksUserProfile('SPYourAddress', {
  network: 'mainnet',
})
```

### Publishing

```bash
# Build the SDK
npm run build:sdk

# Publish the package from the workspace
npm publish --workspace @pulseprotocol/sdk
```

---

## Smart Contracts

### Solidity Contract (Base/Ethereum)

The Solidity contract is deployed on Base (Ethereum L2) and implements:

- ReentrancyGuard for protection against reentrancy attacks
- Pausable functionality for emergency stops
- Ownable access control for admin functions
- Gas-optimized bitmap storage for quest tracking

**Technology Stack:**
- Solidity 0.8.20
- OpenZeppelin Contracts 5.0
- Hardhat for development and deployment

### Clarity Contract (Stacks)

The Clarity contract is deployed on Stacks and uses Clarity version 4 with epoch 3.3:

- No loops by design (prevents DoS attacks)
- Principal-based access control
- Block-height based time tracking
- Atomic transaction guarantees

**Technology Stack:**
- Clarity 4
- Clarinet 3.12.0 for development
- Stacks epoch 3.3

---

## Contract Addresses

### Base (Ethereum L2)

| Network | Contract Address | Explorer |
|---------|------------------|----------|
| Mainnet | `0xcF0A164b64b92Fa6262e312cDB60a12c302e8F1c` | [View on Basescan](https://basescan.org/address/0xcF0A164b64b92Fa6262e312cDB60a12c302e8F1c) |
| Sepolia | `0x22E7AA46aDDF743c99322212852dB2FA17b404b2` | [View on Basescan](https://sepolia.basescan.org/address/0x22E7AA46aDDF743c99322212852dB2FA17b404b2) |

### Stacks

| Network | Contract Identifier | Explorer |
|---------|---------------------|----------|
| Mainnet | `SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.pulse` | [View on Explorer](https://explorer.hiro.so/txid/SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.pulse?chain=mainnet) |
| Testnet | `ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.pulse` | [View on Explorer](https://explorer.hiro.so/txid/ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.pulse?chain=testnet) |

---

## Quest System

PULSE features 10 unique daily quests, each with different point values:

| ID | Quest Name | Points | Description |
|----|------------|--------|-------------|
| 1 | Daily Check-In | 50 | Secure your streak and get Pulse Points |
| 2 | Relay Signal | 100 | Pass the torch to another timezone |
| 3 | Update Atmosphere | 30 | Sync local weather to chain |
| 4 | Nudge Friend | 40 | Ping a friend to save their streak |
| 5 | Mint Hour Badge | 60 | Collect unique hour stamps |
| 6 | Commit Message | 20 | Etch your mood on the ticker |
| 7 | Stake for Streak | 200 | High risk, high reward (future feature) |
| 8 | Claim Milestone | 500 | Evolve your profile level |
| 9 | Predict Pulse | 80 | Vote on tomorrow's activity |
| 10 | Open Capsule | 1000 | Reveal long-term rewards |

### Daily Combo

Complete quests 1 (Daily Check-In), 3 (Update Atmosphere), and 6 (Commit Message) within 5 hours to activate the Daily Triple Combo for 200 bonus points.

---

## Streak and Points System

### Streak Mechanics

- Streaks increment with consecutive daily check-ins
- A 2-day grace period prevents accidental streak loss
- Streaks reset to 1 if the grace period is exceeded

### Point Multipliers

| Streak Length | Multiplier |
|---------------|------------|
| Days 1-7 | 1x |
| Days 8-30 | 2x |
| Days 31+ | 3x |

### Level Progression

Levels are calculated based on total accumulated points:
- Level = (Total Points / 1000) + 1

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A Web3 wallet (MetaMask, Coinbase Wallet, Leather, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/klock.git
   cd klock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables:
   ```
   NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

---

## Development

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Smart Contract Development

#### Solidity (Base)

```bash
cd contracts/solidity

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network base
```

#### Clarity (Stacks)

```bash
cd contracts/clarity

# Check contract syntax
clarinet check

# Run in console
clarinet console

# Deploy to testnet
clarinet deployments generate --testnet --low-cost
clarinet deployments apply --testnet

# Deploy to mainnet
clarinet deployments generate --mainnet --low-cost
clarinet deployments apply --mainnet
```

---

## Deployment

### Frontend Deployment

The frontend is configured for deployment on Vercel:

```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Contract Deployment

See the Development section for contract deployment commands. Ensure you have:

1. Sufficient native tokens for gas fees
2. Private keys or mnemonics configured in environment
3. RPC endpoints configured for target networks

---

## Security

### Smart Contract Security Measures

**Solidity Contract:**
- OpenZeppelin ReentrancyGuard prevents reentrancy attacks
- Pausable contract allows emergency stops
- Access control restricts admin functions
- No unbounded loops or arrays
- Input validation on all public functions
- Solidity 0.8+ built-in overflow protection

**Clarity Contract:**
- No loops by design (language constraint)
- Principal-based authentication
- Block-height for immutable time tracking
- No external calls that could re-enter
- Static analysis prevents recursive patterns

### Frontend Security

- No private keys stored in frontend
- Wallet connection via secure WalletConnect protocol
- Environment variables for sensitive configuration
- Protected routes require authentication

### Best Practices

- Never commit private keys or seed phrases
- Use separate wallets for testnet and mainnet
- Verify contract addresses before interacting
- Review transaction details before signing

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_PROJECT_ID | Reown (WalletConnect) Project ID | Yes |
| PRIVATE_KEY | Deployer private key (for contracts) | For deployment |
| BASESCAN_API_KEY | Basescan API key for verification | Optional |

---

## API Reference

### Frontend Hooks

#### usePulseContract

```typescript
const {
  userProfile,        // User's profile data
  globalStats,        // Global contract statistics
  completedQuests,    // Array of completed quest IDs today
  isLoading,          // Loading state
  error,              // Error message if any
  contractInfo,       // Current contract info
  
  // Quest functions
  dailyCheckin,
  relaySignal,
  updateAtmosphere,
  nudgeFriend,
  commitMessage,
  predictPulse,
  claimDailyCombo,
  
  // Utilities
  refreshData,
  isQuestCompleted,
  checkComboAvailable,
} = usePulseContract()
```

### Contract Functions

See `packages/pulse-sdk/src/constants.ts` for the complete ABI and function signatures.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contributing

Contributions are welcome. Please read the contributing guidelines before submitting pull requests.

## Support

For support, please open an issue on the GitHub repository or contact the development team.
