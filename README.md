# Forward-Trace-Explorer
Dapp for forward traceability.

## Installation

First ensure you are in an empty directory, make sure Ganache is running and that MetaMask is installed.

```sh
# Install Truffle globally and run `truffle unbox`
$ npm install -g truffle
$ truffle unbox {USER_NAME || ORG_NAME}/{REPO_NAME}
```

Start the react dev server.

```sh
$ cd client
$ npm start
  Starting the development server...
```

This will spawn an web3 application at localhost:3000.

## Todo
* Right now the product look up tables does not verify that the product exist.
* Decide when to use if and require. For example, when trying to create a product should we wrap it inside an if statement or use require?
** Costs could be an issue. It seems that require does not use a lot.
* Couple Dapp to RFID or NFC readers

For the next release we aim to bring RFID or NFC functionality to the Dapp. We envision 