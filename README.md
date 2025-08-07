How to run this the app:
>yarn start-devnet

In case you want to change the config from devnet to testnet or mainnet, update the following line with the desired network from tsconfig.json
>"config": ["config/config.devnet.ts"]

Here's your checklist formatted as a clean and readable Markdown file (`SETUP_GUIDE.md` or `README.dev.md`):

-----------------------------------------------------------------------------------------------------------------------------------------------------------

---

````md
# 🛠️ MultiversX Template dApp — Setup Guide

This guide documents the exact steps followed to clone, configure, and run the [`mx-template-dapp`](https://github.com/multiversx/mx-template-dapp) locally using **devnet**, **testnet**, or **mainnet**.

---

## ✅ Prerequisites

- Node.js **v18.20.2+**
- Yarn (optional, recommended)
- Git
- A browser (Chrome/Brave/Edge)

---

## 🔹 1. Clone the repository

```bash
git clone https://github.com/multiversx/mx-template-dapp.git
cd mx-template-dapp
````

---

## 🔹 2. Install Node.js 18+

> ⚠️ Required version: `>= 18`

* Download from [https://nodejs.org/en](https://nodejs.org/en)
* Confirm version:

```bash
node -v
npm -v
```

---

## 🔹 3. (Optional) Install Yarn

```bash
npm install -g yarn
```

---

## 🔹 4. Install dependencies

```bash
yarn install
```

> Or use `npm install` if you don't want to use yarn.

---

## 🔹 5. Create `src/config/config.ts`

Choose your desired environment:

```ts
// src/config/config.ts

export * from './config.devnet';
// OR
// export * from './config.testnet';
// export * from './config.mainnet';
```

---

## 🔹 6. Add alias in `tsconfig.json`

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "config": ["config/config.ts"]
    }
  }
}
```

---

## 🔹 7. Start the app

Choose one:

```bash
yarn start-devnet
yarn start-testnet
yarn start-mainnet
```

---

## 🔹 8. Open the app in browser

Go to:

```
https://localhost:3000/
```

If you get SSL warnings, click "Advanced" → "Proceed anyway".

---

## 🧪 Notes

* You can get free test tokens from:

  * Devnet Faucet: [https://devnet-wallet.multiversx.com/tools/faucet](https://devnet-wallet.multiversx.com/tools/faucet)
  * Testnet Faucet: [https://testnet-wallet.multiversx.com/tools/faucet](https://testnet-wallet.multiversx.com/tools/faucet)

* The app supports:

  * Web Wallet
  * xPortal
  * Ledger
  * (Optional) Passkeys

---

## ✅ You're ready to build on MultiversX!

Next steps:

* Add wallet connection
* Trigger transactions
* Deploy and connect smart contracts

```

---

Would you like me to generate the actual `.md` file for download?
```


-----------------------------------------------------------------------------------------------------------------------------------------------------------
# @multiversx/template-dapp

The **MultiversX dApp Template**, built using [React.js](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).
It's a basic implementation of [@multiversx/sdk-dapp](https://www.npmjs.com/package/@multiversx/sdk-dapp), providing the basics for MultiversX authentication and TX signing.

See [Dapp template](https://template-dapp.multiversx.com/) for live demo.

### Tests

[![E2E tests](https://github.com/multiversx/mx-template-dapp/actions/workflows/playwright.yml/badge.svg)](https://github.com/multiversx/mx-template-dapp/actions/workflows/playwright.yml)

## Requirements

- Node.js version 16.20.0+
- Npm version 8.19.4+

## Getting Started

The dapp is a client side only project and is built using the [Create React App](https://create-react-app.dev) scripts.

### Instalation and running

### Step 1. Install modules

From a terminal, navigate to the project folder and run:

```bash
yarn install
```

### Step 2. Running in development mode

In the project folder run:

```bash
yarn start-devnet
yarn start-testnet
yarn start-mainnet
```

This will start the React app in development mode, using the configs found in the `vite.config.ts` file.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

> **Note:**
> While in development, to test the passkeys provider use the following command:
> `open -a Google\ Chrome --args --ignore-certificate-errors --ignore-urlfetcher-cert-requests`
> Make sure to close all instances of Chrome after the development session.

### Step 3. Build for testing and production use

A build of the app is necessary to deploy for testing purposes or for production use.
To build the project run:

```bash
yarn build-devnet
yarn build-testnet
yarn build-mainnet
```

## Roadmap

See the [open issues](https://github.com/multiversx/mx-template-dapp/issues) for a list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

One can contribute by creating _pull requests_, or by opening _issues_ for discovered bugs or desired features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
