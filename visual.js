'use strict';

// 이전에 했던 것들처럼 visual.js에서 Text, ParticleGroup 인스턴스를 생성해줄거임.
// 참고로 ParticleGroup 인스턴스에서 같은 좌표에 여러개의 Particle 인스턴스를 생성해줌.
import {
  Text
} from './text.js';

import {
  ParticleGroup
} from './particle-group.js';

const LINE_TOTAL = 10;

export class Visual {
  constructor() {
    // Text 인스턴스를 생성해 임시 캔버스를 만들거임.
    this.text = new Text();

    // 예전에 사용한 것과 똑같은 이미지를 로드해서 텍스쳐로 변환해서 담아놓음.
    // 텍스쳐에 관한 설명은 typo 1에 자세하게 정리해놓음.
    this.texture = PIXI.Texture.from('particle.png');

    // 색상값이 존재하는 픽셀의 좌표값에 여러개의 Particle인스턴스들을 생성해주는 ParticleGroup의 인스턴스들을 담아놓을 빈 배열
    this.particleGroups = [];

    // 마우스가 움직인 좌표값, 마우스의 반경(?) 즉, 마우스 지점 주변을 둘러싸는 일종의 영역값이 저장됨.    
    this.mouse = {
      x: 0,
      y: 0,
      radius: 10,
    };

    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  show(stageWidth, stageHeight, stage) {
    // 리사이징 후 show 메소드를 실행했을 때 이미 생성된 ParticleContainer가 있다면 
    // 리사이징 전에 생성된 이 ParticleContainer는 root container에서 제거해줌.
    // 참고로 removeChild 또한 PIXI.Container의 메소드중 하나임. 컨테이너 내부에 포함된 자식 요소를 제거하는 API
    // 따라서 PIXI 라이브러리에 속하는 메소드임. 
    if (this.container) {
      stage.removeChild(this.container);
    }

    // 리사이징된 브라우저에 맞게 텍스트 위치를 재설정하여 임시 캔버스에 다시 렌더해주고,
    // 색상값이 존재하는 픽셀의 좌표값들이 들어있는 배열이 this.pos에 할당될거임.
    this.pos = this.text.setText('R', 10, stageWidth, stageHeight);

    /**
     * new PIXI.ParticleContainer(maxSize, properties, batchSize, autoResize)
     * 
     * 참고로 ParticleContainer를 새로 생성할 때 전달할 paramter는 총 4개
     * 뒤에 두개는 여기서 사용되지 않았으니 공식문서에서 설명을 한 번 읽어보고,
     * 
     * maxSize는 이 컨테이너에 렌더할 수 있는 particle(sprite)의 최대 개수를 의미함.
     * 즉, 색상값이 존재하는 픽셀의 좌표값들의 각각 같은 자리에 10개(LINE_TOTAL)씩 Particle 인스턴스를 생성해야 되니까
     * '색상값이 존재하는 픽셀 개수 * LINE_TOTAL' 을 최대 개수로 지정함. 
     * 이 부분이 예전에 ParticleContainer 생성했던 것과 약간 다름.
     * 
     * properties는 밑에 전달한 option들을 담아놓은 객체를 의미함. 
     * 해당 ParticleContainer안에 addChild해줄 각각의 sprite들의 properties들을
     * upload해줄지 말지를 지정해 줌. 각각의 뜻은 공식문서 참고.
     */
    this.container = new PIXI.ParticleContainer(
      this.pos.length * LINE_TOTAL, {
        vertice: false, // 꼭지점 값은 필요없고
        position: true, // 위치값은 필요함. 왜? 각 sprite의 좌표값을 움직여서 이동시킬 거니까.
        rotation: false, // 회전값은 회전시킬 거 아니니까 필요없음
        scale: false, // 크기값은 크기 변경시킬 거 아니니까 필요없음
        uvs: false, // uv map? 같은것도 필요없고
        tint: true, // typo 6에서는 particle.js에서 sprite의 색상값을 각각 다르게 지정해줄 거니까 필요함.
        // 이런 식으로 필요한 값들은 true로 지정해서 ParticleContainer에 upload하고, 
        // 필요없는 값들은 false로 지정하면 sprite 객체의 값을 전달해주지 않음.
      }
    );

    // root container에 ParticleContainer를 추가함.
    /**
     * appendChild vs addChild
     * 
     * 둘은 아예 소속이 다른 API들임.
     * appendChild는 DOM에 요소를 추가할 때 사용하는 Web API
     * addChild는 Pixi.js에서 container에 요소를 추가할 때 사용하는 Pixi.js API
     * 
     * 어딘가에 자식 요소를 추가해준다는 점에서 비슷해 보이지만
     * 사실상 아예 다른 기능이라고 보면 됨.
     */
    stage.addChild(this.container);

    this.particleGroups = [];

    const total = this.pos.length;
    for (let i = 0; i < total; i++) { // 색상값이 존재하는 픽셀 개수만큼 for loop를 돌리고
      /**
       * 색상값이 존재하는 각 픽셀의 좌표값에 ParticleGroup 인스턴스를 생성함.
       * 
       * 이때 ParticleGroup 내에서 생성되는 Particle 인스턴스들의 Hue값을 정의하는 groupRatio는 i / total로 넣어줌.
       * i는 0 ~ total 사이이므로, groupRatio는 0 ~ 1 사이의 값이 들어갈거임.
       * 그러니 초반에 생성되는 ParticleGroup의 Hue값은 보라색 계열의 Margenta 컬러가,
       * 나중에 생성되는 ParticleGroup의 Hue값은 빨간색 계열의 Margenta 컬러에 가까운 값이 할당될거임.
       * 
       * ParticleGroup 내에서 같은 좌표에 생성되는 Particle 인스턴스들의 개수를 정의하는 lineTotal은
       * LINE_TOTAL값으로 넣어줌. 즉, 동일한 좌표에 10개의 Particle 인스턴스들이 생성될거임.
       * 
       * 즉, 동일한 좌표에 10개의 sprite들이 생성되어있는 상태로 item에 할당된 뒤, 
       * this.particleGroups에 저장되는 것임.
       */
      const item = new ParticleGroup(this.pos[i], i / total, this.texture, LINE_TOTAL);
      this.particleGroups.push(item); // 앞에서 생성한 ParticleGroup 인스턴스들을 차곡차곡 this.particleGroups에 저장해놓음.
    }

    for (let i = LINE_TOTAL - 1; i >= 0; i--) {
      // i값이 9(LINE_TOTAL - 1)에서 0이 될때까지, 즉 10번 for loop를 돌림으로써, 
      // 9 ~ 0까지의 i값을 전달하면서 this.addChild를 호출함.
      // 즉, 이 i값은 PartcleGroup 하나에 존재하는 particle 인스턴스들을 마지막 인덱스부터 처음 인덱스까지 내림차순으로 처리해주는 거겠지?
      this.addChild(i);
    }
  }

  addChild(index) {
    /**
     * addChild 메소드를 맨 처음 호출하면
     * 0번째 ParticleGroup 인스턴스 내에서 생성된 10개의 Particle 인스턴스들 중 마지막(9번) 인덱스의 Particle sprite를 렌더하고
     * ~
     * 마지막번째 ParticleGroup 인스턴스 내에서 생성된 10개의 Particle 인스턴스들 중 마지막(9번) 인덱스의 Particle sprite를 렌더함
     * 
     * 그리고 addChild를 두번째로 호출하면
     * 0번째 ParticleGroup 인스턴스 내에서 생성된 10개의 Particle 인스턴스들 중 8번 인덱스의 Particle sprite를 렌더하고
     * ~
     * 마지막번째 ParticleGroup 인스턴스 내에서 생성된 10개의 Particle 인스턴스들 중 8번 인덱스의 Particle sprite를 렌더함
     * 
     * 이런식으로 for loop안에서 addChild 메소드를 호출함으로써, 
     * 사실상 이중 for loop를 돌게 되면서
     * ParticleContainer에 미리 생성해놓은 수많은 Particle sprite들을 빠른 속도로 추가하여 렌더해 줌
     * 
     * 이전에는 그냥 하나의 for loop에서 sprite들을 ParticleContainer에 추가해줬다면
     * 여기에서는 이중 for loop를 돌면서 추가해준 것. 
     * 
     * 결과적으로 각각의 ParticleGroup 안에 존재하는 10개의 particle sprite들은
     * 마지막 인덱스부터 먼저 ParticleContainer에 추가되면서 내림차순으로 나머지 인덱스들이 추가될거임
     * 이걸 왜 이렇게 했냐면, 어둡고 큰 sprite들을 먼저 생성해서 뒤쪽에 배치하려고 한것임. particle-group.js에서 자세히 설명해놓음.
     */
    for (let i = 0; i < this.particleGroups.length; i++) {
      this.container.addChild(this.particleGroups[i].particles[index].sprite);
    }
  }

  animate() {
    // 원래는 visual.js의 animate 메소드에서 sprite들의 좌표값 변화량을 계산해줬는데
    // typo6에서는 이 계산 과정을 particle-group.js의 animate 메소드에서 대신 해주기 때문에
    // 여기서는 그냥 마우스가 움직인 좌표값 객체인 this.mouse만 전달해주면서 
    // 각 ParticleGroup 인스턴스들의 animate 메소드만 호출해주면 됨.
    for (let i = 0; i < this.particleGroups.length; i++) {
      const item = this.particleGroups[i];
      item.animate(this.mouse);
    }
  }

  // this.mouse에 마우스가 움직인 좌표값을 이벤트가 발생할 때마다 할당해줌
  onMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}