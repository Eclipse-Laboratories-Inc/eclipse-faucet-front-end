import { ReactComponent as SuccessIcon } from '../../assets/success.svg'
import { ReactComponent as ErrorIcon } from '../../assets/error.svg'
import { ReactComponent as CrossIcon } from '../../assets/cross.svg'

export const Notificator = (data) => {
  const {
    response = { success: true, details: null },
    onClose = () => {
    }
  } = data
  return <div
    className={`p-3 w-full relative ${response.success === true ? 'bg-green text-black' : 'bg-error-red text-white'}`}>
    <div
      className='absolute top-0 bottom-0 w-6 h-6 right-6 flex items-center justify-center m-auto cursor-pointer'
      onClick={onClose}>
      <CrossIcon className={`${response.success === false ? 'fill-white' : 'fill-black'}`} />
    </div>
    <div className='max-w-1040px mx-auto'>
      {response.success === true ?
        <div className='w-7/12 pr-8 flex items-center'>
          <div className='w-8 h-8 mr-4'>
            <SuccessIcon />
          </div>
          <div className='flex flex-col'>
            <h2 className='font-bold'>{response.details}</h2>
            <p className='text-sm'>
              {'Next request will be unlock after minute expiration for a security reasons'}
            </p>
          </div>
        </div> :
        <div className='max-w-xl flex items-center'>
          <div className='w-8 h-8 mr-4'>
            <ErrorIcon />
          </div>
          <div className='flex flex-col'>
            <h2 className='font-bold'>{response.details}</h2>
            <p className='text-sm'>
              {'Next request will be unlock after minute expiration for a security reasons'}
            </p>
          </div>
        </div>}
    </div>
  </div>
}
