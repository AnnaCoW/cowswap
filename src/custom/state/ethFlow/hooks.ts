import { useAtomValue } from 'jotai/utils'
import { isUserNativeEthFlow } from './atoms'

import { useState } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useDetectNativeToken } from 'state/swap/hooks'

export function useIsUserNativeEthFlow() {
  return useAtomValue(isUserNativeEthFlow)
}

export function useShowNativeEthFlowSlippageWarning() {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const isNativeEthFlow = useIsUserNativeEthFlow()
  const { isNativeIn } = useDetectNativeToken({ currency: inputCurrency }, { currency: outputCurrency })

  return isNativeEthFlow && isNativeIn
}

export function useEthFlowActionHandlers() {
  // modal
  const [isModalOpen, setOpenNativeWrapModal] = useState(false)
  const openModal = () => setOpenNativeWrapModal(true)
  const closeModal = () => setOpenNativeWrapModal(false)

  return {
    openModal,
    closeModal,
    isModalOpen,
  }
}