import React from 'react';
import './App.css';
import image from './base_suomi.png'

const canvasWidth = 1600
const canvasHeight = 2653
// const canvasWidth = 800
// const canvasHeight = 1325
const segmentDistance = 6
const redCircleSize = 3
const lightRed = '#EEEEEE'
// const lightRed = '#e3e3e3'

class Vector {
  x: number
  y: number
  id: number
  // active: boolean

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.id = Math.random()
    // this.active = true
  }

  added(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  multiply(value: number) {
    return new Vector(this.x * value, this.y * value)
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalized() {
    return this.multiply(1 / this.length())
  }

  perpendicular() {
    return new Vector(this.y, -this.x)
  }

  rotated(angle: number) {
    return new Vector(
      Math.cos(angle) * this.x - Math.sin(angle) * this.y,
      Math.sin(angle) * this.x + Math.cos(angle) * this.y,
    )
  }
}

const getRandomVector = (length: number) => {
  const randomNumber = Math.random();
  return new Vector(
    Math.sin(randomNumber * Math.PI * 2) * length,
    Math.cos(randomNumber * Math.PI * 2) * length,
  )
}

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = React.useState(false)

  React.useEffect(() => {
    if (imgRef.current !== null) {
      imgRef.current.onload = () => {
        setImgLoaded(true)
      }
    }
  }, [imgRef.current])

  React.useEffect(() => {
    console.log('asdf', canvasRef.current, imgRef.current, imgLoaded)
    if (canvasRef.current !== null && imgRef.current !== null && imgLoaded) {

      let itIsDone = false;

      let ctx = canvasRef.current.getContext('2d')!;

      let dots: Vector[] = [
        new Vector(canvasWidth / 2 - segmentDistance / 2, canvasHeight / 2 - segmentDistance / 2),
        new Vector(canvasWidth / 2 - segmentDistance / 2, canvasHeight / 2 + segmentDistance / 2),
        new Vector(canvasWidth / 2 + segmentDistance / 2, canvasHeight / 2 + segmentDistance / 2),
        new Vector(canvasWidth / 2 + segmentDistance / 2, canvasHeight / 2 - segmentDistance / 2),
      ];

      let nonOkDots: any = {};

      const drawPoint = (point: Vector, radius: number = 2, color: string = 'black') => {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.strokeStyle = color
        ctx.arc(
          Math.floor(point.x),
          Math.floor(point.y),
          radius,
          0,
          2 * Math.PI,
          false
        );
        ctx.fill();
        ctx.stroke();
      }

      const draw = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(imgRef.current!, 0, 0)

        dots.forEach((dot) => {
          drawPoint(dot, redCircleSize, lightRed)
        })
        // dots.forEach((dot) => {
        //   // if (dot.active) {
        //     drawPoint(dot, 1, 'black')
        //   // } else {
        //   //   drawPoint(dot, 1, 'red')
        //   // }
        // })

        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.moveTo(dots[0].x, dots[0].y);
        for (let i = 0; i < dots.length - 1; i++) {
          // if (!dots[i].active) {
          //   ctx.strokeStyle = 'red'
          // } else {
          //   ctx.strokeStyle = 'black'
          // }
          ctx.lineTo(dots[i + 1].x, dots[i + 1].y);
        }
        ctx.lineTo(dots[0].x, dots[0].y);
        ctx.stroke();
      }

      const smooth = () => {
        let newDots: Vector[] = []
        for (let i = 0; i < dots.length * 3; i ++) {
          const idxA = Math.floor((i + 0) / 3) % dots.length;
          const idxB = Math.floor((i + 3) / 3) % dots.length;
          const idxC = Math.floor((i + 6) / 3) % dots.length;
          newDots.push(
            dots[idxA].multiply(0.333)
              .added(dots[idxB].multiply(0.333))
              .added(dots[idxC].multiply(0.333))
          )
        }
        dots = newDots
      }

      const drawClear = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.moveTo(dots[0].x, dots[0].y);
        for (let i = 0; i < dots.length - 1; i++) {
          ctx.lineTo(dots[i + 1].x, dots[i + 1].y);
        }
        ctx.lineTo(dots[0].x, dots[0].y);
        ctx.stroke();
      }

      const pointIsOk = (point: Vector) => {
        if (point.x < 0 || point.y < 0 || point.x >= canvasWidth || point.y >= canvasHeight) {
          return false
        }

        try {
          const colorAtPoint = ctx.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1).data;

          return (
            colorAtPoint[0] === 255 &&
            colorAtPoint[1] === 255 &&
            colorAtPoint[2] === 255
          )
        } catch {
          debugger;
          console.log('asdf', ctx, point)
        }

        return false
        // console.log(
        //   'pointIsOk',
        //   colorAtPoint[0],
        //   colorAtPoint[1],
        //   colorAtPoint[2],
        // )

      }

      const getPossibleIndexes = () => {
        let possibleIndexes = []
        for (let i = 0; i < dots.length - 1; i ++) {
          if (nonOkDots[dots[i].id + dots[i + 1].id] === undefined) {
          // if (dots[i].active || dots[i + 1].active) {
            possibleIndexes.push(i)
          }
        }
        return possibleIndexes
      }

      const curateData = () => {
        // // const possibleIndexes = getPossibleIndexes()
        for (let index = 0; index < dots.length - 1; index ++) {
        // // possibleIndexes.forEach((index) => {
          const firstDot = dots[index];
          const secondDot = dots[(index + 1) % dots.length]
          if (nonOkDots[firstDot.id + secondDot.id] === true) {
            continue
          }

          const firstToSecond = firstDot.added(secondDot.multiply(-1)).multiply(0.5)
          const atMiddle = secondDot.added(firstToSecond)
          const perpendicular = firstToSecond.perpendicular().normalized()

          let directionVector = perpendicular.multiply(segmentDistance)
          let newTryPoint = atMiddle.added(directionVector)

          if (!pointIsOk(newTryPoint)) {
            directionVector = perpendicular.multiply(-segmentDistance)
            newTryPoint = atMiddle.added(directionVector)
            if (!pointIsOk(newTryPoint)) {
              nonOkDots[firstDot.id + secondDot.id] = true;
              // firstDot.active = false;
              // secondDot.active = false;
            } else {
              // firstDot.active = true;
              // secondDot.active = true;
            }
          } else {
            // firstDot.active = true;
            // secondDot.active = true;
          }
        }
      }

      const appendToDots = () => {
        const possibleIndexes = getPossibleIndexes()

        if (possibleIndexes.length == 0) {
          console.log('We are done :)')
          itIsDone = true;
          return
        }

        let firstDot = dots[0]
        let secondDot = dots[0]
        let randomDotIndex = 0;
        // do {
          randomDotIndex = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)]
          // randomDotIndex = Math.floor(Math.random() * dots.length);
          firstDot = dots[randomDotIndex];
          secondDot = dots[(randomDotIndex + 1) % dots.length]
          if (!firstDot || !secondDot) {
            debugger;
          }
        // } while (!firstDot.active || !secondDot.active)


        const firstToSecond = firstDot.added(secondDot.multiply(-1)).multiply(0.5)
        const atMiddle = secondDot.added(firstToSecond)
        const perpendicular = firstToSecond.perpendicular().normalized()

        let directionVector = perpendicular.multiply(segmentDistance)
        let newTryPoint = atMiddle.added(directionVector)

        let reverse = false
        if (!pointIsOk(newTryPoint)) {
          directionVector = perpendicular.multiply(-segmentDistance)
          newTryPoint = atMiddle.added(directionVector)
          reverse = true
        }
        if (!pointIsOk(newTryPoint)) {
          // firstDot.active = false
          // secondDot.active = false
          console.log('This point was no good')
          return;
        }

        let newPoints: Vector[] = [];
        let newPointsRight: Vector[] = [];
        for (let j = 0; j < 6; j++) { // Draw x steps
          const perpToDirection = directionVector.perpendicular().normalized()

          const p1 = newTryPoint.added(perpToDirection.multiply(segmentDistance / 2))
          const p2 = newTryPoint.added(perpToDirection.multiply(-segmentDistance / 2))

          if (!pointIsOk(p1) || !pointIsOk(p2)) {
            if (j == 0) {
              nonOkDots[firstDot.id + secondDot.id] = true
              console.log('This point was no good')
            }
            console.log('early stop')
            break
          }

          drawPoint(p1, redCircleSize, lightRed)
          drawPoint(p2, redCircleSize, lightRed)

          if (reverse) {
            newPoints.push(p1);
            newPointsRight.push(p2);
          } else {
            newPoints.push(p2);
            newPointsRight.push(p1);
          }
          //
          // drawPoint(p1, 2, 'green');
          // drawPoint(p2, 2, 'green');

          // currentDot = middlePoint
          directionVector = directionVector.rotated(Math.random() - 0.5)
          newTryPoint = newTryPoint.added(directionVector);
        }

        for (let j = 0; j < newPointsRight.length; j++) {
          newPoints.push(newPointsRight[newPointsRight.length - j - 1])
        }

        dots = [
          ...dots.slice(0, randomDotIndex + 1),
          ...newPoints,
          ...dots.slice(randomDotIndex + 1, dots.length)
        ]

        //   let directionVector = getRandomVector();
        //   let middlePoint = currentDot.added(directionVector);
        //
        //   const colorAtPoint = ctx.getImageData(middlePoint.x, middlePoint.y, 1, 1).data;
        //   // console.log('colorAtPoint', colorAtPoint[0], colorAtPoint[1], colorAtPoint[2]);
        //   // drawPoint(middlePoint, 2, 'green');
        //
        //   if (
        //     colorAtPoint[0] === 0 &&
        //     colorAtPoint[1] === 0
        //   ) { // Found good space. Lets draw
        //     console.log('guessed correct');
        //     // drawPoint(currentDot, 2, 'green');
        //     // drawPoint(middlePoint, 2, 'green');
        //
        //     let newPoints: Vector[] = [];
        //     let newPointsRight: Vector[] = [];
        //     for (let j = 0; j < 6; j ++) { // Draw x steps
        //     // [0, 1, 2, 3, 5, 6].forEach(() => { // Draw x steps
        //       const perpendicular = directionVector.perpendicular().normalized()
        //
        //       const p1 = middlePoint.added(perpendicular.multiply(5))
        //       const p2 = middlePoint.added(perpendicular.multiply(-5))
        //
        //       const colorAtP1 = ctx.getImageData(p1.x, p2.y, 1, 1).data;
        //       const colorAtP2 = ctx.getImageData(p1.x, p2.y, 1, 1).data;
        //
        //       if (
        //         j > 0 &&
        //         (
        //           colorAtP1[0] !== 0 ||
        //           colorAtP1[1] !== 0 ||
        //           colorAtP1[0] !== 0 ||
        //           colorAtP1[1] !== 0
        //         )
        //       ) {
        //         break
        //       }
        //
        //       newPoints.push(p2);
        //       newPointsRight.push(p1);
        //
        //       currentDot = middlePoint
        //       middlePoint = currentDot.added(directionVector);
        //       directionVector = directionVector.rotated(Math.random() - 0.5)
        //     }
        //
        //     for (let j = 0; j < newPointsRight.length; j++) {
        //       newPoints.push(newPointsRight[newPointsRight.length - j - 1])
        //     }
        //
        //     dots = [
        //       ...dots.slice(0, currentDotIndex),
        //       ...newPoints,
        //       ...dots.slice(currentDotIndex + 1, dots.length)
        //     ]
        //
        //     break;
        //   }
        //   console.log('guessing again');
      }

      draw()

      // for (let i = 0; i < 400; i ++) {
      //   appendToDots()
      //   draw()
      // }
      // draw()

      let counter = 0
      const doStuff = () => {
        counter += 1
        // draw()
        appendToDots()
        if (counter % 50 === 0) {
          draw()
        }
        if (counter % 20 === 0) {
          curateData()
        }
        if (!itIsDone) {
        // if (counter < 500) {
          window.setTimeout(() => {
            doStuff()
          }, 1)
        } else {
          // curateData()
          // draw()
          smooth()
          drawClear()
        }
      }
      window.setTimeout(() => {
        doStuff()
      }, 100)
    }
  }, [canvasRef.current, imgRef.current, imgLoaded])

  return (
    <div className="App">
      <h1>Line drawer</h1>
      <img ref={imgRef} src={image} />
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}/>
    </div>
  );
}

export default App;
