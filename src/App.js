import { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { TEST_GIFS } from './mockData/gifs';
import kp from './keypair.json'

// import contract 
import idl from './contract/idl.json';

const { SystemProgram, Keypair } = web3;

// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
};

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [gifUrlInput, setGifUrlInput] = useState('');
  const [gifsList, setGifsList] = useState([]);
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (!solana) {
        return alert('Solana object not found! Get a Phantom wallet 👻');
      }
      console.log('Solana wallet found');
      const response = await solana.connect();
      console.log('Connected with public key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    } catch(err) {
      console.log(err);
    }
  }

  const handleConnectClick = async () => {
    await checkIfWalletIsConnected();
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  const getGifsList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log('Got the account', account);
      setGifsList(account.gifList);

    } catch(err) {
      console.log('Fetching gifs list error: ', err);
      setGifsList(null);
    }
  }

  const renderNotConnectedContainer = () => {
    if (!walletAddress) return <button className="cta-button connect-wallet-button" onClick={handleConnectClick}>Connect to Wallet</button>;
    if (gifsList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
        <div className="connected-container">
          <form onSubmit={handleFormSubmit}>
            <input type="text" placeholder="Enter gif link!" value={gifUrlInput} onChange={e => setGifUrlInput(e.target.value)} />
            <button type="submit" className="cta-button submit-gif-button">Submit</button>
          </form>
          <div className="gif-grid">
            {
              gifsList && gifsList.length > 0 && gifsList.map(gif => (
                <div className="gif-item" key={gif.gifLink}>
                  <img src={gif.gifLink} alt={gif.gifLink} />
                </div>
              ))
            }
          </div>
        </div>
      );
    }
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifsList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const handleFormSubmit = e => {
    e.preventDefault();
    if (gifUrlInput.length > 0) {
      console.log('Gif link:', gifUrlInput);
      sendGif();
    } else {
      console.log('Please enter a gif url!')
    }
  }

  const sendGif = async () => {
    if (gifUrlInput.length === 0) {
      console.log("No gif link given!")
      return
    }
    console.log('Gif link:', gifUrlInput);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(gifUrlInput, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", gifUrlInput)
  
      await getGifsList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching gifs list...');

      /* solana integration code here */
      getGifsList();

      setGifsList(TEST_GIFS);
    }
  }, walletAddress)

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="section bg1">
            <div className="text-gradient-bg">
              <h1>My Anime GIFs</h1>
              <p>This is 🦄's Solana bootcamp 🥳</p>
              {renderNotConnectedContainer()}
            </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
