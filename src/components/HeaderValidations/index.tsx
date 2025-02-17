import { useRouter } from "next/navigation";
import * as S from "./styles";
import Image from "next/image";
import Logo from "../../../public/logo.png";
import { LogOut } from "lucide-react";

export default function HeaderValidations() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <S.HeaderContainer>
      <S.HeaderContent>
        <Image src={Logo} alt="Logo da Farm Rio" />
        <S.Logout onClick={handleLogout}>
          <LogOut /> Logout
        </S.Logout>
      </S.HeaderContent>
    </S.HeaderContainer>
  );
}
