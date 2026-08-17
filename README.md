# Frontend Web Application — Certificate Management Platform

A modern, responsive, and secure decentralized certificate issuance, verification, and management web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, and **Ethers.js v6**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing & Quality](#testing--quality)
- [Docker Deployment](#docker-deployment)

---

## Features

- **Decentralized Verification Portal:** Instant public verification of academic and professional credentials via Certificate ID, QR Code scan, or OCR certificate image scan.
- **Web3 Wallet Integration:** Seamless connection with MetaMask / Web3 wallets for cryptographic identity verification and on-chain signing.
- **Role-Based Portals:**
  - **Admin & Issuers:** Template customization, batch certificate generation from Excel/CSV, signing, and blockchain anchoring.
  - **Students / Recipients:** Personal credential wallet, sharing capabilities, and downloadable PDF/ZIP certificates.
  - **Verifiers:** Automated authenticity verification with blockchain confirmation.
- **Export & Document Generation:** Client-side high-resolution certificate rendering and export via `html2canvas`, `jspdf`, and `jszip`.
- **Dynamic QR Code Generation:** Instant cryptographic QR code creation for verifiable credentials.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Server Components)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & PostCSS
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **Web3 & Blockchain:** [Ethers.js v6](https://docs.ethers.org/v6/)
- **Export & Utility Libraries:** `jspdf`, `html2canvas`, `jszip`, `xlsx`, `qrcode.react`, `react-hot-toast`

---

## Project Structure

```text
src/
├── app/                       # Next.js App Router (pages and layouts)
│   ├── auth/                  # Login, registration, and activation pages
│   ├── dashboard/             # Role-specific dashboards (Admin, Issuer, Student)
│   ├── verify/                # Public certificate verification portal
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Landing page
├── components/                # Reusable UI components (Navbar, Footer, Modals, Buttons)
├── features/                  # Domain-driven features & submodules
│   ├── auth/                  # Authentication context, guards, and hooks
│   ├── certificates/          # Certificate views, issuance forms, batch uploads
│   ├── students/              # Student profile and records management
│   └── verification/          # On-chain and OCR verification modules
├── hooks/                     # Custom React hooks
├── lib/                       # Utility configurations (API client, environment parser)
└── utils/                     # Formatting, crypto, and helper functions
```

---

## Prerequisites

Before running the frontend, ensure you have:

1. **Node.js:** v18.x, v20.x, or v22+ (LTS recommended)
2. **Package Manager:** npm, yarn, or pnpm
3. **Backend Service:** Running instance of the [NestJS Backend](file:///home/minh/Study/GraduationProject/backend) (default `http://localhost:3000`)
4. **Browser Wallet:** [MetaMask](https://metamask.io/) extension (for issuing and Web3 verification)

---

## Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```bash
# Create local env file
touch .env.local
```

Populate the `.env.local` file with the following variables:

```env
# Backend REST API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Ethereum / Sepolia Smart Contract & RPC
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedSepoliaContractAddress
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# IPFS Gateway for retrieving media and metadata
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

---

## Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## Running the Application

### Development Mode
Start the Next.js development server:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)** *(or [http://localhost:3001](http://localhost:3001) if port 3000 is occupied by backend)*

### Production Build & Start

To build an optimized production bundle:

```bash
# 1. Build the production application
npm run build

# 2. Start the production server
npm run start
```

---

## Testing & Quality

```bash
# Run unit and integration tests
npm run test

# Run ESLint validation
npm run lint
```

---

## Docker Deployment

You can containerize and run the frontend using Docker:

```bash
# Build the Docker image with backend URL build argument
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 -t certificate-frontend .

# Run the container
docker run -p 3001:3000 certificate-frontend
```
