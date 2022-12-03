export{}

const reader = require('readline').createInterface(process.stdin)

let ram: number[] = []
reader.on('line', (line: string) => ram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
    ram[1] = 12
    ram[2] = 2
    run(ram, 0) 
    console.log (ram[0]);
})

const run = (ram : number[], pc : number) : number[] => {
  if (ram[pc] === 99) return ram
  if (ram[pc] === 1) { ram[ram[pc + 3]] = ram[ram[pc + 1]] + ram[ram[pc + 2]]; return run(ram, pc + 4) }
  if (ram[pc] === 2) { ram[ram[pc + 3]] = ram[ram[pc + 1]] * ram[ram[pc + 2]]; return run(ram, pc + 4) }
  throw "ERROR"
}