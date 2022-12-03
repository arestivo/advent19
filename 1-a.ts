export{}

const reader = require('readline').createInterface(process.stdin)

const masses: number[] = []
reader.on('line', (line: string) => masses.push(parseInt(line)))

reader.on('close', () => console.log(masses.reduce((sum: number, mass: number) => sum + fuel(mass), 0)))
const fuel = (mass: number) => Math.floor(mass / 3) - 2