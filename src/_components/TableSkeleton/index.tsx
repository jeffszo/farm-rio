

"use client";

import * as S from "./styles";

export default function TableSkeleton() {
  return (
    <S.SkeletonContainer>
      {/* Simula o cabeçalho da tabela */}
      <S.SkeletonHeader>
        <S.SkeletonCell />
        <S.SkeletonCell />
        <S.SkeletonCell />
        <S.SkeletonCell />
      </S.SkeletonHeader>

      {/* Simula linhas da tabela */}
      {Array.from({ length: 10 }).map((_, index) => (
        <S.SkeletonRow key={index}>
          <S.SkeletonCell />
          <S.SkeletonCell />
          <S.SkeletonCell />
          <S.SkeletonCell />
        </S.SkeletonRow>
      ))}
    </S.SkeletonContainer>
  );
}
