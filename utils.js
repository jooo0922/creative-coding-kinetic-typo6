'use strict';

// 두 점 (x1, y1)과 (x2, y2) 사이의 거리값을 리턴해주는 함수
export function distance(x1, y1, x2, y2) {
  const x = x2 - x1;
  const y = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

// 두 점 (px, py)와 (cx, cy) 사이의 거리값이 
// r보다 같거나 작으면 true를, r보다 크면 false를 리턴해주는 함수.
// 두 점이 뭔지는 아직 모르기 때문에 왜 사용되는 건지는 아직 모름...
export function pointCircle(px, py, cx, cy, r) {
  if (distance(px, py, cx, cy) <= r) {
    return true;
  } else {
    return false;
  }
}

// HSL 색상값을 RGB 색상값으로 변환하고, 그걸 16진수(hexcode)로 변환 가능한 10진수로 리턴해주는 함수
// typo4의 utils.js에 잘 정리되어 있음. 북마크한 자료랑 같이 참고할 것. 
export function hslToHex(h, s, l) {
  // s, l(채도, 명도)는 원래 0% ~ 100%의 값이므로 100으로 나눠 퍼센트 단위로 바꿔준 것.
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s; // 다음으로 색도(color intensity)값을 계산하는 공식이라 함.
  let x = c * (1 - Math.abs((h / 60) % 2 - 1)); // 색도 다음으로 두번째로 큰 성분을 계산한 거라는데..?
  let m = l - c / 2; // 각 r,g,b 채널에 더해줘서 명도값을 match해주려는 값이라고 함.

  // r, g, b값들을 각각 초기화하고
  let red = 0;
  let green = 0;
  let blue = 0;

  if (0 <= h && h < 60) {
    red = c;
    green = x;
    blue = 0;
  } else if (60 <= h && h < 120) {
    red = x;
    green = c;
    blue = 0;
  } else if (120 <= h && h < 180) {
    red = 0;
    green = c;
    blue = x;
  } else if (180 <= h && h < 240) {
    red = 0;
    green = x;
    blue = c;
  } else if (240 <= h && h < 300) {
    red = x;
    green = 0;
    blue = c;
  } else if (300 <= h && h < 360) {
    red = c;
    green = 0;
    blue = x;
  }
  // 이런 식으로 하나의 채널만 0으로 남기고 나머지에는 각각 c, x를 할당해줌.

  // 최종 RGB 값을 얻으려면 m값을 각각 더해주고 255롤 곱해줘야 명도가 맞춰진 red, green, blue값이 나온다고 함.
  red = red + m;
  green = green + m;
  blue = blue + m;

  // 비트 왼쪽 시프트 연산자를 이용해서 이진수 연산으로 red, green, blue를 모두 더해준 뒤 10진수 값으로 리턴해 줌.
  // 이 값을 다른 모듈에서 리턴받아서 16진수로 변환해서 색상값을 할당해줄 것 같음.
  return ((red * 255) << 16) + ((green * 255) << 8) + ((blue * 255) | 0);
}