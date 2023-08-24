import { useEffect, useState } from "react";
import faucetContract from "./ethereum/faucet";
import { ethers } from "ethers";
import './App.css'
function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState();
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [transactionData, setTransactionData] = useState("");

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setFcContract(faucetContract(provider));
        /* set active wallet address */
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setFcContract(faucetContract(provider));
          /* set active wallet address */
          setWalletAddress(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const getOCTHandler = async () => {
    setWithdrawError("");
    setWithdrawSuccess("");
    try {
      const fcContractWithSigner = fcContract.connect(signer);
      const resp = await fcContractWithSigner.requestTokens();
      setWithdrawSuccess("Operation succeeded - enjoy your tokens!");
      setTransactionData(resp.hash);
    } catch (err) {
      setWithdrawError(err.message);
    }
  };

  return (
    <div>
      <nav className="navbar bg-dark navbar-dark">
        <div className="container-fluid">
          <a href="/" className="navbar-brand">Sandeep Prabhakula Token (SPB)</a>
          <form className="d-flex" role="search">

            <button
              className="btn btn-light"
              onClick={connectWallet}
            >
              <span className="fw-bolder text-danger">
                {walletAddress && walletAddress.length > 0
                  ? `Connected: ${walletAddress.substring(
                    0,
                    6
                  )}...${walletAddress.substring(38)}`
                  : "Connect Wallet"}
              </span>
            </button>
          </form>
        </div>
      </nav>
      <section className="">
        <div className="container">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">SPB Faucet</h1>
            <p>Fast and reliable. 50 SPB/day.</p>
            <div className="mt-5">
              {withdrawError && (
                <div className="text-danger">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="text-success">{withdrawSuccess}</div>
              )}{" "}
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your wallet address (0x...)"
                    defaultValue={walletAddress}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={getOCTHandler}
                    disabled={walletAddress ? false : true}
                  >
                    GET TOKENS
                  </button>
                </div>

              </div>
              <article className="m-3">
                <div className="d-flex flex-column">
                  <h3>Current Transaction</h3>
                  <div className="d-flex flex-row flex-wrap justify-content-evenly m-2">
                    <h4>Transaction Hash : </h4>
                    <p>{`${transactionData}`}</p>
                  </div>
                </div>
                <p>

                  Search the transaction using transaction hash on <a href="https://sepolia.etherscan.io/">EtherScan</a>
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;