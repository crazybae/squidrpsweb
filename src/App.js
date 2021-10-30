import React, { Component, useState } from "react";
import Button from 'react-bootstrap/Button';
import { ethers } from "ethers";
import ShowInstruction from "./instruction";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

const masterAddress = '0x9194C01db602Ed716E9d16Fa60F684DeB3b62523';
const numberOfRounds = 3;
const availableNetworks = [1]; // mainnet only

const [rock, paper, scissors] = ['\u270A', '\u270B', '\u270C'];
const contractInfo = {
  1:{
    "Network": "Ethereum Mainnet",
    "MainCardAddress": '0xBE5C953DD0ddB0Ce033a98f36C981F1B74d3B33f',
  },
};
const ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function getGenes(uint256 _tokenId) public view returns (uint8[8])",
  "function getConsonants(uint256 _tokenId) public view returns (string[3])",
  "function getConsonantsIndex(uint256 _tokenId) public view returns (uint8[3])",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 _tokenId) public view returns (string)",
];

function getElem(elemId) {
  return document.getElementById(elemId);
}

// return -1 when c1 wins, 0 in draw, 1 when c2 wins 
const RPS = (c1, c2) => {
  if (c1 === c2) {
      return 0;
  }
  if (c1 === rock) {
      if (c2 === paper) {
          return 1;
      } else {
          return -1;
      }
  }
  if (c1 === paper) {
      if (c2 === scissors) {
          return 1;
      } else {
          return -1;
      }
  }
  if (c1 === scissors) {
      if (c2 === rock) {
          return 1;
      } else {
          return -1;
      }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

class App extends Component {
  state = {
    loaded: false,
    chainId: 0,
    myAccount: "",
    mastersCards: [],
    yourCards: [],
  };

  componentDidMount = async () => {

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.startApp();
    await this.watchChainAccount();
  };

  startApp = async () => {
    try {
      this.signer = this.provider.getSigner();
      this.networkId = (await this.provider.getNetwork()).chainId;
      if ( !availableNetworks.includes(this.networkId) ) {
        return <div>Change your wallet network into Mainnet or Rinkeby/Goerli testnet and press F5 ...</div>;
      }
      this.account = await this.signer.getAddress();
      if ( !this.account ) {
        await this.connectWallet();
      }
      this.instance = new ethers.Contract(contractInfo[this.networkId].MainCardAddress, ABI, this.provider);
      if ((await this.instance.balanceOf(this.account)).toNumber() === 0) {
        alert(`Your account ${this.account} has no Squid Game cards. Please use another address having cards`);
        return;
      }

      this.setState({
        chainId: this.networkId,
        loaded: true,
        myAccount: this.account,
      });

    } catch (error) {
      console.log(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  connectWallet = async () => {
    this.accounts = await window.ethereum
        .request({method: 'eth_requestAccounts'});
  }

  watchChainAccount = async () => {
    this.provider.on("accountsChanged", (accounts) => {
      alert("Account changed");
      this.startApp();
    });
    this.provider.on("chainChanged", (chainId) => {
      this.startApp();
      alert("Network changed to " + contractInfo[parseInt(chainId)].Network);
    });
    this.provider.on("connect", (connectInfo) => {
      alert("Connected to Ethereum network");
    });      
    this.provider.on("disconnect", (error) => {
      alert("Disconnected from Ethereum network");
    });      
  }

  getMastersChoices = async() => {

    getElem("mastersChoices").innerHTML = "waiting ...";

    let cards = await this.getRandomCards(masterAddress, numberOfRounds);

    var htmlStr = `<table class="center" border="1">`
    cards.forEach((card) => {
      htmlStr += `<tr><td>Token ID #${card.tokenID}</td><td><img src='${card.image}' height="100" /></td><td>${card.rps}</td></tr>`
    });
    htmlStr += `</table>`

    getElem("mastersChoices").innerHTML = htmlStr;

    this.setState({
      chainId: this.networkId,
      loaded: true,
      myAccount: this.account,
      mastersCards: cards,
    });
  }

  getYourRandomChoices = async() => {

    if (this.state.mastersCards.length === 0) {
      alert("Press 'Get Master's Choices' first");
      return
    }

    getElem("yourRandomChoices").innerHTML = "waiting ...";

    let cards = await this.getRandomCards(this.signer.getAddress(), numberOfRounds);

    var htmlStr = `<table class="center" border="1">`
    cards.forEach((card) => {
      htmlStr += `<tr><td>Token ID #${card.tokenID}</td><td><img src='${card.image}' height="100" /></td><td>${card.rps}</td></tr>`
    });
    htmlStr += `</table>`

    getElem("yourRandomChoices").innerHTML = htmlStr;

    this.setState({
      chainId: this.networkId,
      loaded: true,
      myAccount: this.account,
      yourCards: cards,
    });
  }

  letsRPS = async() => {

    if (this.state.yourCards.length === 0) {
      alert("Press 'Get Your Random Choices' first");
      return
    }

    getElem("rpsResults").innerHTML = "waiting ...";

    let roundPlayer1 = 0;
    let roundPlayer2 = 0;

    let resStr = "";
    for (let round = 0; round < numberOfRounds; round++) {

      let player1 = 0;  // you
      let player2 = 0;  // master
      let outcome = 0;

      resStr += `<p><b>Round ${round+1}</b></p>`
  
      for (let i = 0; i < 5; i++) {
        outcome = RPS(this.state.yourCards[round].rps[i], this.state.mastersCards[round].rps[i]);
        //temporal
        let winner; 
        if (outcome === -1) {
            winner = 'You win';
            player1++;
        } else if (outcome === 1) {
            winner = 'Squid Master wins'
            player2++;
        } else {
            winner = 'Draw'
        }
        resStr += `<p>  RPS ${i+1}:  ${this.state.yourCards[round].rps[i]} vs ${this.state.mastersCards[round].rps[i]} --> ${winner}</p>`
      }
      resStr += `<p>  You : Squid Master = ${player1} : ${player2}</p><p></p>`

      if (player1 > player2) {
        roundPlayer1++;
      } else if (player1 < player2) {
        roundPlayer2++;
      }
    }
    getElem("rpsResults").innerHTML = resStr;

    if (roundPlayer1 > roundPlayer2) {  // you win
      getElem("finalResult").innerHTML = `<center><font size='20px'><b>You win!</b></font><br><br><img src='./images/youwin.jpg' height="400" /></center>`;
    } else if (roundPlayer1 < roundPlayer2) { // master wins
      getElem("finalResult").innerHTML = `<center><font size='20px'><b>Master wins!</b></font><br><br><img src='./images/masterwins.jpg' height="400" /></center>`;
    } else {  // draw
      getElem("finalResult").innerHTML = `<center><font size='20px'><b>Draw</b></font><br><br><img src='./images/draw.png' height="400" /></center>`;
    }
  }

  getRandomCards = async (address, numOfCards) => {

    const balance = await this.instance.balanceOf(address);
    let cards = [];
  
    for (let i = 0; i < numOfCards; i++) {
      let tokenID = await this.instance.tokenOfOwnerByIndex(address, getRandomInt(0, balance));
      let c1 = await this.instance.getConsonantsIndex(tokenID);
      let g1 = await this.instance.getGenes(tokenID);
      let TempRPScard1 = Array.from(c1);
      TempRPScard1.push(g1[0]*1000 + g1[1]*100 + g1[2]*10 + g1[3]);
      TempRPScard1.push(g1[4]*1000 + g1[5]*100 + g1[6]*10 + g1[7]);
      let RPScard1 = TempRPScard1.map((x) => {
          let rem = x % 3;
          if (rem === 0) {
              return rock;
          } else if (rem === 1) {
              return paper;
          }
          return scissors;
      });
      let tokenInfoBase64 = await this.instance.tokenURI(tokenID);
      let jsonInfo = JSON.parse(atob(tokenInfoBase64.substring(29)));

      cards.push({ tokenID: tokenID.toNumber(), image: jsonInfo.image, rps: RPScard1 });
    }

    return cards;
  }

  render() {

    if (!this.state.loaded) {
      return <div>Change your wallet network into Mainnet or Rinkeby/Goerli testnet and press F5 ...</div>;
    }
    return (

      <div className="App">

          <h1>Defeat Squid Master! Rock-Paper-Scissors Game</h1>
          <ShowInstruction />
          <hr />

          <p>Current network is <b>{ contractInfo[this.state.chainId].Network }</b> having chain ID, {this.state.chainId}</p>
          <p>'Squid Game Card' contract address is <b>{ contractInfo[this.state.chainId].MainCardAddress }</b></p>
          <p>Your address is <b>{ this.state.myAccount }</b></p>

          <table>
            <tr>
              <td width='400'><Button id='mastersChoicesBtn' onClick={this.getMastersChoices} >
                Get Master's Choices</Button></td>
              <td width='400'><Button id='yourChoicesBtn' onClick={this.getYourRandomChoices} >
                Get Your Random Choices</Button></td>
            </tr><tr>
              <td><div id="mastersChoices"></div></td>
              <td><div id="yourRandomChoices"></div></td>
            </tr>
          </table>

          <p></p>
          <table>
            <tr>
              <td width='400'><Button id='letsRPSBtn' onClick={this.letsRPS} >{ `${rock} ${paper} ${scissors}` }</Button></td>
              <td width='400'></td>
            </tr><tr>
              <td><div id="rpsResults"></div></td>
              <td><div id="finalResult"></div></td>
            </tr>
          </table>

      </div>
    );
  }
}

export default App;