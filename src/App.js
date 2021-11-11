import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
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

  const handleConnectClick = () => {
    alert('jhi');
  }

  const renderNotConnectedContainer = () => <button className="cta-button connect-wallet-button" onClick={handleConnectClick}>Connect to Wallet</button>;

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="section bg1">
            <div className="text-gradient-bg">
              <h1>My Anime GIFs</h1>
              <p>This is 🦄's Solana bootcamp 🥳</p>
              {!walletAddress && renderNotConnectedContainer()}
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
