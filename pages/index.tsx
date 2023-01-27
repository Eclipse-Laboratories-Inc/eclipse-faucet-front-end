import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useCallback, useMemo, useEffect, ReactNode } from 'react'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import dynamic from "next/dynamic";
import { clusterApiUrl } from '@solana/web3.js';
const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);


// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

type WalletProps = { children: ReactNode }

export const Wallet = (props: WalletProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new PhantomWalletAdapter()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} >
        <ReactUIWalletModalProviderDynamic>
          <div className="wallet-connect">
            <WalletMultiButton />
            <span >Connect to fill-in your Solana address :-) </span>
          </div>

          {props.children}
        </ReactUIWalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const FaucetForm = () => {

  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [eclipseRpcEndpoint, setEclipseRpcEndpoint] = useState("https://apricot.eclipsenetwork.xyz:8899")
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  useEffect(() => {
    if (publicKey !== null) {
      setAddress(publicKey.toString());
    }
  }, [publicKey]);

  const onSend = useCallback(async () => {
    const faucet = `${eclipseRpcEndpoint}`

    setSending(true)
    setError(null)
    const res = await fetch(faucet, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '2',
        method: 'requestAirdrop',
        params: [address, Math.round(Number(amount) * 1000000000)],
      }),
    })
    const response = await res.json()
    setSending(false)
    if (response.error) {
      setError(response.error.message)
    } else {
      setSignature(response.result)
    }
  }, [address, amount, eclipseRpcEndpoint])

  return (
    <div className="form" >
      <div className="form-label">Choose your Eclipse Network</div>
      <input
        value={eclipseRpcEndpoint}
        onChange={(e) => setEclipseRpcEndpoint(e.target.value)}
        placeholder="Eclipse Solana RPC endpoint"
        type="text"
      />
      <div className="form-label">Wallet Address</div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="public key"
        type="text"
      />

      <div className="form-label">Amount ($SOL)</div>
      <input
        style={{ width: "--webkit-fill-available" }}
        value={amount ?? ''} onChange={(e) => setAmount(e.target.value)} placeholder="amount" type="number" min="0" step="0.001" />


      <button className="send" type="submit" onClick={onSend}>
        {sending ? 'Sending...' : 'Send'}
      </button>
      {signature && <p>Sent!</p>}
      {error && <p>{error}</p>}
    </div>
  )

}

const SELF_URL = process.env.NEXT_PUBLIC_SELF_URL
const Home: NextPage = () => {

  return (
    <div>
      <Head>
        <title>Eclipse Testnet Faucet</title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SELF_URL}/eclipse_twitter_card.jpg`} />
        <meta name="twitter:title" content="Eclipse Testnet Faucet" />
        <meta
          name="twitter:description"
          content="The Eclipse testnet faucet is a client tool that allows anyone to easily request a nominal amount of Eclipse assets for testing purposes."
        />

        <meta property="og:title" content="Eclipse Testnet Faucet" />
        <meta
          property="og:description"
          content="The Eclipse testnet faucet is a client tool that allows anyone to easily request a nominal amount of Eclipse assets for testing purposes."
        />
        <meta property="og:image" content={`${SELF_URL}/eclipse_twitter_card.jpg`} />
      </Head>
      <div className="container">
        <div className="icon">
          <Image alt="Eclipse logo" src="/icon.svg" height={90} width={90} />
        </div>

        <div className="form-content">
          <div className="title">
            <div className="subhead">Eclipse</div>
            <div className="header">Testnet Faucet</div>
          </div>
          <Wallet>
            <FaucetForm />
          </Wallet>
        </div>
      </div>
    </div>
  )
}

export default Home
