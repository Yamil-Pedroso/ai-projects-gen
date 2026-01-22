export const getRandomBgGrayColor = () => {
    const minColor = 0;
    const maxColor = 255;
    const randomColor = Math.floor(Math.random() * (maxColor - minColor + 1) + minColor);
    return `rgb(${randomColor}, ${randomColor}, ${randomColor})`;
  }
