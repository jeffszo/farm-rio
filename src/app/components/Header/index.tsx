import * as S from "./styles";
import Image from "next/image";
import Logo from "../assets/logo.png"

export default function Header() {
  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <Image src={Logo} alt="Logo da Farm Rio" />
      </S.HeaderContent>
    </S.HeaderContainer>
  );
}
