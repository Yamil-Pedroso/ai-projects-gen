export const getRandomPosition = (boxSize: number) => {
    const maxWidth = window.innerWidth - boxSize;
    const maxHeight = window.innerHeight - boxSize;

    const randomX = Math.max(0, Math.floor(Math.random() * maxWidth));
    const randomY = Math.max(0, Math.floor(Math.random() * maxHeight));

    return { x: randomX, y: randomY };
  };
