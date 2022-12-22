export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const distance = (pointA: {x: number, y: number}, pointB: {x: number, y: number}) => {
    return Math.floor(Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2));
}

export const randomPosition = (rows = 30, columns = 26, blockSize = 10) => {
    const x = Math.floor(Math.random() * columns) * blockSize;
    const y = Math.floor(Math.random() * rows) * blockSize;
    return {x, y}
}