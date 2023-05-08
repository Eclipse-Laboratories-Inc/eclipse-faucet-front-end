import React, { useEffect, useState } from 'react'

interface RequestAirdropProps {
  account: string | undefined;
  rpcUrl: string;
}

const RequestAirdrop: React.FC<RequestAirdropProps> = ({ account, rpcUrl }) => {
  const [buttonStatus, setButtonStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [modifiedRpcUrl, setModifiedRpcUrl] = useState('');

const modifyRpcUrl = (url: string) => {
  const regex = /^(https?):\/\/(api)\.(.+)\.(\w+)\.(\w+)\/(solana)$/i;
  const modifiedUrl = url.replace(regex, '$1://faucet.$3.$4.$5/request_neon');
  console.log('Modified RPC URL:', modifiedUrl); 
  setModifiedRpcUrl(modifiedUrl);
};


  useEffect(() => {
    if (rpcUrl) {
      modifyRpcUrl(rpcUrl);
    }
  }, [rpcUrl]);

  async function requestAirdrop(address: string, amount: number): Promise<boolean> {
    try {
      const url = modifiedRpcUrl;
      const headers = {
        'Content-Type': 'application/json',
      }
      const body = JSON.stringify({
        wallet: address,
        amount: amount,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      })

      if (!response.ok) {
        console.error('Error requesting airdrop', response)
        return false
      }

      // Set buttonStatus to success when response is ok (status code 200)
      console.log('Airdrop successful')
      setButtonStatus('success')
      return true
    } catch (error) {
      console.error('Error requesting airdrop', error)
      setButtonStatus('error')
      return false
    }
  }

  const handleClick = async () => {
    if (buttonStatus === 'idle') {
      try {
        const accounts = (await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        })) as string[]

        const account = accounts[0]

        if (account) {
          console.log('Account address:', account)
          console.log(rpcUrl)
          setButtonStatus('sending')
          await requestAirdrop(account, 1)
          console.log('Airdrop requested for account:', account)
        } else {
          console.log('No account found.')
        }
      } catch (err: any) {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.')
        } else {
          console.error(err)
        }
        setButtonStatus('idle')
      }
    }
  }

  return (
    <button
      className={`send inline-flex items-center px-4 py-2 border-2 border-white text-sm font-medium ${
        buttonStatus === 'idle'
          ? 'bg-transparent text-white hover:bg-white hover:text-gray-700'
          : buttonStatus === 'sending'
          ? 'bg-yellow-500 text-white'
          : buttonStatus === 'success'
          ? 'bg-white text-gray-700 cursor-not-allowed'
          : 'bg-red-500 text-white'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 mb-2 transition-all duration-300 ease-in`}
      type="submit"
      onClick={handleClick}
      disabled={buttonStatus !== 'idle'}
    >
      <div className="w-full md:w-auto text-center">
        {buttonStatus === 'idle'
          ? 'Send tokens'
          : buttonStatus === 'sending'
          ? 'Sending...'
          : buttonStatus === 'success'
          ? 'Tokens sent, wait a few seconds for the transaction to complete.'
          : 'Error'}
      </div>
    </button>
  )
}

export default RequestAirdrop