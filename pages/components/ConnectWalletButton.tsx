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

  const buttonClass = `inline-flex items-center px-4 py-2 border-2 border-white focus:outline-none focus:ring-2 focus:ring-offset-2 mt-4 mb-2 transition-all duration-300 ease-in ${
    isConnected
      ? 'bg-white text-gray-700 cursor-not-allowed'
      : walletNotFound
      ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
      : 'bg-transparent text-white hover:bg-white hover:text-gray-700 focus:ring-blue-500'
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
