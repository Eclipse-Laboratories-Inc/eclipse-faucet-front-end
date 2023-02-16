import { SetStateAction, useState } from 'react'
import Button from '../common/Button'
import { Input as NumericalInput } from '../common/NumericalInput'
import { Loader } from '../common/Loader'
import { useWeb3React } from '@web3-react/core'
import { TokenSelect } from './TokenSelect'
import { useHttp } from '../../utils/useHttp'
import { CircleTimer } from '../common/CircleTimer'
import { AxiosError } from 'axios'

import { FAUCET_URL, TOKEN_LIST } from '../../config'

export default function Form(props: any) {
  const {
    className = '', blocked = false, response = null, waiting = false,
    onResponse = () => {
    }
  } = props
  const { post } = useHttp()
  const { deactivate } = useWeb3React()
  const [amount, setAmount] = useState(0)
  const [token, setToken] = useState<any>({})
  const [isMaxAmountIncreased, setIsMaxAmointIncreased] = useState(false)
  const { account } = useWeb3React()

  const [airdropPending, setAirdropPending] = useState(false)

  const postAirdrop = () => {
    const url =
      token.symbol === 'NEON' ? `${FAUCET_URL}/request_neon` : `${FAUCET_URL}/request_erc20`

    const data =
      token.symbol === 'NEON'
        ? {
          amount,
          wallet: account
        }
        : {
          amount,
          wallet: account,
          token_addr: token.address
        }
    setAirdropPending(true)
    post(url, data)
      .then(() => {
        onResponse({
          success: true,
          details: 'Transferred successfully'
        })
      })
      .catch((err: AxiosError) => {
        const status = err.response?.status

        if (status === 502) {
          try {
            deactivate()
          } catch (error) {
            console.error(error)
          }
        }

        const details =
          err.response && err.response.statusText
            ? err.response.statusText
            : 'Server is not responsing'
        onResponse({
          success: false,
          details
        })
      })
      .finally(() => setAirdropPending(false))
  }

  const updateAmount = (value: SetStateAction<number>) => {
    if (value < 0) return
    if (value > 100) setIsMaxAmointIncreased(true)
    else setIsMaxAmointIncreased(false)
    setAmount(value)
  }

  return (
    <div className={`${className} tg-form relative`}>
      <h1 className='text-xl font-bold max-w-xs mb-8 leading-tight'>
        Choose token type and the amount to be airdropped.
      </h1>
      <div className='tg-form__amount'>
        <TokenSelect className='w-full mb-4' tokenName={token.name} onChoose={setToken} />
        <NumericalInput
          className={`w-full mb-4`}
          value={amount}
          error={isMaxAmountIncreased}
          token={token}
          onUserInput={updateAmount}
        />
      </div>
      <div className='flex flex-col'>
        <Button
          className='w-full'
          disabled={
            isMaxAmountIncreased ||
            amount === 0 ||
            blocked === true ||
            airdropPending === true ||
            (token.symbol !== 'NEON' && !token.address)
          }
          onClick={() => postAirdrop()}
        >
          <div className='flex items-center'>
            {airdropPending ? (
              <Loader className='mr-4 stroke-green fill-green h-6 w-6' />
            ) : waiting ? (
              <CircleTimer
                className='mr-4'
                isError={response?.success === false}
                size={22}
                duration={REQUEST_LIMIT_SEC}
                playing={waiting}
              />
            ) : null}
            <span>{'send test tokens'}</span>
          </div>
        </Button>
      </div>
      {isMaxAmountIncreased ? (
        <div className={`absolute top-full mt-4 text-sm`}>
          {'Maximum limit for one airdrop is 100 tokens per minute'}
        </div>
      ) : null}
    </div>
  )
}
