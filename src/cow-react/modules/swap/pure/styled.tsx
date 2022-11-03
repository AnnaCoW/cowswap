import styled from 'styled-components/macro'
import { RowBetween } from 'components/Row'
import { Info } from 'react-feather'

export const LowerSectionWrapper = styled(RowBetween).attrs((props) => ({
  ...props,
  align: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  minHeight: 24,
}))`
  > .price-container {
    display: flex;
    gap: 5px;
  }
`

export const BottomGrouping = styled.div`
  > div > button {
    align-self: stretch;
  }

  div > svg,
  div > svg > path {
    stroke: ${({ theme }) => theme.text2};
  }
`
export const LightGreyText = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.text4};
`

export const StyledInfo = styled(Info)`
  opacity: 0.4;
  color: ${({ theme }) => theme.text1};
  height: 16px;
  width: 16px;

  &:hover {
    opacity: 0.8;
  }
`
