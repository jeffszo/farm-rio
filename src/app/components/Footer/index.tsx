import * as S from './styles'

export default function Footer()  {
  return (
    <S.FooterContainer>
      <p>&copy; {new Date().getFullYear()} FARM Rio. Todos os direitos reservados.</p>
    </S.FooterContainer>
  )
}


