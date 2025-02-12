import * as S from './styles'

export default function Footer()  {
  return (
    <S.FooterContainer>
      <p>&copy; FARM Rio {new Date().getFullYear()} </p>
    </S.FooterContainer>
  )
}


