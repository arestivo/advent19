export{}

const reader = require('readline').createInterface(process.stdin)

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const possibilities = permute('56789')
  let best = -1
  
  possibilities.forEach(phases => {
    let input = 0
    let first = true

    const computers = new Array(5).fill(5).map(_ => new cpu([],[...sram]))
    
    while (true) {
      for (let c = 0; c < 5; c++) {
        computers[c].input = [input]
        if (first) computers[c].input.push(parseInt(phases[c]))
        input = computers[c].run()
      }
      first = false
      if (computers.every(c => c.finished())) break;
    }

    if (input > best) best = input
  })
  console.log(best)    
})

class cpu {
  input: number[]
  output = -1
  pc  = 0
  ram: number[] = []  

  constructor(input: number[], ram : number[]) {this.input = input; this.ram = ram}

  run = () => {
    while(this.step()) {}
    return this.output
  }

  step = () => {
    if (this.finished()) return false
  
    const opcode = this.get_opcode(this.ram[this.pc])
  
    switch (opcode) {
      case 1: 
        this.ram[this.ram[this.pc + 3]] = this.get_param(1) + this.get_param(2)
        this.pc = this.pc + 4
        break
      case 2:
        this.ram[this.ram[this.pc + 3]] = this.get_param(1) * this.get_param(2)
        this.pc = this.pc + 4
        break
      case 3: 
        this.ram[this.ram[this.pc + 1]] = this.input.pop() || 0
        this.pc = this.pc + 2
        break
      case 4: 
        this.output = this.get_param(1)
        this.pc = this.pc + 2
        return false
        break
      case 5: 
        if (this.get_param(1) != 0)
          this.pc = this.get_param(2)
        else 
          this.pc = this.pc + 3
        break
      case 6: 
        if (this.get_param(1) == 0) 
          this.pc = this.get_param(2) 
        else 
          this.pc = this.pc + 3
        break
      case 7: 
        this.ram[this.ram[this.pc + 3]] = this.get_param(1) < this.get_param(2)?1:0
        this.pc = this.pc + 4
        break 
      case 8: 
        this.ram[this.ram[this.pc + 3]] = this.get_param(1) == this.get_param(2)?1:0
        this.pc = this.pc + 4
        break   
    }
    return true
  }
  
  finished = () => this.ram[this.pc] === 99
  get_param = (p: number) => this.get_mode(this.ram[this.pc], p)=='0'?this.ram[this.ram[this.pc + p]]:this.ram[this.pc + p]
  get_opcode = (i : number) => parseInt(i.toString().slice(-1))
  get_mode = (i : number, p: number) => {
    let s = i.toString()
    if (p + 2 - s.length > 0) s = '0'.repeat(p + 2 - s.length) + s
    return s.substring(0, s.length - 2).split('').reverse().join('').substring(p - 1, p)
  }
}

const permute = (str : string) => {
  let ret: string[] = [];
  if (str.length == 1) return [str];
  if (str.length == 2) return [str, str[1]+str[0]];
  str.split('').forEach(function (chr, idx, arr) {
    let sub = [...arr]
    sub.splice(idx, 1);
    permute(sub.join('')).forEach(function (perm) {
      ret.push(chr+perm)
    })
  })

  return ret
}