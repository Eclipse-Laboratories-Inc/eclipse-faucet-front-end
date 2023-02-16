import { useTokensContext } from '../../contexts/tokens'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader } from '../common/Loader'
import stub from '../../assets/no_symbol.svg'
import DdIcon from '../../assets/dropdown.svg'
import { useOnClickOutside } from '../../hooks'

export const TokenSymbol = ({ src = '', alt = '' }) => {
  const imgRef = useRef(null)

  const [failed, setFailed] = useState(false)

  const currentSource = useMemo(() => {
    if (failed === true) return stub
    else return src
    // eslint-disable-next-line
  }, [failed, src])

  const handleError = () => {
    setFailed(true)
  }

  useEffect(() => {
    setFailed(false)
  }, [src])

  useEffect(() => {
    if (!imgRef.current) return
    const { current } = imgRef
    current.onerror = handleError
    return () => (current.onerror = null)
  }, [])

  return (
    <>
      <img className='w-full h-full' ref={imgRef} src={currentSource} alt={alt} />
    </>
  )
}

const TokenRow = (data: any) => {
  const {
    token = { logoURI: '', symbol: '', address: '', name: '' },
    onClick = () => {
    },
    active
  } = data
  const { balances } = useTokensContext()

  return (
    <div className={`flex px-4 py-2 justify-between dark:text-white hover:bg-dark-hover-inputs cursor-pointer`}
         onClick={onClick}>
      <div className='flex items-center flex-grow pr-4'>
        <div className='w-6 max-w-6 min-h-6 h-6 max-h-6 min-h-6 mr-4'>
          <TokenSymbol src={token.logoURI} alt={token.name} />
        </div>

        <div className='flex-grow flex flex-col'>
          <div className={active ? 'text-green' : 'text-base'}>{token.symbol}</div>
          <div className='text-sm text-gray-500'>{token.name}</div>
        </div>
      </div>
      <div className='flex-grow pl-4 text-sm flex items-center justify-end'>
        <div className='flex flex-col items-end'>
          {balances ? JSON.stringify(balances[token.symbol]) : null}
        </div>
      </div>
    </div>
  )
}

export const TokenSelect = (props: any) => {
  const {
    className = '', tokenName = '', onChoose = () => {
    }
  } = props
  const bodyRef = useRef<HTMLDivElement>(null)
  const { list, pending, error } = useTokensContext()
  const [opened, setOpened] = useState<any>()
  const [searchQuery, setSearchQuery] = useState('')
  const activeToken = useMemo(() => {
    return list.find((item) => item.name === tokenName)
  }, [list, tokenName])


  useOnClickOutside(bodyRef, () => {
    setOpened(false)
  })

  const isSPLToken = ({ name, symbol, address, address_spl }) => {
    const fs = searchQuery.toLowerCase();

    return name.toLowerCase().includes(fs) ||
      symbol.toLowerCase().includes(fs) ||
      address.toLowerCase() === fs ||
      address_spl.toLowerCase() === fs;
  };

  const filteredList = useMemo(() => {
    return searchQuery.length ? list.filter(item => isSPLToken(item)) : list
    // eslint-disable-next-line
  }, [list, searchQuery])

  return <div className={`flex flex-col relative ${className}`} ref={bodyRef}>
    <div
      className={`px-4 py-3 cursor-pointer bg-dark-600 hover:bg-dark-hover-inputs rounded-lg
      flex items-center justify-between ${opened ? 'bg-dark-hover-inputs' : null} ${tokenName ? 'bg-dark-hover-inputs' : null}`}
      onClick={() => setOpened(!opened)}>
        <span className='h-6'>
          {tokenName ? (
            <span className='inline-flex items-center'>
              <div className='w-6 max-w-6 min-h-6 h-6 max-h-6 min-h-6 mr-4'>
                <TokenSymbol src={activeToken.logoURI} alt={activeToken.name} />
              </div>
              <span>{activeToken.name}</span>
            </span>
          ) : (
            'Choose Token'
          )}
        </span>
      <DdIcon className={`fill-white ${opened ? 'transform rotate-180' : ''}`} />
    </div>
    {opened === true ? (
      <div className='absolute w-full top-full z-10 mt-2'>
        <div
          className={'w-full bg-dark-600 rounded-b-lg top-full rounded-t-lg z-20'}
        >
          <div className='h-14 border-b border-white'>
            <input
              type="text"
              className='h-full bg-transparent outline-none px-4 py-2 w-full'
              value={searchQuery}
              placeholder='Search token...'
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
            />
          </div>
          <div className={'overflow-y-auto w-full max-h-[240px]'} style={{ maxHeight: '240px' }}>
            {filteredList && !error && filteredList.length && !pending ? (
              filteredList.map((token) =>
                <TokenRow active={token.name === tokenName} token={token} key={token.name} onClick={() => {
                  onChoose(token)
                  setOpened(false)
                }} />)
            ) : pending ? (
              <div className='p-4 flex items-center'>
                <Loader />
                <span className='ml-4 text-lg'>Updating token list, please wait...</span>
              </div>
            ) : error ? (
              <div className='flex p-4 flex-col'>
                <div className='text-lg mb-4'>Error getting token list</div>
                <div className='text-gray-600'>{error}</div>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    ) : null}
  </div>
}
