export const getRandomSize = () => {
    const minSize = 2;
    const maxSize = 15;
    const randomSize = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    return randomSize * parseFloat(getComputedStyle(document.documentElement).fontSize); // Convert rem to px
  };
