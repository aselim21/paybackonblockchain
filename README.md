# PayBackOnBlockchain

## How to run the code
1. ```cd payback-token-truffle```
2. ```truffle develop```
3. Copy the private key of the last Account and import this account in your metamask wallet in the browser.
3. ```migrate --network development --reset```
4. Go to ./basic-website
5. Fix the smart contract address in the JS file
6. run the live server for the html files
7. You may need to fix the network in your metamask. Make sure you are connected to http://localhost:9545 with chainID 1337 (even though truffle says its 5777)

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
//todo

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
200 = 2
500 = 5
1000 = 10
2000 = 20

## System
