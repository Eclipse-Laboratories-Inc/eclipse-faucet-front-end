import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { SetStateAction, useRef, useState } from 'react'
import Form from './form'
import { injected } from '../../connectors'
import Button from '../common/Button'
import Warning  from '../../assets/warning.svg'
import { Notificator } from './notificator'
const REQUEST_LIMIT_SEC = 60


export default function TokenGetter() {
  /* { account, error, activate, deactivate, active } */
  const { activate, error, active } = useWeb3React()
  const [response, setResponse] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const responseTimeout = useRef(null)

  const updateResponse = (resp: SetStateAction<null>) => {
    setResponse(resp)
    setWaiting(true)
    responseTimeout.current = setTimeout(() => {
      setResponse(null)
      setWaiting(false)
    }, REQUEST_LIMIT_SEC * 1000)
  }

  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex, 'activation error')
    }
  }

  const renderByAccountState = () => {
    if (active) {
      return (
        <Form
          waiting={waiting}
          response={response}
          blocked={response !== null}
          onResponse={updateResponse}
        />
      )
    } else if (error) {
      if (error instanceof UnsupportedChainIdError) {
        return (
          <div className='flex flex-col px-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 flex items-center justify-center mr-4'>
                {/* <Warning /> */}
              </div>
              <div className='flex flex-col'>
                <div className='text-xl font-bold mb-1'>
                  Your wallet not connected to NEON Devnet
                </div>
                <div>
                  Please select the appropriate Ethereum network and try connecting the wallet again
                </div>
              </div>
            </div>
            <div className='pl-16 pt-6 flex flex-wrap'>
              <Button className='mr-4' layoutTheme='dark' onClick={connect}>
                Connect Wallet
              </Button>
              <Button transparent layoutTheme='dark' onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </div>
        )
      } else {
        return (
          <div className='flex items-center'>
            <div className='w-12 h-12 flex items-center justify-center mr-6'>
              <Warning />
            </div>
            <div className='mr-6 text-xl font-bold'>
              Check is your metamask wallet
              <br /> installed on Chrome as extension.
            </div>
            <Button transparent layoutTheme='dark' onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        )
      }
    } else {
      console.log("rendering connect")
      return (
        <div className='flex flex-col px-6 items-start'>
          <div
            className='text-2xl font-bold max-w-xl mb-12'>{`Neon's Faucet service will help you get NEON test tokens or other ERC-20 test tokens to be used for testing applications on devnet.`}</div>
          <div className='flex flex-wrap items-center'>
            <div className='flex flex-col mr-16 mb-4 sm:mb-0'>
              <div className='text-xl font-bold'>{`Let's get started:`}</div>
              <div>{`Connect your wallet`}</div>
            </div>
            <Button layoutTheme='dark' onClick={connect}>
              Connect Wallet
            </Button>
          </div>
        </div>
      )
    }
  }
  return (
    <>
      <div className={`w-full flex-grow flex flex-col justify-center margin-header`}>
        <div className='w-full max-w-1040px mx-auto'>{renderByAccountState()}</div>
      </div>
      {response?.details ? (
        <div className='absolute bottom-0 left-0 right-0'>
          <Notificator
            response={response}
            onClose={() => setResponse((prevState) => ({ success: prevState.success }))}
          />
        </div>
      ) : null}
    </>
  )
}
