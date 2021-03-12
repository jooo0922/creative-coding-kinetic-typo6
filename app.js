'use strict';

// 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
// 나중에 실제 WebGL 캔버스에 렌더할 때는 지워줄거임.
/*
import {
  Text
} from './text.js';
*/

import {
  Visual
} from './visual.js';

class App {
  constructor() {
    // Web Font를 로드하기 전에 this.setWebgl에서 
    // 가장 먼저 CDN으로 웹페이지에 임베드한 Pixi.js 라이브러리를 이용해
    // WebGL view canvas와 sprite 및 그래픽 객체들을 넣어 놓을 수 있는 root container를 생성함.
    this.setWebgl();

    // 윈도우가 로드되면 Web Font Loader Library에서 원하는 폰트를 로드해옴
    WebFont.load({
      google: {
        families: ['Hind:700']
      },
      fontactive: () => { // 폰트가 로드되서 렌더될 때 각각의 폰트에 대해 콜백을 수행하는 이벤트
        // 임시 캔버스에 텍스트가 어떻게 렌더되는지 보려고 테스트삼아 작성한 것.
        // 실제 WebGL 캔버스에 렌더할 때는 지워줄거임.
        /*
        this.text = new Text();
        this.text.setText(
          'A',
          2,
          document.body.clientWidth,
          document.body.clientHeight,
        );
        */

        // 폰트를 렌더하면 Visual 인스턴스를 새롭게 생성하여 particle sprite들을 생성하여 화면에 렌더할 준비를 함.
        this.visual = new Visual();

        // 폰트를 렌더하면 브라우저 창에 리사이징 이벤트를 걸어줌
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize(); // 폰트 렌더하면 this.resize 콜백 메소드를 한 번 실행시켜 줌

        requestAnimationFrame(this.animate.bind(this)); // 반복 호출해 줄 animate 메소드에도 애니메이션 걸어줌.
      }
    });
  }

  setWebgl() {
    // WebGL이 구동 가능한 canvas를 생성함.
    this.renderer = new PIXI.Renderer({
      width: document.body.clientWidth,
      height: document.body.clientHeight, // WebGL view canvas의 사이즈를 정해줌
      antialias: true, // 픽셀의 계단 깨짐 현상을 제거해줌
      transparent: false, // WebGL에 렌더되는 영역을 투명으로 해줄것인지 여부를 결정해 줌.
      resolution: (window.devicePixelRatio > 1) ? 2 : 1, // retina가 가능할 경우 캔버스의 픽셀 수를 2배로 늘림
      autoDensity: true, // resolution에서 지정한 해상도값에 따라 CSS pixel의 단위크기를 늘려줌. 캔버스의 scale 기능과 동일.
      powerPreference: "high-performance", // 듀얼 그래픽 카드 지원
      backgroundColor: 0xffffff, // WebGL view의 배경색이 아니라, WebGL에 렌더되는 영역(root container)의 색깔을 지정해 줌.
    });
    document.body.appendChild(this.renderer.view); // 생성한 WebGL view를 DOM에 추가해주면 화면에 나타남.

    this.stage = new PIXI.Container(); // root container를 생성해 줌
  }

  // 브라우저가 리사이징 될때마다 리사이즈된 크기를 가져와서 각각의 메소드에 전달해주면서 호출시킴.
  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    // PIXI.Renderer의 메소드인 resize는 
    // WebGL view를 파라미터로 전달받은 width, height만큼 resize함.
    // 리사이징된 크기만큼 WebGL view를 조절해 줌
    this.renderer.resize(this.stageWidth, this.stageHeight);

    // 리사이징 이벤트가 발생할 때마다 this.visual.show메소드를 호출하면
    // 임시 캔버스에 큰 문자가 렌더됨과 동시에 Particle 인스턴스들이 WebGL view에 렌더됨.
    this.visual.show(this.stageWidth, this.stageHeight, this.stage);
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); // 내부에서 호출해서 반복될 수 있도록 함.

    // sprite들이 마우스 움직임에 따라 좌표값이 변하도록 계산해주는 particle-group.js의 animate 메소드를
    // this.visual.animate()메소드에서 호출해주기 때문에 이걸 호출해주는 순간
    // 마우스 움직임에 따라 particle들이 움직일 수 있게 됨.
    this.visual.animate();

    // 이런 식으로 위에서 별도로 생성한 root container를
    // renderer 인스턴스에서 render 메소드의 parameter로 전달하면서 root container를 렌더해줘야 함.
    // PIXI.Application으로 했으면 한방에 처리할 수 있는 것을...
    // 지금 생각해보면 아무래도 매 프레임마다 root container를 render해주는 작업을 매번 해주려던 게 아닌가 싶음.
    // 그리고 WebGL view에 렌더되는 영역(this.stage 즉, root container)
    // 이 생김에 따라 PIXI.Renderer에서 지정한 backgroundColor가 적용되는 것을 볼 수 있음.
    this.renderer.render(this.stage);
  }
}

// onload는 일종의  Window, XMLHttpRequest, <img> element와 같은 GlobalEventHandlers의 property라고 할 수 있음.
// 이 property에 특정 함수를 할당하면, 해당 GlobalEventHandlers가 로드됬을 때 해당 함수를 호출하는 것
window.onload = () => {
  new App();
} // window.addEventListener('load', () => {}); 와 동일함.
// 기본적인 내용이지만 까먹기 쉬우므로 다시 한 번 정리함.