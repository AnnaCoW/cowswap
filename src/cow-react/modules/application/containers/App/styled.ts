import * as CSS from 'csstype'

import styled from 'styled-components/macro'

export const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: 100vh;
`

export const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  z-index: 3;
`

export const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  width: 100%;
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  flex: auto;
  z-index: 2;
  // TODO: '5vh 0 0' : '5vh 0 240px'
  padding-top: 5vh;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: '0 0 16px';
`}
`