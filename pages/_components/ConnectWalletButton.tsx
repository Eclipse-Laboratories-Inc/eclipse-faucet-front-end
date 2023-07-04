import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

interface Props {
  children: React.ReactNode
  onConnected?: () => void // Callback when wallet is connected
  onConnecting?: (connecting: boolean) => void // Callback when wallet is connecting
  isConnected: boolean
  isConnecting: boolean
}

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainnet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
  ],
})

const ConnectWalletButton: React.FC<Props> = ({ onConnected, onConnecting, isConnected, isConnecting }) => {
  const { activate, account, error } = useWeb3React()
  const [walletNotFound, setWalletNotFound] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      setWalletNotFound(false)
    } else {
      setWalletNotFound(true)
    }
  }, [account])

  const onClick = async () => {
    if (onConnecting) {
      onConnecting(true)
    }
    try {
      await activate(injectedConnector)
      if (onConnected) {
        onConnected()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      if (onConnecting) {
        onConnecting(false)
      }
    }
  }

  const buttonClass = `inline-flex items-center px-6 py-3 border border-transparent rounded-full text-base font-medium shadow-sm transition-all duration-300 ease-in ${
    isConnected
      ? 'bg-gray-600 text-white cursor-not-allowed'
      : walletNotFound
      ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
      : 'bg-custom-blue text-white hover:bg-custom-blue/70 focus:ring-custom-blue/20'
  }`

  return (
    <button
      onClick={onClick}
      disabled={walletNotFound || !!error || isConnecting || isConnected}
      className={buttonClass}
    >
      {isConnected ? (
        <span className="text-gray-700">Connected</span>
      ) : walletNotFound ? (
        'Wallet not found'
      ) : (
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      )}
    </button>
  )
}

export default ConnectWalletButton
