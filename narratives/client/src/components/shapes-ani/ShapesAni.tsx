import { useEffect, useState } from "react";
import {
    getRandomSize,
    getRandomPosition,
    getRandomBgGrayColor,
  } from "../../utils";

  const BOX_COUNT = 10;

const ShapesAni = () => {
     const [boxes, setBoxes] = useState(() =>
        Array.from({ length: BOX_COUNT }).map(() => ({
          size: getRandomSize(),
          position: getRandomPosition(100),
          backgroundColor: getRandomBgGrayColor(),
        }))
      );

      useEffect(() => {
        const interval = setInterval(() => {
          setBoxes((prevBoxes) =>
            prevBoxes.map(() => ({
              size: getRandomSize(),
              position: getRandomPosition(100),
              backgroundColor: getRandomBgGrayColor(),
            }))
          );
        }, 10000);

        return () => clearInterval(interval);
      }, []);


  return (
    <div>
        {
        boxes.map((box, index) => (

          <div
            key={index}
            style={{
              width: `${box.size}px`,
              height: `${box.size}px`,
              backgroundColor: box.backgroundColor,
              opacity: 0.5,
              position: "absolute",
              top: box.position.y,
              left: box.position.x,
              transition: "top 1s ease-in-out, left 1s ease-in-out, width 1s ease-in-out, height 1s ease-in-out, background-color 1s ease-in-out",
              zIndex: -1,
            }}
            className=""
          ></div>
        ))
      }
    </div>
  )
}

export default ShapesAni
