import type { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import Script from 'next/script'
import '../styles/globals.css'
import { ConfigProvider, theme } from 'antd'

// @ts-ignore
function getLibrary(provider) {
  return new Web3Provider(provider)
}
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* <Script src="https://www.google.com/recaptcha/api.js?render=explicit" strategy="afterInteractive" /> */}
      <Script src="/recaptcha.js" strategy="afterInteractive" />
      
      <Web3ReactProvider getLibrary={getLibrary}>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
          }}
        >
          <Component {...pageProps} />
        </ConfigProvider>
      </Web3ReactProvider>
    </>
  )
}

export default MyApp
