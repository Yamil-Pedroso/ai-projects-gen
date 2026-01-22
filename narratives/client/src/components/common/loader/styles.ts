import styled, { keyframes } from "styled-components";

const flash = keyframes`
    0% {
        background-color: #FFF2;
        box-shadow: 32px 0 #FFF2, -32px 0 #FFF;
    }
    50% {
        background-color: #FFF;
        box-shadow: 32px 0 #FFF2, -32px 0 #FFF2;
    }
    100% {
        background-color: #FFF2;
        box-shadow: 32px 0 #FFF, -32px 0 #FFF2;
    }
`;

const move = keyframes`
100% {
    transform: translateX(80px);
}
`;

const clip = keyframes`
33% {
    clip-path: inset(0 0 0 -100px);
}
50% {
    clip-path: inset(0 0 0 0);
}
83% {
    clip-path: inset(0 -100px 0 0);
}
`;

export const Loader = styled.div`
  width: 20px;
  aspect-ratio: 1;
  background: #b4e021;
  box-shadow: 0 0 60px 15px #b4e021;
  transform: translate(-80px);
  clip-path: inset(0);
  animation: ${move} 0.5s ease-in-out infinite alternate, ${clip} 1s ease-in-out infinite;
`;

// Loader
export const LoaderAni = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 32px 0 #fff, -32px 0 #fff;
  position: relative;
  animation: flash 0.5s ease-out infinite alternate;

  animation: ${flash} 0.5s ease-out infinite alternate;
`;
