import { ConnectionType } from '@cow/modules/wallet'
import {
  getConnectionName,
  getIsZengoWallet,
  getIsAmbireWallet,
  getIsAlphaWallet,
} from '@cow/modules/wallet/api/utils/connection'
import { useIsActiveWallet } from 'hooks/useIsActiveWallet'
import { ConnectWalletOption } from '@cow/modules/wallet/api/pure/ConnectWalletOption'
import { TryActivation, onError } from '.'
import { useWalletMetaData } from '@cow/modules/wallet'

import { initializeConnector } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

import { RPC_URLS } from 'constants/networks'
import { Web3ReactConnection } from '../types'
import { default as WalletConnectV2Image } from '@cow/modules/wallet/api/assets/wallet-connect-v2.png'

import { WC_DISABLED_TEXT } from '@cow/modules/wallet/constants'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

export const walletConnectV2Option = {
  color: '#4196FC',
  icon: WalletConnectV2Image,
  id: 'wallet-connect-v2',
}

export const [web3WalletConnectV2, web3WalletConnectV2Hooks] = initializeConnector<WalletConnectV2>(
  (actions) =>
    new WalletConnectV2({
      actions,
      options: {
        projectId: WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID,
        chains: Object.keys(RPC_URLS).map(Number),
      },
      onError,
    })
)

export const walletConnectConnectionV2: Web3ReactConnection = {
  connector: web3WalletConnectV2,
  hooks: web3WalletConnectV2Hooks,
  type: ConnectionType.WALLET_CONNECT_V2,
}

export function WalletConnectV2Option({ tryActivation }: { tryActivation: TryActivation }) {
  const { walletName } = useWalletMetaData()

  const isWalletConnect = useIsActiveWallet(walletConnectConnectionV2)
  const isActive =
    isWalletConnect && !getIsZengoWallet(walletName) && !getIsAmbireWallet(walletName) && !getIsAlphaWallet(walletName)
  const tooltipText = !isActive && isWalletConnect ? WC_DISABLED_TEXT : null

  return (
    <ConnectWalletOption
      {...walletConnectV2Option}
      isActive={isActive}
      tooltipText={tooltipText}
      clickable={!isWalletConnect}
      onClick={() => tryActivation(walletConnectConnectionV2.connector)}
      header={getConnectionName(ConnectionType.WALLET_CONNECT_V2)}
    />
  )
}
