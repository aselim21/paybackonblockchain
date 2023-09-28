# PaybackOnBlockchain

Install Metamask and create a account.

## How to test the system on local network

### Set up

1. Install [Node.js](https://nodejs.org/en/download/current "https://nodejs.org/en/download/current") on your computer.
2. Install Truffle by running `npm install -g truffle` in a terminal.
3. Install the [Metamask wallet extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn") on your browser and create an account.
4. Download this repository.

### Run code

#### Deploy the smart contracts

1. Open the project in VS Code or other editor.
2. Navigate to the truffle project folder in the terminal `cd payback-token-truffle`
3. Run this command to install all truffle dependecies `npm install`
4. Run  `truffle develop`
5. Copy the private key of the last Account with id (9) from the terminal and import this account into your metamask wallet in the browser. [MetaMask Support: How to import an account](https://support.metamask.io/hc/en-us/articles/360015489331-How-to-import-an-account#h_01G01W07NV7Q94M7P1EBD5BYM4 "https://support.metamask.io/hc/en-us/articles/360015489331-How-to-import-an-account#h_01G01W07NV7Q94M7P1EBD5BYM4")
6. Change the network in your Metamask Wallet to Localhost 9545

![Local Network Settings](images/Metamask-howToLocalNetwork.png "Local Network Settings")

7. Run this command to deploy the smart contracts in a local blockchain ``migrate --network development --reset``

#### **Start the frontend**

1. Copy the *contract address* from the terminal output of the previous step.
2. Open the next.config.js file in the /frontend folder and update the CONTRACT_ADDRESS variable with the copied value.
3. Open a new termial.
4. Navigate to the frontend folder in the terminal `cd frontend`
5. Run this command to install all frontend dependecies `npm install`
6. Run this command to start the frontend `npm run dev`

## User Stories

### Payback Smart Contract

There is a Smart Contract for PayBack's loyalty programm. Total supply of the PBT (PayBack Token) is 100 000 000 (100m) with no decimals.
1 Token is worth 1 Cent.
10 Tokens = 10 Cent
100 Tokens = 1 Euro

### Kaufland becomes a partner

1. Kaufland Germany and Payback have agreed to be partners.
2. Payback employee goes to the internal Payback Website and registers Kaufland as a partner with the following data:
   name: "Kaufland DE"
   adress: {public key of the kaufland wallet}
   currency: "EUR"
   value for token: 2
3. Payback sends the agreed amount of tokens to its new partner Kaufland - 10k

### Clients register for a payback account

### Client wants to make purchase from Kaufland and gather PBT using his PayBack Accoount/Wallet

1. User has already selected items to his shopping cart and is on the page, where he has to pay 50 EURO.
2. User clicks on the button to connect his Metamask wallet in order to gather Points. Wallet is connected.
   //todo
3. System checks if the user has a PB account.
4. System calculates the amount of Tokens the user should get for 50 EURO and transfers the amount of PayBack tokens (25) from its wallet to user's wallet.
5. User checks his balance of tokens.

### EINLOESEN - nichts zurueck. Client wants to use his PBTs from Kaufland in order to get something from DM - AKTION

1. DM offers a free shampoo in exchange for

### EINLOESEN - Geld zurueck. Punkte einlösen

Jeder kann seine Punkte einlösen. Egal woher die Punkte kommen. Das könnte Man vllt auch bei Exchanges tun...? Das macht kein Sinn. Sie müssen zurück zu den Partnern oder zu PayBack.
Aber der Kunde soll Ether für Gas für die "approve" Transaktion haben. Nicht viel eingentlich! Aber woher soll das kommen?

Andere variante ist für Rückerstattung als Ether zu schicken, aber dann brauche ich trotzdem Ether für die erste transaktion.
Vielleicht, wenn ich mich als Kunde anmelde, soll ich in der Liste gespeichert sein. und dann muss ich keine Transaktion initieren... Aber kann können meine Tokens geklaut werden.
Punkte können nur dann eingelöst werden, wenn man etwas kauft!
Dann würde ich bar geld eingeben/oder mit Karte und mir wird ein bisschen Ethereum geschickt!!!

!!!!!!!!
Beim Anmelden bei PayBack, soll ich bisschen bezahlen.. z.B. 2 oder 5 Euro.
Dann werden sie mir in Form von Ether geschickt und ein NFT zugewiesen.
Auf diese Weise habe ich genug Ether, um die "approve" Transaktion zu bezahlen.

Sonst hier wir gehen hier davon aus, dass der Kunde schon ein bisschen Ether hat.

The best would be with SSI, not NFT, but sadly its getting too complicated for the users...?
!Allowance

Feste optionen:
PBT : EURO

* 200 = 2
* 500 = 5
* 1000 = 10
* 2000 = 20

## System
