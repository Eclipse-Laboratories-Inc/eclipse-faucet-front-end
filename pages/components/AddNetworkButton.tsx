import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState } from 'react';

interface Chain {
  chain_id: string;
  chain_name: string;
  rpc_urls: string[];
  block_explorer_urls: string[];
  native_currency_name: string;
  native_currency_decimals: number;
  native_currency_symbol: string;
}

interface AddNetworkButtonProps {
  children: React.ReactNode;
  setIsConnected: (connected: boolean) => void;
}

const fetchChains = async (): Promise<Chain[]> => {
  const response = await fetch('https://api.chains.eclipse.builders/evm_chains');
  const data = await response.json();
  return data;
};

const isValidUrl = (url:string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sanitizeUrl = (url: string) => {
  const cleanedUrl = url.replace(/\s+/g, '');
  return isValidUrl(cleanedUrl) ? cleanedUrl : null;
};

export const AddNetworkButton: React.FC<AddNetworkButtonProps> = ({ children, setIsConnected }) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isConnected, setConnected] = useState(false);


  
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async () => {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const matchedChain = chains.find((chain) => chain.chain_id === currentChainId);
        if (matchedChain) {
          setSelectedChain(matchedChain);
          setConnected(true);
        } else {
          setSelectedChain(null);
          setConnected(false);
        }
      };

      handleChainChanged();

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [chains, selectedChain, isConnected]);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (window.ethereum && selectedChain) {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setConnected(currentChainId === selectedChain.chain_id);
      }
    };

    checkConnectionStatus();
  }, [selectedChain]);

  useEffect(() => {
    (async () => {
      const fetchedChains = await fetchChains();
      setChains(fetchedChains);
    })();
  }, []);

  const addNetwork = async (chain: Chain) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chain.chain_id,
              chainName: chain.chain_name,
              rpcUrls: chain.rpc_urls,
              nativeCurrency: {
                name: chain.native_currency_name,
                decimals: chain.native_currency_decimals,
                symbol: chain.native_currency_symbol,
              },
            },
          ],
        });
        setIsConnected(true);
      } catch (error: any) {
        console.error('Error adding network:', error);
        console.log('Parameters passed to wallet_addEthereumChain:', {
          chainId: chain.chain_id,
          chainName: chain.chain_name,
          rpcUrls: chain.rpc_urls,
          nativeCurrency: {
            name: chain.native_currency_name,
            decimals: chain.native_currency_decimals,
            symbol: chain.native_currency_symbol,
                 },
        });
      }
    } else {
      alert('Ethereum provider not found');
    }
  };

const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const chainId = e.target.value;
  const selected = chains.find((chain) => chain.chain_id === chainId);
  setUserSelectedChain(selected || null);
};


const handleAddNetworkClick = () => {
  if (userSelectedChain) {
    addNetwork(userSelectedChain);
  }
};


  const getStatusTextAndColor = () => {
    const currentChainId = window.ethereum?.chainId;
    if (isConnected && selectedChain && selectedChain.chain_id === currentChainId) {
      return {
        text: `Connected: ${selectedChain.chain_name}`,
        color: 'text-green-500',
        icon: <CheckCircleIcon className="w-4 h-4 mr-2" />,
      };
    } else {
      return {
        text: 'Not connected',
        color: 'text-red-500',
        icon: <ExclamationCircleIcon className="w-4 h-4 mr-2" />,
      };
    }
  };

  const { text, color, icon } = getStatusTextAndColor();

  const [userSelectedChain, setUserSelectedChain] = useState<Chain | null>(null);


  return (
    <div className="flex flex-col items-start">
<select
  onChange={handleChainChange}
  value={userSelectedChain?.chain_id || ''}
  className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-10 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 mb-2 hover:border-gray-300 rounded transition duration-150 ease-in-out"
>

        <option value="">Select a chain</option>
        {chains.map((chain) => (
          <option key={chain.chain_id} value={chain.chain_id}>
            {chain.chain_name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddNetworkClick}
        disabled={!selectedChain}
        className={`inline-flex items-center px-4 py-2 border-2 border-white focus:outline-none transition-all duration-300 ease-in ${
          !selectedChain
            ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
            : 'bg-transparent text-white hover:bg-white hover:text-gray-700'
        } focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {children}
      </button>
      <p className={`mt-2 flex items-center ${color}`}>
        {icon}
        {text}
      </p>
    </div>
  );
};

export default AddNetworkButton;
