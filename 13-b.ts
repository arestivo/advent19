export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

interface tile {x : number, y : number, id : number}

let sram : number[] = []  
let tiles : tile[] = []
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu([...sram])
  const display = new screen(true, false)

  computer.ram[0] = 2

  while (!computer.finished()) {
    const parts = []
    for (let i = 0; i < 3; i++) {
      computer.run()
      parts.push(computer.output.pop() || 0)
    }
    if (parts[0] == -1) break
    if (parts[2] != 0 && parts[0] != -1)
      tiles.push({x : parts[0], y: parts[1], id : parts[2]})
  }

  const height = Math.max(...tiles.map(t => t.y))
  const width = Math.max(...tiles.map(t => t.x))

  tiles.forEach(t => display.output(t.x, t.y, t.id))

  play(computer, display)
})

async function play(computer: cpu, display: screen) {
  let score = 0
  let paddleX = 0, ballX = 0

  display.wait = true

  while (!computer.finished()) {
    const parts = []

    if (paddleX < ballX) computer.input.push(1)
    else if (paddleX > ballX) computer.input.push(-1)
    else computer.input.push(0)

    for (let i = 0; i < 3; i++) {
      computer.run()
      parts.push(computer.output.pop() || 0)
    }

    if (parts[0] != -1) await display.output(parts[0], parts[1], parts[2])
    else score = parts[2]

    display.text(`Score: ${score}`)

    if (parts[2] == 4) ballX = parts[0]
    if (parts[2] == 3) paddleX = parts[0]
  }
}

class screen {
  on : boolean
  wait: boolean
  time: number = 10

  constructor(on : boolean, wait : boolean) {
    this.on = on
    this.wait = wait

    terminal.hideCursor()
    terminal.clear()
  }

  async output(x : number, y : number, b : number) {
    let tile = ' '
    let color = 'white'
 
    x += 1; y += 2

    switch (b) {
      case 1: tile = '█'; color = 'blue'; break
      case 2: tile = '🟊'; color = 'yellow'; break
      case 3: tile = '▂'; color = 'red'; break
      case 4: tile = '🞅'; color = 'green'; break
    }

    terminal.moveTo(x, y).color(color)(tile)

    if (this.wait && b != 0) await(sleep(this.time))
  }

  text(text:string) {
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
  return new Promise(resolve => setTimeout(resolve, ms));
}