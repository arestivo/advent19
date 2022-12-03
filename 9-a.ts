export{}

const reader = require('readline').createInterface(process.stdin)

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu([1], [...sram])
  computer.run()
})

class cpu {
  output = -1
  pc  = 0
  relative_base: number = 0

  input: number[]
  ram: number[] = []  

  constructor(input: number[], ram : number[]) {
    this.input = input
    this.ram = ram
    for(let i = 0; i < 120; i++) this.ram.push(0)
  }

  run = () => {
    while(this.step()) { }
    return this.output
  }

  step = () => {
    if (this.finished()) return false
  
    const opcode = this.get_opcode(this.ram[this.pc])
  
    switch (opcode) {
      case 1: 
        this.save_mem(3, this.get_param(1) + this.get_param(2))
        this.pc = this.pc + 4
        break
      case 2:
        this.save_mem(3, this.get_param(1) * this.get_param(2))
        this.pc = this.pc + 4
        break
      case 3: 
        this.save_mem(1, this.input.pop() || 0)
        this.pc = this.pc + 2
        break
      case 4: 
        this.output = this.get_param(1)
        this.pc = this.pc + 2
        console.log(this.output)
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
        this.save_mem(3, this.get_param(1) < this.get_param(2)?1:0)
        this.pc = this.pc + 4
        break 
      case 8: 
        this.save_mem(3, this.get_param(1) == this.get_param(2)?1:0)
        this.pc = this.pc + 4
        break   
      case 9: 
        this.relative_base += this.get_param(1)
        this.pc = this.pc + 2
        break   
    }
    return true
  }
  
  finished = () => this.ram[this.pc] === 99
  get_param = (p: number) => {
    switch (this.get_mode(this.ram[this.pc], p)) {
      case '0': return this.ram[this.ram[this.pc + p]]
      case '1': return this.ram[this.pc + p]
      case '2': return this.ram[this.relative_base + this.ram[this.pc + p]]
    }
    throw 'ERROR'
  }
  save_mem = (p: number, n: number) => {
    switch (this.get_mode(this.ram[this.pc], p)) {
      case '0': this.ram[this.ram[this.pc + p]] = n; return
      case '1': this.ram[this.pc + p] = n; return
      case '2': this.ram[this.relative_base + this.ram[this.pc + p]] = n; return
    }
    throw 'ERROR'
  }
  get_opcode = (i : number) => parseInt(i.toString().slice(-1))
  get_mode = (i : number, p: number) => {
    let s = i.toString()
    if (p + 2 - s.length > 0) s = '0'.repeat(p + 2 - s.length) + s
    return s.substring(0, s.length - 2).split('').reverse().join('').substring(p - 1, p)
  }
}