import Bowser from 'bowser'

export const FAUCET_URL = process.env.NODE_ENV === 'development' ? '' : `https://api.${window.location.hostname}`

export const TOKEN_LIST = `https://raw.githubusercontent.com/neonlabsorg/token-list/v2.1.3/tokenlist.json`

export const REQUEST_LIMIT_SEC = 60

export const isMobile = () => {
  const browser = Bowser.parse(window.navigator.userAgent)
  return browser.platform.type === 'mobile'
}
