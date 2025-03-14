import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { interpolate } from "flubber";

const shapes = {
  circle: "M50,10 a40,40 0 1,1 0.1,0",
  square: "M10,10 H90 V90 H10 Z",
  triangle: "M10,90 H90 L50,10 Z"
};

const MorphingAnimation = () => {
  const [currentShape, setCurrentShape] = useState<keyof typeof shapes>("circle");
  const path = useMotionValue(shapes.circle);

  useEffect(() => {
    const nextShape =
      currentShape === "circle" ? "square" : currentShape === "square" ? "triangle" : "circle";

    const interpolator = interpolate(shapes[currentShape], shapes[nextShape], { maxSegmentLength: 2 });

    let frame = 0;
    const totalFrames = 60; // Ajusta para suavidad
    const animate = () => {
      const t = frame / totalFrames;
      path.set(interpolator(t));

      if (frame < totalFrames) {
        frame++;
        requestAnimationFrame(animate);
      }
    };
    animate();

    setCurrentShape(nextShape);
  }, [currentShape, path]);

  return (
    <div className="morph-container" onClick={() => setCurrentShape(currentShape)}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <motion.path
          d={path.get()}
          fill="none"
          stroke="lime"
          strokeWidth="5"
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <p>Click para cambiar de forma</p>
    </div>
  );
};

export default MorphingAnimation;
