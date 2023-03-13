import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useCallback, useMemo, useEffect, ReactNode, Children } from 'react'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import dynamic from 'next/dynamic'
import { clusterApiUrl } from '@solana/web3.js'
import { InjectedConnector } from '@web3-react/injected-connector'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Button, Input } from 'antd'
import Script from 'next/script'
import { CaptchaModal } from '../component/CaptchaModal'
// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')

export const toHex = (num: Number) => {
  const val = Number(num)
  return '0x' + val.toString(16)
}

const zebecChainId = 91002

const networkParams = {
  [toHex(zebecChainId)]: {
    chainId: toHex(zebecChainId),
    rpcUrls: ['https://api.evm.zebec.eclipsenetwork.xyz/solana'],
    chainName: 'Nautilus Triton Testnet',
    nativeCurrency: { name: 'tZBC', decimals: 18, symbol: 'tZBC' },
    blockExplorerUrls: ['https://triton.nautscan.com/'],
    iconUrls: [],
  },
}

const ReactUIWalletModalProviderDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletModalProvider,
  { ssr: false }
)

enum ChainVm {
  ethereum = 'Ethereum',
  solana = 'Solana',
}

type WalletProps = { children: ReactNode }

export const Wallet = (props: WalletProps) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [new SolflareWalletAdapter(), new PhantomWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <ReactUIWalletModalProviderDynamic>
          <div className="wallet-connect">
            <WalletMultiButton />
            <label>Connect to fill in your Solana address :-)</label>
          </div>

          {props.children}
        </ReactUIWalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  )
}

type FaucetFormProps = {
  showChooseNetwork: Boolean
  vm: ChainVm
  defaultFaucetUrl: string
  account?: string | null
}

const shortenAddr = (address = '', length = 3) => {
  if (!address) return ''

  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const FaucetForm = (props: FaucetFormProps) => {
  const { showChooseNetwork, vm, defaultFaucetUrl, account } = props

  const [address, setAddress] = useState<string>('')
  const [amount, setAmount] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [faucetUrl, setFaucetUrl] = useState(defaultFaucetUrl)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { connection } = useConnection()
  const [verified, setVerified] = useState(false)
  // const { publicKey, sendTransaction } = useWallet();

  const solanaRpcBody = (amount: number, address: string) =>
    JSON.stringify({
      jsonrpc: '2.0',
      id: '2',
      method: 'requestAirdrop',
      params: [address, Math.round(amount * 1000000000)],
    })

  const neonEvmBody = (amount: number, address: string) =>
    JSON.stringify({
      amount,
      wallet: address,
    })

  useEffect(() => {
    if (account) {
      setAddress(account)
    }
  }, [account])

  const onSend = useCallback(async () => {
    if (Number(amount) <= 0 || !ethers.utils.isAddress(address)) {
      return
    }
    const faucet = `${faucetUrl}`

    setSending(true)
    setError(null)
    // @ts-ignore
    const body = vm === ChainVm.solana ? solanaRpcBody(Number(amount), address) : neonEvmBody(Number(amount), address)
    const res = await fetch(faucet, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    setSending(false)
    if (!res.ok) {
      const body = await res.text()
      setError(`Returned ${res.status}: ${body}`)
      return
    }

    if (vm === ChainVm.solana) {
      const response = await res.json()
      if (response.error) {
        setError(response.error.message)
      } else {
        setSignature(response.result)
      }
    } else {
      // EVM faucet doesn't return a body
      setSignature('OK')
    }
  }, [address, amount, faucetUrl, vm])

  const handleSend = () => {
    if (verified) {
      onSend()
      return
    }
    setOpen(true)
  }

  return (
    <div className="form w-full">
      {showChooseNetwork && (
        <>
          <label htmlFor="input-endpoint" className="form-label">
            Choose your {vm} Eclipse Network
          </label>
          <Input
            size="large"
            id="input-endpoint"
            value={faucetUrl}
            onChange={(e) => setFaucetUrl(e.target.value)}
            placeholder="Eclipse Solana RPC endpoint"
            type="text"
          />
        </>
      )}

      <label htmlFor="input-address mt-3" className="form-label  mt-3">
        {vm} Wallet Address
      </label>
      <Input
        size="large"
        id="input-address"
        value={address || ''}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="address"
        type="text"
      />

      <label htmlFor="input-amount" className="form-label mt-3">
        Token Amount
      </label>

      <Input
        size="large"
        id="input-amount"
        style={{ width: '--webkit-fill-available' }}
        value={amount ?? ''}
        onChange={(e) => {
          setAmount(e.target.value)
        }}
        placeholder="amount"
        type="number"
        min="0"
        step="0.001"
      />

      <Button
        disabled={!address || !amount}
        size="large"
        className="mt-3"
        block
        type="primary"
        loading={sending}
        onClick={() => {
          handleSend()
        }}
      >
        {sending ? 'Sending...' : 'Send'}
      </Button>

      {signature && <p>Sent!</p>}
      {error && <p>{error}</p>}

      <CaptchaModal
        open={open}
        onCancel={() => {
          setOpen(false)
        }}
        onSuccess={() => {
          onSend()
          setOpen(false)
          setVerified(true)
        }}
      />
    </div>
  )
}

const SELF_URL = process.env.NEXT_PUBLIC_SELF_URL
const Home: NextPage = () => {
  const { activate, deactivate, active, chainId, account, library } = useWeb3React()
  const [error, setError] = useState<string | null>(null)

  console.log({
    account,
    chainId,
    active,
    library,
  })

  const EvmWallet = (props: WalletProps) => {
    const switchNetwork = async (chainId: Number) => {
      try {
        await library.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: toHex(chainId) }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await library.provider.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams[toHex(chainId)]],
            })
          } catch (error: any) {
            setError(error)
          }
        }
      }
    }

    const Injected = new InjectedConnector({
      // supportedChainIds: [1, 91002]
    })

    const handleConnect = async () => {
      activate(Injected)
    }

    return (
      <div className="flex flex-col">
        <Button size="large" type={account ? 'text' : 'primary'} onClick={handleConnect}>
          {account ? shortenAddr(account, 5) : 'Connect Wallet'}
        </Button>
        {account && chainId !== zebecChainId && (
          <Button
            type="primary"
            className="mt-3 "
            size="large"
            onClick={() => {
              switchNetwork(zebecChainId)
            }}
          >
            <span className="text-white">
              Connect{' '}
              <span className="mx-2" style={{ color: 'yellow' }}>
                Nautilus Triton{' '}
              </span>{' '}
              EVM Test Network
            </span>
          </Button>
        )}
        {chainId && (
          <div className="self-center mt-3">
            Connected to chain: {networkParams[toHex(chainId)]?.chainName || chainId}
          </div>
        )}
        {props.children}
      </div>
    )
  }

  return (
    <div className="global-container">
      <Head>
        <title>Triton Faucet</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SELF_URL}/eclipse_twitter_card.jpg`} />
        <meta name="twitter:title" content="Nautilus Triton Testnet Faucet" />
        <meta
          name="twitter:description"
          content="The Eclipse testnet faucet is a client tool that allows anyone to easily request a nominal amount of Eclipse assets for testing purposes."
        /> */}
        {/* <meta property="og:title" content="Eclipse Testnet Faucet" />
        <meta
          property="og:description"
          content="The Eclipse testnet faucet is a client tool that allows anyone to easily request a nominal amount of Eclipse assets for testing purposes."
        />
        <meta property="og:image" content={`${SELF_URL}/eclipse_twitter_card.jpg`} /> */}
      </Head>
      <div className="container" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="icon">
          <Image alt="Triton logo" src="/icon.png" height={90} width={90} />
        </div>

        <div className="subhead mt-[30px]">Triton Faucet</div>
        <div className="w-full">
          <div className="form-content">
            <div className="title">
              <div className="header text-xl sm:text-xl md:text-2xl xl:text-4xl">Nautilus Triton Testnet Faucet</div>
            </div>
            <EvmWallet>
              <FaucetForm
                account={account}
                showChooseNetwork={false}
                vm={ChainVm.ethereum}
                defaultFaucetUrl={'https://faucet.evm.zebec.eclipsenetwork.xyz/request_neon'}
              />
            </EvmWallet>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
