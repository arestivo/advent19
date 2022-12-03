export{}

const reader = require('readline').createInterface(process.stdin)

const inputs = [5]
let ni = 0
let ram: number[] = []

reader.on('line', (line: string) => ram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
    run(ram, 0) 
})

const run = (ram : number[], pc : number) : number[] => {
  if (ram[pc] === 99) return ram

  const opcode = get_opcode(ram[pc])

  if (opcode === 1) { ram[ram[pc + 3]] = get_param(pc, 1) + get_param(pc, 2); return run(ram, pc + 4) }
  if (opcode === 2) { ram[ram[pc + 3]] = get_param(pc, 1) * get_param(pc, 2); return run(ram, pc + 4) }
  if (opcode === 3) { ram[ram[pc + 1]] = inputs[ni++]; return run(ram, pc + 2) }
  if (opcode === 4) { console.log(get_param(pc, 1)); return run(ram, pc + 2) }
  if (opcode === 5) { if (get_param(pc, 1) != 0) {pc = get_param(pc, 2); return run(ram, pc)} else return run(ram, pc + 3) }
  if (opcode === 6) { if (get_param(pc, 1) == 0) {pc = get_param(pc, 2); return run(ram, pc)} else return run(ram, pc + 3) }
  if (opcode === 7) { ram[ram[pc + 3]] = get_param(pc, 1) < get_param(pc, 2)?1:0; return run(ram, pc + 4) } 
  if (opcode === 8) { ram[ram[pc + 3]] = get_param(pc, 1) == get_param(pc, 2)?1:0; return run(ram, pc + 4) } 
  throw "ERROR"
}


const get_param = (pc: number, p: number) => get_mode(ram[pc], p)=='0'?ram[ram[pc + p]]:ram[pc + p]
const get_opcode = (i : number) => parseInt(i.toString().slice(-1))
const get_mode = (i : number, p: number) => {
  let s = i.toString()
  if (p + 2 - s.length > 0) s = '0'.repeat(p + 2 - s.length) + s
  return s.substring(0, s.length - 2).split('').reverse().join('').substring(p - 1, p)
}