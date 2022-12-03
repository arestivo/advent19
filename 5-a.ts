export{}

const reader = require('readline').createInterface(process.stdin)

const inputs = [1]
let ram: number[] = []
let ni = 0

reader.on('line', (line: string) => ram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
    run(ram, 0) 
})

const run = (ram : number[], pc : number) : number[] => {
  if (ram[pc] === 99) return ram

  let opcode = get_opcode(ram[pc])

  if (opcode === 1) { ram[ram[pc + 3]] = get_param(pc, 1) + get_param(pc, 2); return run(ram, pc + 4) }
  if (opcode === 2) { ram[ram[pc + 3]] = get_param(pc, 1) * get_param(pc, 2); return run(ram, pc + 4) }
  if (opcode === 3) { ram[ram[pc + 1]] = inputs[ni++]; return run(ram, pc + 2) }
  if (opcode === 4) { console.log(get_param(pc, 1)); return run(ram, pc + 2) }
  throw "ERROR"
}

const get_param = (pc: number, p: number) => get_mode(ram[pc], p)=='0'?ram[ram[pc + p]]:ram[pc + p]
const get_opcode = (i : number) => parseInt(i.toString().slice(-1))
const get_mode = (i : number, p: number) => {
  let s = i.toString()
  if (p + 2 - s.length > 0) s = '0'.repeat(p + 2 - s.length) + s
  return s.substring(0, s.length - 2).split('').reverse().join('').substring(p - 1, p)
}