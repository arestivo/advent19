export{}

const reader = require('readline').createInterface(process.stdin)

let sram : number[] = []
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

function run(ram : number[], pc : number) : number[] {
  if (ram[pc] === 99) return ram
  if (ram[pc] === 1) { ram[ram[pc + 3]] = ram[ram[pc + 1]] + ram[ram[pc + 2]]; return run(ram, pc + 4) }
  if (ram[pc] === 2) { ram[ram[pc + 3]] = ram[ram[pc + 1]] * ram[ram[pc + 2]]; return run(ram, pc + 4) }

  throw "ERROR"
}

reader.on('close', () => { 
  for (let noun = 0; noun < 99; noun++)
    for (let verb = 0; verb < 99; verb++) {
      let ram = [...sram]
      ram[1] = noun 
      ram[2] = verb 
      run(ram, 0) 
      if (ram[0] == 19690720) 
        console.log (100 * noun + verb)    
    }
})