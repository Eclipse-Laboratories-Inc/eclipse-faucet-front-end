import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid'
import React, { useEffect, useState } from 'react'
import Skeleton from 'react-content-loader'
import Image from 'next/image'

interface Chain {
  icon_urls: any
  chain_id: string
  chain_name: string
  rpc_urls: string[]
  block_explorer_urls: string[]
  native_currency_name: string
  native_currency_decimals: number
  native_currency_symbol: string
}

interface AddNetworkButtonProps {
  children: React.ReactNode
  setIsConnected: (connected: boolean) => void
  onRpcUrlChanged: (rpcUrl: string | null) => void
}

const fetchChains = async (): Promise<Chain[]> => {
  const response = await fetch('https://api.chains.eclipse.builders/evm_chains')
  const data = await response.json()
  return data
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const sanitizeUrl = (url: string) => {
  const cleanedUrl = url.replace(/\s+/g, '')
  return isValidUrl(cleanedUrl) ? cleanedUrl : null
}

export const AddNetworkButton: React.FC<AddNetworkButtonProps> = ({ children, setIsConnected, onRpcUrlChanged }) => {
  const [chains, setChains] = useState<Chain[]>([])
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const [isConnected, setConnected] = useState(false)
  const [userSelectedChain, setUserSelectedChain] = useState<Chain | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = async () => {
        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId',
        })
        const matchedChain = chains.find((chain) => chain.chain_id === currentChainId)
        if (matchedChain) {
          setSelectedChain(matchedChain)
          setConnected(true)
        } else {
          setSelectedChain(null)
          setConnected(false)
        }
      }

      handleChainChanged()

      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [chains, selectedChain, isConnected])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkConnectionStatus = async () => {
        if (window.ethereum && selectedChain) {
          const currentChainId = await window.ethereum.request({
            method: 'eth_chainId',
          })
          setConnected(currentChainId === selectedChain.chain_id)
        }
      }

      checkConnectionStatus()
    }
  }, [selectedChain])

  useEffect(() => {
    const fetchChainsData = async () => {
      setIsLoading(true)
      const fetchedChains = await fetchChains()
      setChains(fetchedChains)
      setIsLoading(false)
    }

    fetchChainsData()
  }, [])

  useEffect(() => {
    if (selectedChain) {
      onRpcUrlChanged(selectedChain.rpc_urls[0])
    } else {
      onRpcUrlChanged(null)
    }
  }, [selectedChain, onRpcUrlChanged])

const loadingSkeleton = (
  <div className="w-full h-full sm:w-auto sm:h-auto md:w-96 md:h-96 lg:w-[600px] lg:h-[900px]">
    <Skeleton
      speed={3}
      width="100%"
      height="100%"
      viewBox="0 0 300 160"
      backgroundColor="#f0f0f0"
      foregroundColor="#e0e0e0"
      uniqueKey="custom-loader"
    >
      <rect x="0" y="0" rx="3" ry="3" width="300" height="20" />
      <rect x="0" y="30" rx="3" ry="3" width="300" height="20" />
      <rect x="0" y="60" rx="3" ry="3" width="300" height="20" />
      <rect x="0" y="90" rx="3" ry="3" width="300" height="20" />
      <rect x="0" y="120" rx="3" ry="3" width="300" height="20" />
    </Skeleton>
  </div>
)

  const addNetwork = async (chain: Chain) => {
  const sanitizedBlockExplorerUrls = selectedChain?.block_explorer_urls.map(sanitizeUrl).filter(Boolean)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chain.chain_id,
            chainName: chain.chain_name,
            rpcUrls: chain.rpc_urls,
            blockExplorerUrls: sanitizedBlockExplorerUrls,
            nativeCurrency: {
              name: chain.native_currency_name,
              decimals: chain.native_currency_decimals,
              symbol: chain.native_currency_symbol,
            },
          },
        ],
      })

      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      if (currentChainId === chain.chain_id) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (error: any) {
      console.error('Error adding network:', error)
      console.log('Parameters passed to wallet_addEthereumChain:', {
        chainId: chain.chain_id,
        chainName: chain.chain_name,
        rpcUrls: chain.rpc_urls,
        nativeCurrency: {
          name: chain.native_currency_name,
          decimals: chain.native_currency_decimals,
          symbol: chain.native_currency_symbol,
        },
      })
    }
  } else {
    alert('Ethereum provider not found')
  }
}


const getStatusTextAndColor = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const currentChainId = window.ethereum.chainId
    if (
      isConnected &&
      selectedChain &&
      userSelectedChain &&
      selectedChain.chain_id === currentChainId &&
      userSelectedChain.chain_id === currentChainId
    ) {
      return {
        text: `Connected: ${selectedChain.chain_name}`,
        color: 'text-green-500',
        icon: <CheckCircleIcon className="w-4 h-4 mr-2" />,
      }
    }
  }
  return {
    text: 'Not connected',
    color: 'text-red-500',
    icon: <ExclamationCircleIcon className="w-4 h-4 mr-2" />,
  }
}

const { text, color, icon } = getStatusTextAndColor()

return (
  <div className="flex flex-col justify-center items-center space-y-4">
    {isLoading || chains.length === 0 ? (
      loadingSkeleton
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-screen-xl">
          {chains.map((chain) => (
            <div
              key={chain.chain_id}
              className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-custom-yellow hover:shadow-lg transition-colors duration-200"
              onClick={() => {
                setUserSelectedChain(chain)
                addNetwork(chain)
              }}
            >
              <div className="flex items-center space-x-5">
                {chain.icon_urls && chain.icon_urls[0] && (
                  <img
                    src={chain.icon_urls[0]}
                    alt={chain.chain_name}
                    className="w-14 h-14 object-cover rounded-full"
                  />
                )}
                <div className="flex flex-col items-start">
                  <h2 className="font-bold text-lg mb-2 text-gray-700">{chain.chain_name}</h2>
                  <p className="text-gray-500">{chain.native_currency_symbol}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`flex items-center ${color}`}>
          {icon}
          {text}
        </div>
      </>
    )}
  </div>
)
}

export default AddNetworkButton