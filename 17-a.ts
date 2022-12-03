export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu(sram)

  const output = []
  while (!computer.finished()) {
    computer.run()
    output.push(computer.output.pop() || 0)
  }
  const ascii = output.map(c => String.fromCharCode(c))
  const width = ascii.join('').indexOf('\n')

  const map : string[][] = []
  for (let i = 0; i < ascii.length; i++) {
    if (i % (width + 1) == 0) map.push([])
    if (i % (width + 1) != width)
      map[map.length - 1].push(ascii[i])
  }

  let sum = 0
  for (let r = 0; r < map.length; r++)
    for (let c = 0; c < map[r].length; c++) {
      if (c > 0 && c < map[r].length - 1 && r > 0 && r < map.length - 1) {
        if (map[r][c] == '#' && map[r-1][c] == '#' && map[r+1][c] == '#' && map[r][c-1] == '#' && map[r][c+1] == '#')
          sum += r * c
      }
    }
    console.log(sum)
})

class screen {
  on : boolean
  wait: boolean
  time: number = 1000

  constructor(on : boolean, wait : boolean) {
    this.on = on
    this.wait = wait

    if (!this.on) return

    terminal.hideCursor()
    terminal.clear()
  }

  output(x : number, y : number, b : number) {
    if (!this.on) return
    let tile = ' '
    let color = 'white'
 
    x += 1; y += 2

    switch (b) {
      case 0: tile = '█'; color = 'red'; break
      case 1: tile = '█'; color = 'white'; break
      case 2: tile = '🟊'; color = 'yellow'; break
      case 3: tile = '?'; color = 'white'; break
      case 4: tile = '█'; color = 'cyan'; break
    }

    terminal.moveTo(x + 40, y + 30).color(color)(tile)

    if (this.wait) sleep(this.time)
  }

  text(text:string) {
    if (!this.on) return
    terminal.color('white').moveTo(1, 0)(text)
  }
}

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
        this.save_mem(1, this.input.pop() || 0)
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

const sleep = (ms: number) => {
  for (let i = 0; i < ms * 10000; i++) {}
}