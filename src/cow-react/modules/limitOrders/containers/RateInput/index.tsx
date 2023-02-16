import * as styledEl from './styled'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

import { HeadingText } from '@cow/modules/limitOrders/pure/RateInput/HeadingText'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import { getQuoteCurrency, getQuoteCurrencyByStableCoin } from '@cow/common/services/getQuoteCurrency'
import { useWeb3React } from '@web3-react/core'
import { getAddress } from '@cow/utils/getAddress'
import { useUpdateActiveRate } from '@cow/modules/limitOrders/hooks/useUpdateActiveRate'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { formatInputAmount } from '@cow/utils/amountFormat'
import QuestionHelper from 'components/QuestionHelper'
import { TooltipFeeContent } from '@cow/modules/limitOrders/pure/RateTooltip'
import { CurrencyAmount, Price } from '@uniswap/sdk-core'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { FiatAmount } from '@cow/common/pure/FiatAmount'

export function RateInput() {
  const { chainId } = useWeb3React()
  // Rate state
  const {
    isInversed,
    activeRate,
    isLoading,
    marketRate,
    feeAmount,
    isLoadingExecutionRate,
    typedValue,
    isTypedValue,
    initialRate,
  } = useAtomValue(limitRateAtom)
  const updateRate = useUpdateActiveRate()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const [isQuoteCurrencySet, setIsQuoteCurrencySet] = useState(false)

  // Limit order state
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const rateImpact = useRateImpact()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency
  const inputCurrencyId = inputCurrency?.symbol
  const outputCurrencyId = outputCurrency?.symbol

  const primaryCurrency = isInversed ? outputCurrency : inputCurrency
  const secondaryCurrency = isInversed ? inputCurrency : outputCurrency

  // Handle rate display
  const displayedRate = useMemo(() => {
    if (isTypedValue) return typedValue || ''

    if (!activeRate || !areBothCurrencies || activeRate.equalTo(0)) return ''

    const rate = isInversed ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [activeRate, areBothCurrencies, isInversed, isTypedValue, typedValue])

  // TODO: refactor the logic and move it to a hook
  const executionPrice = useMemo(() => {
    if (!inputCurrencyAmount || !outputCurrencyAmount || !feeAmount || !activeRate || !marketRate) return null

    if (inputCurrencyAmount.currency !== feeAmount.currency) return null

    const outputAmountMarket = inputCurrencyAmount.multiply(marketRate)

    const marketPrice = new Price({
      baseAmount: inputCurrencyAmount.add(feeAmount),
      quoteAmount: CurrencyAmount.fromFractionalAmount(
        outputCurrencyAmount.currency,
        outputAmountMarket.numerator,
        outputAmountMarket.denominator
      ),
    })

    const currentPrice = new Price({
      baseAmount: inputCurrencyAmount.add(feeAmount),
      quoteAmount: outputCurrencyAmount,
    })

    const price = currentPrice.greaterThan(marketPrice) ? marketPrice : currentPrice

    return isInversed ? price.invert() : price
  }, [feeAmount, activeRate, marketRate, inputCurrencyAmount, outputCurrencyAmount, isInversed])

  const executionPriceFiat = useHigherUSDValue(
    executionPrice && primaryCurrency
      ? executionPrice.quote(CurrencyAmount.fromRawAmount(primaryCurrency, 1 * 10 ** primaryCurrency.decimals))
      : undefined
  )

  // Handle set market price
  const handleSetMarketPrice = useCallback(() => {
    updateRate({
      activeRate: isFractionFalsy(marketRate) ? initialRate : marketRate,
      isTypedValue: false,
      isRateFromUrl: false,
    })
  }, [marketRate, initialRate, updateRate])

  // Handle rate input
  const handleUserInput = useCallback(
    (typedValue: string) => {
      updateLimitRateState({ typedValue })
      updateRate({
        activeRate: toFraction(typedValue, isInversed),
        isTypedValue: true,
        isRateFromUrl: false,
      })
    },
    [isInversed, updateRate, updateLimitRateState]
  )

  // Handle toggle primary field
  const handleToggle = useCallback(() => {
    updateLimitRateState({ isInversed: !isInversed, isTypedValue: false })
  }, [isInversed, updateLimitRateState])

  const isDisabledMPrice = useMemo(() => {
    if (isLoadingExecutionRate) return true

    if (!outputCurrencyId || !inputCurrencyId) return true

    if (marketRate && !marketRate.equalTo(0)) {
      return activeRate?.equalTo(marketRate)
    } else {
      return !!initialRate && activeRate?.equalTo(initialRate)
    }
  }, [activeRate, marketRate, isLoadingExecutionRate, initialRate, inputCurrencyId, outputCurrencyId])

  // Apply smart quote selection
  // use getQuoteCurrencyByStableCoin() first for cases when there are no amounts
  useEffect(() => {
    // Don't set quote currency until amounts are not set
    if (
      isQuoteCurrencySet ||
      isFractionFalsy(inputCurrencyAmount) ||
      isFractionFalsy(outputCurrencyAmount) ||
      !inputCurrency ||
      !outputCurrency
    ) {
      return
    }

    const quoteCurrency =
      getQuoteCurrencyByStableCoin(chainId, inputCurrency, outputCurrency) ||
      getQuoteCurrency(chainId, inputCurrencyAmount, outputCurrencyAmount)
    const [quoteCurrencyAddress, inputCurrencyAddress] = [getAddress(quoteCurrency), getAddress(inputCurrency)]

    updateLimitRateState({ isInversed: quoteCurrencyAddress !== inputCurrencyAddress })
    setIsQuoteCurrencySet(true)
  }, [
    isQuoteCurrencySet,
    chainId,
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    updateLimitRateState,
  ])

  // Reset isQuoteCurrencySet flag on currencies changes
  useEffect(() => {
    setIsQuoteCurrencySet(false)
  }, [inputCurrency, outputCurrency])

  return (
    <>
      <styledEl.Wrapper>
        <styledEl.Header>
          <HeadingText inputCurrency={inputCurrency} currency={primaryCurrency} rateImpact={rateImpact} />

          <styledEl.MarketPriceButton disabled={isDisabledMPrice} onClick={handleSetMarketPrice}>
            <span>Set to market</span>
          </styledEl.MarketPriceButton>
        </styledEl.Header>

        <styledEl.Body>
          <styledEl.ActiveCurrency onClick={handleToggle}>
            <styledEl.ActiveSymbol>
              <TokenSymbol token={secondaryCurrency} />
            </styledEl.ActiveSymbol>
            <styledEl.ActiveIcon>
              <RefreshCw size={12} />
            </styledEl.ActiveIcon>
          </styledEl.ActiveCurrency>

          {isLoading && areBothCurrencies ? (
            <styledEl.RateLoader />
          ) : (
            <styledEl.NumericalInput
              $loading={false}
              id="rate-limit-amount-input"
              value={displayedRate}
              onUserInput={handleUserInput}
            />
          )}
        </styledEl.Body>
      </styledEl.Wrapper>

      <styledEl.EstimatedRate>
        <b>
          Est. execution price{' '}
          <QuestionHelper
            text={
              <TooltipFeeContent
                feeAmount={feeAmount}
                displayedRate={displayedRate}
                executionPrice={executionPrice}
                executionPriceFiat={executionPriceFiat}
              />
            }
          />
        </b>
        <span>
          ≈ <TokenAmount amount={executionPrice} tokenSymbol={secondaryCurrency} />
          <i>
            (<FiatAmount amount={executionPriceFiat} />)
          </i>
        </span>
      </styledEl.EstimatedRate>
    </>
  )
}
