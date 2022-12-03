export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

const pattern = [0, 1, 0, -1]

let input : string  
reader.on('line', (line: string) => input = line)

reader.on('close', () => { 
  for (let p = 0; p < 100; p++) input = phase(input)
  console.log(input.substr(0, 8))
})

const phase = (input : string) => calc(input.split('').map(d => parseInt(d)))
const calc = (digits : number[]) => digits.map((d, i) => digit(i, digits)).map(n => last(n)).join('')
const last = (number : number) => parseInt(number.toString().substr(-1))
const digit = (position: number, digits : number[]) => digits.reduce((total, digit, index) => total + digit * multiplier (position, index), 0)
const multiplier = (iteration: number, position: number) => pattern[(Math.floor((position + 1) / (iteration + 1))) % 4]