import { SwapButtonState } from 'pages/Swap/helpers/useSwapButtonState'
import { ReactNode } from 'react'
import { ThemedText, ButtonSize } from 'theme'
import { Trans } from '@lingui/macro'
import { ButtonError, ButtonPrimary } from 'components/Button'
import { Text } from 'rebass'
import { Token } from '@uniswap/sdk-core'
import { AutoRow } from 'components/Row'
import { GreyCard } from 'components/Card'
import { GpEther } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { useToggleWalletModal } from 'state/application/hooks'
import { AutoColumn } from 'components/Column'
import { ApproveButton, ApproveButtonProps } from 'pages/Swap/components/ApproveButton'
import * as styledEl from './styled'
import { WrapType } from 'hooks/useWrapCallback'
import { TransactionResponse } from '@ethersproject/providers'

export interface SwapButtonProps {
  swapButtonState: SwapButtonState
  chainId: number | undefined
  wrappedToken: Token
  handleSwap: () => void
  doSwap: () => void
  approveButtonProps: ApproveButtonProps
  onWrap?: () => Promise<TransactionResponse>
  wrapType: WrapType
  swapInputError?: ReactNode
}

export function SwapButton(props: SwapButtonProps) {
  const {
    swapButtonState,
    chainId,
    onWrap,
    wrappedToken,
    approveButtonProps,
    swapInputError,
    handleSwap,
    doSwap,
    wrapType,
  } = props
  const doWrap = () => onWrap && onWrap().catch((error) => console.error('Error ' + wrapType, error))
  const toggleWalletModal = useToggleWalletModal()

  const map: { [key in SwapButtonState]: JSX.Element } = {
    [SwapButtonState.swapIsUnsupported]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        <ThemedText.Main mb="4px">
          <Trans>Unsupported Token</Trans>
        </ThemedText.Main>
      </ButtonPrimary>
    ),
    [SwapButtonState.walletIsUnsupported]: (
      <ButtonError buttonSize={ButtonSize.BIG} id="swap-button" disabled={true}>
        <Text fontSize={20} fontWeight={500}>
          <Trans>Wallet Unsupported</Trans>
        </Text>
      </ButtonError>
    ),
    [SwapButtonState.wrapError]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        Wrap error {/*TODO: inconsistency with the original code*/}
      </ButtonPrimary>
    ),
    [SwapButtonState.shouldWrapNativeToken]: (
      <ButtonPrimary onClick={doWrap} buttonSize={ButtonSize.BIG}>
        <Trans>Wrap</Trans>
      </ButtonPrimary>
    ),
    [SwapButtonState.shouldUnwrapNativeToken]: (
      <ButtonPrimary onClick={doWrap} buttonSize={ButtonSize.BIG}>
        <Trans>Unwrap</Trans>
      </ButtonPrimary>
    ),
    [SwapButtonState.switchToWeth]: <styledEl.SwitchToWethBtn wrappedToken={wrappedToken} />,
    [SwapButtonState.feesExceedFromAmount]: <styledEl.FeesExceedFromAmountMessage />,
    [SwapButtonState.insufficientLiquidity]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Insufficient liquidity for this trade.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.zeroPrice]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Invalid price. Try increasing input/output amount.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.transferToSmartContract]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>
            Buying {GpEther.onChain(chainId || SupportedChainId.MAINNET).symbol} with smart contract wallets is not
            currently supported
          </Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.fetchQuoteError]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">
          <Trans>Error loading price. Try again later.</Trans>
        </ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.offlineBrowser]: (
      <GreyCard style={{ textAlign: 'center' }}>
        <ThemedText.Main mb="4px">Error loading price. You are currently offline.</ThemedText.Main>
      </GreyCard>
    ),
    [SwapButtonState.loading]: (
      <ButtonPrimary buttonSize={ButtonSize.BIG}>
        <styledEl.SwapButtonBox showLoading={true}></styledEl.SwapButtonBox>
      </ButtonPrimary>
    ),
    [SwapButtonState.walletIsNotConnected]: (
      <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={toggleWalletModal}>
        <styledEl.SwapButtonBox>Connect Wallet</styledEl.SwapButtonBox>
      </ButtonPrimary>
    ),
    [SwapButtonState.readonlyGnosisSafeUser]: (
      <ButtonPrimary disabled={true} buttonSize={ButtonSize.BIG}>
        <ThemedText.Main mb="4px">
          <Trans>Read Only</Trans>
        </ThemedText.Main>
      </ButtonPrimary>
    ),
    [SwapButtonState.needApprove]: (
      <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
        <AutoColumn style={{ width: '100%' }} gap="12px">
          <ApproveButton {...approveButtonProps}>
            <styledEl.SwapButtonBox>
              <Trans>Swap</Trans>
            </styledEl.SwapButtonBox>
          </ApproveButton>
        </AutoColumn>
      </AutoRow>
    ),
    [SwapButtonState.swapDisabled]: (
      <ButtonError buttonSize={ButtonSize.BIG} id="swap-button" disabled={true}>
        <styledEl.SwapButtonBox>{swapInputError || <Trans>Swap</Trans>}</styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.swapError]: (
      <ButtonError buttonSize={ButtonSize.BIG} id="swap-button">
        <styledEl.SwapButtonBox>{swapInputError}</styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.expertModeSwap]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={handleSwap} id="swap-button">
        <styledEl.SwapButtonBox>
          <Trans>Swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
    [SwapButtonState.regularSwap]: (
      <ButtonError buttonSize={ButtonSize.BIG} onClick={doSwap} id="swap-button">
        <styledEl.SwapButtonBox>
          <Trans>Swap</Trans>
        </styledEl.SwapButtonBox>
      </ButtonError>
    ),
  }

  return map[swapButtonState]
}
