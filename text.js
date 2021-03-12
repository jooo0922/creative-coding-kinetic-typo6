'use strict';

export class Text {
  constructor() {
    // 그냥 픽셀 데이터만 가져오려고 만든 임시 캔버스.
    // 실제로 화면에 보여주는건 WebGL view에다가 할 거임.
    this.canvas = document.createElement('canvas');
    // this.canvas.style.position = 'absolute';
    // this.canvas.style.left = '0';
    // this.canvas.style.top = '0';
    // document.body.appendChild(this.canvas);
    // 임시로 만든 캔버스의 style 프로퍼티, DOM에 추가한 것은 나중에 삭제해줄 것

    this.ctx = this.canvas.getContext('2d');
  }

  // 리사이징될 때마다 변경된 사이즈를 가져와서 임시 캔버스에 텍스트를 새롭게 렌더해주고
  // 색상값이 존재하는 픽셀들의 좌표값 배열을 return 해주는 메소드
  setText(str, density, stageWidth, stageHeight) {
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    // 폰트 크기, 렌더해 줄 텍스트를 지정하고, Web Font Loader에서 가져온 폰트 굵기 및 폰트를 지정함.
    const myText = str;
    const fontWidth = 700;
    const fontSize = 800; // 폰트 크기를 800px로 지정. 실제 폰트 높이와는 다름.(폰트 크기가 더 큼)
    const fontName = 'Hind';

    // 리사이징 이전에 임시 캔버스에 남아있는 텍스트 싹 한번 지워주고 다시 새로운 위치에 렌더하려는 것
    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    this.ctx.font = `${fontWidth} ${fontSize}px ${fontName}`; // 렌더할 텍스트 스타일 지정. css font 프로퍼티와 동일 구문
    this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`; // 투명도 0.3 black으로 텍스트 렌더
    this.ctx.textBaseline = `middle`; // textBaseline은 고정. 텍스트 높낮이만 이동

    // 위에서 지정한대로 임시 캔버스에 렌더된 myText 안의 텍스트에 관한 정보가 담긴 TextMetrics 객체 리턴.
    const fontPos = this.ctx.measureText(myText);

    // TextMetrics 객체안의 값들을 이용해서 텍스트 x, y 좌표값 잡아줌
    this.ctx.fillText(
      myText,
      (stageWidth - fontPos.width) / 2, // 렌더할 텍스트의 x좌표값
      fontPos.actualBoundingBoxAscent +
      fontPos.actualBoundingBoxDescent +
      ((stageHeight - fontSize) / 2) // 렌더할 텍스트의 y좌표값
    );

    // 현재 텍스트가 렌더된 임시 캔버스에서 색상값을 가지는 픽셀들의 좌표값 배열을 리턴받는 메소드를 호출함.
    return this.dotPos(density, stageWidth, stageHeight);
  }

  dotPos(density, stageWidth, stageHeight) {
    // 임시 캔버스에 존재하는 모든 픽셀들의 색상데이터 배열을 가져와서 복사함
    const imageData = this.ctx.getImageData(
      0, 0,
      stageWidth, stageHeight
    ).data;

    const particles = []; // 색상값이 존재하는 픽셀들의 좌표값 객체를 담아놓을 곳.
    let i = 0;
    let width = 0;
    let pixel;

    // 모든 픽셀을 다 돌기 어려우니까 density 단위로 돌게 해줌.
    for (let height = 0; height < stageHeight; height += density) {
      ++i;
      const slide = (i % 2) == 0;
      width = 0;
      if (slide == 1) {
        width += 6;
      }
      // i가 홀수면 width는 0, i가 짝수면 width는 6으로 안쪽 for loop를 시작함.
      // 그래서 width값이 0과 6으로 번갈아가면서 for loop를 돌려줌.
      // 사실 width를 항상 0으로 시작해도 결과가 별 차이없이 잘 작동함.
      // 아무래도 성능이나 최적화 이슈 때문에 해준 것 같음.
      // 크게 신경쓸 건 없고, 여기서는 안쪽 for loop에서 정리한 comment의 내용만 잘 기억해두면 됨.  

      for (width; width < stageWidth; width += density) {
        // height - 1 번째 row까지의 픽셀 수를 전부 계산한 게 height * stageWidth
        // 여기에 height 번째 row상에서 width번째 까지의 픽셀 수를 더해준 게 (width + (height * stageWidth))
        // 여기에 4를 곱하면 (width + (height * stageWidth)) + 1 번째 픽셀의 r값에 해당하는 index
        // 여기에 -1을 빼주면 (width + (height * stageWidth)) 번째 픽셀의 alpha값(투명도)에 해당하는 index
        pixel = imageData[((width + (height * stageWidth)) * 4) - 1];

        // alpha값이 0이 아닌, 즉 색상값이 존재하고,
        // 현재 브라우저 사이즈 내에 위치하는 픽셀들의 좌표값을 particles 배열에 차곡차곡 push해줌.
        if (pixel != 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight) {
          particles.push({
            x: width,
            y: height,
            // 오타 조심하자! y값을 Y로 저장해버리면 다른 모듈에서 y로 불러오려고 하니까 
            // sprite이 화면에 생성이 안됬었음... 
            // 사소한 오타 하나 때문에 몇 시간을 허비함. 다시는 그러지 말자
          });
        }
      }
    }

    return particles; // 색상값이 존재하는 픽셀들의 좌표값이 담긴 배열을 리턴해 줌.
  }
}