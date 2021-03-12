'use strict';

import {
  hslToHex
} from './utils.js';

export class Particle {
  constructor(pos, groupRatio, indexRatio, texture) {
    this.sprite = new PIXI.Sprite(texture); // parameter로 전달받은 loaded texture를 이용해서 sprite을 만듦. 

    // scale의 공식에 따라 scale의 최솟값이 minScale로 나오고
    // 최댓값이 maxScale로 나오려면 indexRatio는 0 ~ 1사이의 값으로 전달받아야 할 것 같음.
    // 어쨋든 위에서 생성한 sprite의 크기를 조절할 때 최솟값은 0.3배, 최댓값은 0.6배로 하게 될거임. 
    const minScale = 0.3;
    const maxScale = 0.6;
    const scale = (maxScale - minScale) * indexRatio + minScale;
    this.sprite.scale.set(scale);
    /**
     * Pixi에서 sprite의 크기를 조절하는 방법
     * 
     * 1. this.sprite.width, this.sprite.height에 px 단위의 값을 할당하여 사이즈를 절대값으로 지정해준다.
     * 
     * 2. this.sprite.scale.x, this.sprite.scale.y로 x축과 y축 방향으로 상대적인 비율을 변화시킨다.
     * 0에서 1사이의 수를 넣어주되, 0는 현재 사이즈의 0%, 1은 현재 사이즈의 100%. 두 배로 늘리려면 2를 넣어줄 것.
     * 
     * 3. this.sprite.scale.set(num, num) 으로 작성하면 2번에서 두 줄로 작성할 것을 한 줄로 작성해줄 수 있다.
     */

    // scale값과 마찬가지로 indexRatio값에 따라
    // 60 ~ 40 사이의 명도값을 할당받을거임. scale과 같은 indexRatio를 공식에서 사용하기 때문에
    // scale값과 비례하게 명도값이 나올거임. 즉, sprite의 크기가 작을수록 밝은 명도, 클수록 어두운 명도.
    const minLight = 60;
    const maxLight = 40;
    const light = (maxLight - minLight) * indexRatio + minLight;

    // hue값은 groupRatio값에 따라
    // 280 ~ 330 사이의 채도값으로 할당받을거임. indexRatio와는 구별되는 값이긴 하지만,
    // hue값을 구하는 공식 구조를 보면 groupRatio도 0 ~ 1 사이의 값으로 할당될거 같음.
    const minHue = 280; // 보라색에 가까운 Margenta 컬러
    const maxHue = 330; // 빨강색에 가까운 Margenta 컬러
    const hue = (maxHue - minHue) * groupRatio + minHue;

    // hslToHex 함수로 리턴받은 값을 sprite의 색상값으로 할당해 줌. 
    // 색상, 명도는 각각 위에서 계산된 hue, light값으로 넣어주고, 채도는 항상 84%로 넣어줌.
    // 근데 hslToHex는 10진수를 return하는데 tint에 넣어도 되나? 공식 API 문서에는 tint는 16진수값만 받는다고 되어있는데?
    // 일단 계속 코드를 작성해보고, 만약에 색상값이 잘 적용된다면 아예 10진수값을 바로 넣어서 테스트해볼 것.
    // 그게 된다면 tint 메소드는 10진수값도 받을 수 있는거임.
    this.sprite.tint = hslToHex(hue, 84, light);

    this.x = pos.x;
    this.y = pos.y; // this.x,y는 매 프레임마다 변화할 x,y좌표값
    this.sprite.x = this.x;
    this.sprite.y = this.y; // this.x,y는 결국 sprite의 x,y좌표값이 될거임.

    this.vx = 0;
    this.vy = 0; // this.x,y 각각에 매 프레임마다 더해줄 변화량
  }

  // 이 메소드는 마지막 particle-group상에서 마지막 Paritcle 인스턴스의 sprite은 가만히 두고,
  // 그 전의 sprite들만 this.vx,vy값을 this.x,y에 더해줌으로써 움직이게 만듦.
  animate(index, total) {
    // 현재 particle 인스턴스의 인덱스와, 마지막 particle인스턴스의 인덱스값을 전달받은 뒤, 
    // 현재 particle 인스턴스가 마지막 particle 인스턴스의 인덱스보다 작을때만 if block을 수행하여
    // particle-group에서 계산해 준 this.vx, vy 변화량을 this.x,y에 더해줌.
    // 즉, 마지막 particle 인스턴스에 대해서만 if block을 수행하지 않기 때문에,
    // 마지막 particle 인스턴스는 변화량을 더해주지 않게 되고, 결국 마지막 sprite는 움직이지 않게 될거임.
    // 즉, 화면상에서 가장 뒤쪽에 위치한, 가장 어둡고 큰 sprite들만 움직이지 않게 될거임.
    if (index < total) {
      this.x += this.vx;
      this.y += this.vy;
    }
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}