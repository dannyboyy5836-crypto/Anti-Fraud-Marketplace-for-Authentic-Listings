# Anti-Fraud Marketplace for Authentic Listings

This Web3 project leverages the Stacks blockchain and Clarity smart contracts to create a decentralized marketplace with a robust anti-fraud system. It addresses the real-world problem of fraudulent listings in online marketplaces by ensuring authenticity, transparency, and trust through blockchain-based verification, reputation systems, and dispute resolution.

## ✨ Features

🔍 **Listing Verification**: Sellers must verify their identity and listing authenticity via cryptographic proofs.  
✅ **Immutable Provenance**: Track the origin and history of listed items on-chain.  
🌟 **Reputation System**: Sellers and buyers earn reputation scores based on transaction history.  
⚖️ **Dispute Resolution**: Decentralized arbitration for resolving disputes over fraudulent listings.  
🛡️ **Fraud Detection**: Smart contracts flag suspicious listings based on predefined rules.  
📜 **Transparent Records**: All transactions and verifications are publicly auditable on the blockchain.  
💸 **Escrow Payments**: Funds are held in escrow until both parties confirm transaction satisfaction.  
🔐 **Decentralized Identity**: Users maintain privacy while proving authenticity via DIDs.

## 🛠 How It Works

**For Sellers**  
- Register a decentralized identity (DID) to establish authenticity.  
- Submit a listing with item details, a hash of supporting documents (e.g., certificates, photos), and a deposit.  
- The listing is validated by the fraud detection contract before being published.  
- Funds are held in escrow until the buyer confirms receipt and authenticity.  

**For Buyers**  
- Browse verified listings with transparent seller reputation scores.  
- Purchase items by sending funds to the escrow contract.  
- Confirm item receipt or initiate a dispute if the item is fraudulent.  

**For Arbitrators**  
- Resolve disputes by reviewing evidence submitted on-chain.  
- Issue rulings that release or refund escrow funds.  

**Fraud Detection**  
- The system flags listings with inconsistencies (e.g., duplicate item hashes, low seller reputation).  
- Suspicious listings are paused until verified by arbitrators or additional proof is provided.

## 📂 Smart Contracts (8 Total)

1. **IdentityRegistry.clar**  
   Registers and manages decentralized identities (DIDs) for users to ensure authenticity.  

2. **ListingRegistry.clar**  
   Stores listing details (item hash, description, price, seller DID) and tracks listing status.  

3. **FraudDetection.clar**  
   Analyzes listings for potential fraud based on rules (e.g., duplicate hashes, reputation thresholds).  

4. **ReputationSystem.clar**  
   Tracks and updates reputation scores for buyers and sellers based on transaction outcomes.  

5. **EscrowContract.clar**  
   Manages secure escrow payments, releasing funds only upon transaction confirmation.  

6. **DisputeResolution.clar**  
   Handles dispute creation, evidence submission, and arbitrator rulings.  

7. **ArbitratorRegistry.clar**  
   Manages a pool of trusted arbitrators elected by the community.  

8. **MarketplaceCore.clar**  
   Coordinates interactions between contracts, ensuring seamless marketplace operations.

## 🚀 Getting Started

1. **Deploy Contracts**: Deploy all Clarity smart contracts on the Stacks blockchain.  
2. **Register Identity**: Sellers and buyers register their DIDs via `IdentityRegistry`.  
3. **Create Listings**: Sellers submit listings with item details and document hashes.  
4. **Fraud Check**: `FraudDetection` validates listings before they go live.  
5. **Transact**: Buyers purchase items, with funds held in `EscrowContract`.  
6. **Resolve Disputes**: If disputes arise, arbitrators review evidence and issue rulings via `DisputeResolution`.  
7. **Earn Reputation**: Successful transactions boost reputation scores in `ReputationSystem`.

## 🧑‍💻 Example Workflow

**Seller**:  
- Registers DID with `IdentityRegistry`.  
- Submits listing with item hash, description, and price to `ListingRegistry`.  
- `FraudDetection` verifies no duplicate hashes or suspicious patterns.  
- Listing is published if approved.  

**Buyer**:  
- Browses listings, checks seller reputation via `ReputationSystem`.  
- Purchases item, sending funds to `EscrowContract`.  
- Confirms receipt or disputes if item is fraudulent.  

**Arbitrator**:  
- Reviews disputes via `DisputeResolution`, checking on-chain evidence.  
- Issues ruling to release or refund escrow funds.  

## 🔐 Security Features

- **Immutable Hashes**: Item authenticity is verified via cryptographic hashes.  
- **Reputation-Based Trust**: Low-reputation sellers face stricter fraud checks.  
- **Decentralized Arbitration**: Community-elected arbitrators ensure fair dispute resolution.  
- **Escrow Protection**: Funds are only released when both parties are satisfied.  

## 🛠 Tech Stack

- **Blockchain**: Stacks (Bitcoin Layer-2).  
- **Smart Contract Language**: Clarity.  
- **Frontend (Optional)**: React with Stacks.js for user interaction.  
- **Storage**: Gaia (Stacks’ decentralized storage) for off-chain data like images.  

## 📜 License

MIT License - feel free to fork and build!
