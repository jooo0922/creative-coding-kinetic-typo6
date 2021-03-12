'use strict';

// Particle 인스턴스를 이 모듈에서 생성하려는 것 같음.
import {
  Particle
} from './particle.js';

import {
  distance,
  pointCircle
} from './utils.js';

const DEFAULT_ANGLE = 90 * Math.PI / 180; // 90도의 라디안값
const GRAVITY = 0.3;
const VERTICAL_RATE = 0.3;
const MOUSE_PULL_RATE = 0.1;
const FRICTION = 0.97;
const MOUSE_MOVE_FRICTION = 0.7;

export class ParticleGroup {
  constructor(pos, groupRatio, texture, lineTotal) {
    this.particles = []; // 생성한 Particle 인스턴스들을 담아놓을 배열

    // for loop를 lineTotal 개수만큼 돌려서 Particle 인스턴스를 생성함.
    for (let i = 0; i < lineTotal; i++) {
      // Particle 인스턴스를 생성할 때 필요한 indexRatio는 i / lineTotal 값으로 구함.
      // i의 값은 0 ~ lineTotal 사이일테니, i / lineTotal의 값도 0 ~ 1사이겠지
      // indexRatio값을 제외한 나머지 parameter들은 모두 동일하게 전달해주기 때문에
      // for loop를 한 번 돌면, lineTotal 개수만큼 같은 좌표값에, 같은 Hue값에, 같은 texture인 sprite들이 생성되는데,
      // 이 sprite들은 오로지 scale과 light(indexRatio에 의해 결정되는 값들)만 다르게 생성될거임.
      // 이때 i값은 점점 늘어나므로, 나중에 생성된 sprite일수록, 크기도 커지고, 밝기도 어두워질거임.
      // 근데, 나중에 생성된 sprite일수록 크기도 커지고 어둡다면, 걔내들이 화면의 가장 앞쪽에 보여야하는 게 아닌가?
      // 실제 화면상에는 크기가 작고 밝은 애들이 앞쪽에 앞쪽에 보이는데?
      // 왜냐하면, visual.js의 show 메소드에서 이중 for loop를 돌면서 생성된 particle sprite들을 ParticleContainer에 추가할 때
      // 각각의 ParticleGroup의 마지막 인덱스부터 내림차순으로 addChild 해주기 때문에
      // 마지막 인덱스면 뭐야? 나중에 생성된 sprite지? 나중에 생성된 sprite가 더 크고 어둡다고 했지?
      // 그렇기 때문에 결과적으로 나중에 생성된 크고 어두운 sprite부터 ParticleContainer에 먼저 추가해줌으로써
      // 크고 어두운 sprite들일수록 뒤쪽에 배치되고, 밝고 작은 sprite들일수록 앞쪽에 배치된 모습으로 화면에 렌더되는 거임.
      const item = new Particle(pos, groupRatio, i / lineTotal, texture);
      this.particles.push(item); // 생성한 Particle 인스턴스들을 this.particles에 차곡차곡 push해놓음.
      // 정리하자면, this.particles에 push되는 순서는 '밝고 작은 sprite -> 어둡고 큰 sprite' 순서지만,
      // ParticleContainer에 addChild되서 렌더되는 순서는 '어둡고 큰 sprite -> 밝고 작은 sprite' 순서라고 보면 됨. 
    }
  }

  // 현재 프레임에서 마우스가 움직인 좌표값이 담긴 객체를 parameter로 넘겨줌
  animate(mouse) {
    const total = this.particles.length;

    // this.particles에 담긴 Particle 인스턴스의 개수만큼 for loop를 돌려서 각각의 인스턴스들에 대해 실행해 줌.
    for (let i = 0; i < total; i++) {
      const item = this.particles[i];

      // 각각의 particle sprite의 y좌표값 변화량에 0.3(GRAVITY)만큼을 더해줌.
      // 얘를 더해주지 않더라도 처음에 각 ParticleGroup의 sprite들이 렌더될 때 y방향으로 약간씩 차이가 나게 렌더되지만
      // 0.3을 더해줌으로써 그 차이의 폭을 더 넓혀준다고 보면 됨.
      // 또 참고로 마지막 인덱스의 sprite, 즉 가장 뒤쪽에 있는 어둡고 큰 sprite은 particle.js에서
      // 아예 this.vx,vy값이 this.x,y값에 더해지지도 않도록 처리해줬기 때문에 
      // GRAVITY값을 더해주건 말건 항상 같은 자리에 위치함
      item.vy += GRAVITY;

      // 그리고 각각의 sprite들의 현재 지점과 마우스의 현재 지점 사이의 거리가 80보다 작다면 
      // pointCircle에서 true를 반환해줘서 해당하는 sprite들에 한해서만 if block을 수행해 줌.
      if (pointCircle(item.x, item.y, mouse.x, mouse.y, 80)) {
        const pos = this.getPullPos(item.x, item.y, mouse.x, mouse.y);
        item.vx += pos.x;
        item.vy += pos.y;
        item.vx *= MOUSE_MOVE_FRICTION;
        item.vy *= MOUSE_MOVE_FRICTION;
      }
      // 참고로 각 sprite들의 vx, vy값이 어떻게 계산되는지 보려면
      // 지금 이 if block은 마우스와 거리가 80보다 가까운 애들에 한해서만 vx, vy값에 변화를 주는거기 때문에
      // 전체적인, 기본적인 sprite들의 vx, vy값 계산을 살펴보려면 얘를 제외하고 보는게 나을 듯 싶음. 

      // this.particles의 마지막 인덱스, 즉 마지막으로 생성된 Particle 인스턴스를 제외한
      // 나머지 인스턴스들에 대해서만 if block을 수행해 줌. 
      // 즉, 화면상에서 가장 뒤쪽에 위치한, 가장 어둡고 큰 sprite들만 제외함.
      if (i < total - 1) {
        const next = this.particles[i + 1]; // 현재의 particle 인스턴스 바로 뒤의 인스턴스를 next에 할당해 줌.
        this.setAngle(item, next, 0); // 현재 particle 인스턴스, 다음 particle 인스턴스, 라디안 0도를 parameter로 전달함.
        this.setAngle(next, item, Math.PI); // 다음 particle 인스턴스, 현재 particle 인스턴스, 라디안 180도를 parameter로 전달함.
        // 참고로 여기서 현재 particle 인스턴스일수록 화면 앞쪽에 렌더되고, next에 할당되는 particle 인스턴스 일수록 화면 뒤쪽에 렌더될거임.
      }

      // 얘는 감쇠 진동 공식에서 
      // '변화량 *= 마찰력'에 해당함.
      item.vx *= FRICTION;
      item.vy *= FRICTION;

      // 현재 particle 인스턴스의 인덱스와 this.particles의 마지막 인덱스값을 전달하면서
      // 현재 particle 인스터스의 animate 메소드를 호출함.
      // 마지막 Particle 인스턴스를 제외한 나머지 인스턴스들에 한해서는
      // 이 메소드를 호출함으로써 감쇠 진동 공식에서 '현재값 += 변화량' 부분이 계산되는 것.
      item.animate(i, total - 1);
    }
  }

  getPullPos(x1, y1, x2, y2) {
    // 각각의 sprite들의 현재 지점과 마우스의 현재 지점 사이의 거리가 80보다 작은 애들에 한해서
    // 해당 거리값을 다시 구해서 dist에 할당해놓음.
    const dist = distance(x1, y1, x2, y2);

    // 해당 sprite의 현재 지점과 마우스의 현재 지점을 연결한 벡터의 각도(기울기)를 구해놓음.
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 원점(0, 0)을 중심으로 반지름이 dist의 0.1배(MOUSE_PULL_RATE)인 원의 둘레상에서
    // 위에서 구한 sprite의 지점과 마우스의 현재 지점을 연결한 벡터 각도에 해당하는 원의 좌표를 구해서
    // 객체로 묶은 뒤 return해줌.
    // 즉, dist 반지름 상에서 반지름 길이의 0.1배만큼 sprite을 당겼을 때의 좌표값을 리턴해주는 거 같은데?
    const x = Math.cos(angle) * dist * MOUSE_PULL_RATE;
    const y = Math.sin(angle) * dist * MOUSE_PULL_RATE;
    return {
      x,
      y,
    };
  }

  setAngle(item1, item2, connectAngle) {
    /**
     * angle의 값
     * 첫 번째 호출: 0도의 라디안값 - 90도의 라디안값 = -90도의 라디안값
     * 두 번째 호출: 180도의 라디안값 - 90도의 라디안값 = 90도의 라디안값
     */
    const angle = connectAngle - DEFAULT_ANGLE;

    /**
     * 목표 좌표값을 계산해 줌.
     * (item1.x, item1.y)를 중심으로 반지름이 1인 원에서 angle에 해당하는 원의 좌표를 구해줌.
     * 
     * 첫 번째 호출: 현재 particle sprite의 좌표값을 원점으로 반지름이 1인 원에서 -90도(12시 방향)에 해당하는 원점의 좌표값이 tx, ty가 됨.
     * 두 번째 호출: 현재 particle sprite의 바로 뒤쪽에 렌더된 sprite의 좌표값을 원점으로 반지름이 1인 원에서 90도(6시 방향)에 해당하는 원점의 좌표값이 tx, ty가 됨.
     * 
     * 참고로, 얘내 두 sprite들은 현재로써는 같은 좌표값 상에서 생성된 애들이기 때문에, 원 자체는 서로 동일하다고 봐도 되고,
     * 동일한 원 상에서 -90도에 해당하는 원점의 좌표와 90도에 해당하는 원점의 좌표를 각각 할당해줬다고 보면 됨. 
     */
    const tx = item1.x + Math.cos(angle);
    const ty = item1.y + Math.sin(angle); // 참고로 반지름이 1이면 * 1 해야되지만 곱하기 1은 생략해줘도 됨.

    /**
     * 목표 좌표값을 현재값으로 하고, 두번째 parameter로 전달받은 Particle 인스턴스의 좌표값을 목표값으로 하는
     * 감쇠 진동 공식에서 '변화량 += (목표값 - 현재값) * 속도값' 부분에 해당함.
     * 
     * -첫 번째 호출 
     * 현재 particle sprite 바로 뒤쪽의 sprite의 좌표값(=현재 sprite의 좌표값)을 목표값으로 하고,
     * 해당 목표값에서 반지름 1 만큼의 거리차를 두고 -90도(12시 방향)에 존재하는 tx,ty를 현재값으로 하고,
     * VERTICAL_RATE(0.3)을 속도값으로 변화량에 할당해 줌.
     * 이에 따라 현재 sprite는 바로 뒤쪽에 렌더된 sprite의 좌표값을 향해서 점점 움직이게 될 것이고,
     * 바로 뒤쪽에 렌더된 sprite은 반대 방향으로 움직일거임.
     * 
     * -두 번째 호출 
     * 현재 particle sprite의 좌표값(=현재 sprite뒤의 sprite 좌표값)을 목표값으로 하고,
     * 해당 목표값에서 반지름 1 만큼의 거리차를 두고 90도(6시 방향)에 존재하는 tx,ty를 현재값으로 하고,
     * VERTICAL_RATE(0.3)을 속도값으로 변화량에 할당해 줌.
     * 이에 따라 현재 sprite뒤쪽의 sprite는 현재 sprite의 좌표값을 향해서 점점 움직이게 될 것이고,
     * 현재 sprite은 반대 방향으로 움직일거임.
     * 
     */
    const vx = (item2.x - tx) * VERTICAL_RATE;
    const vy = (item2.y - ty) * VERTICAL_RATE;
    item1.vx += vx;
    item1.vy += vy;
    item2.vx -= vx;
    item2.vy -= vy;
  }
}

// 아무래도 이 사람도 다른 사이트에서 구글링해서 위에 공식을 가져온 것 같은데 출처를 모르겠음.
// 기본적인 개념으로 이해할 수 있는 공식이 아닌 것 같다... 
// 나중에 비슷한 공식을 발견하게 되면 다시 복습해보자ㅠ