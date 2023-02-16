import { InjectedConnector } from '@web3-react/injected-connector'

export const CHAIN_IDS = {
  // testnet: 245022940,
  devnet: 245022926
}

const supportedChainIds = Object.values(CHAIN_IDS)
console.debug('supportedChainIds', supportedChainIds)

export const injected = new InjectedConnector({ supportedChainIds })
