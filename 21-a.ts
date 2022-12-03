export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu([...sram])

  computer.input.push(...'NOT A J\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'NOT B T\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'OR T J\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'NOT C T\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'OR T J\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'AND D J\n'.split('').map(c => c.charCodeAt(0)))
  computer.input.push(...'WALK\n'.split('').map(c => c.charCodeAt(0)))

  while (!computer.finished())
    computer.run()

  //console.log(computer.output.map(c => String.fromCharCode(c)).join(''))  
  console.log(computer.output[computer.output.length - 1])  
})

class cpu {
  pc  = 0
  relative_base: number = 0

  input: number[] = []
  output : number[] = []
  ram: number[] = []  

  constructor(ram : number[]) {
    this.ram = ram
    for(let i = 0; i < 10000; i++) this.ram.push(0)
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
        this.save_mem(1, this.input.shift() || 0)
        this.pc = this.pc + 2
        break
      case 4: 
        this.output.push(this.get_param(1))
        this.pc = this.pc + 2
        return false
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