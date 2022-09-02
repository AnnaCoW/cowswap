import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state/hooks'
import { useEffect, useMemo } from 'react'
import { initSwapStateFromUrl } from 'pages/NewSwap/helpers/initSwapStateFromUrl'
import { replaceSwapState } from 'state/swap/actions'
import { useTradeStateFromUrl } from 'pages/NewSwap/hooks/useTradeStateFromUrl'
import { useSwapState } from 'state/swap/hooks'

/**
 * The state is populated in a cascade:
 * 1. Try setting swap state from URL
 * 2. Try setting swap state from Redux cache (localStorage)
 * 3. Fill swap state by default values WETH/USDC
 *
 * Also, swap state updates on every location.search changes
 */
export function useSetupSwapState() {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const swapState = useSwapState()
  const persistedSwapState = useMemo(() => swapState, [])

  useEffect(() => {
    if (!chainId) return

    const swapState = initSwapStateFromUrl(chainId, tradeStateFromUrl, persistedSwapState)

    console.log('Set swap state from url: ', swapState)
    dispatch(replaceSwapState(swapState))
  }, [dispatch, tradeStateFromUrl, persistedSwapState, chainId])
}
