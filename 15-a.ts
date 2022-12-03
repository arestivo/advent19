export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

interface point { x : number, y : number }

const maze : Map<string, number> = new Map()
const visited : Map<string, boolean> = new Map()

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu([...sram])
  const display = new screen(false, true)

  go(computer, { x : 0, y : 0}, display)

  console.log(search({ x : 0, y : 0}, display))
})

const search = (pos : point, display : screen) : number => {
  let best = Infinity

  if (maze.get(hash(pos)) == 2) return 0
  if (maze.get(hash(pos)) == 0) return Infinity
  if (maze.get(hash(pos)) == undefined) return Infinity
  if (visited.get(hash(pos)) == true) return Infinity

  visited.set(hash(pos), true)

  best = Math.min(best, search({ x : pos.x + 1, y : pos.y }, display))
  best = Math.min(best, search({ x : pos.x - 1, y : pos.y }, display))
  best = Math.min(best, search({ x : pos.x, y : pos.y + 1 }, display))
  best = Math.min(best, search({ x : pos.x, y : pos.y - 1}, display))

  return best + 1
}

const go = (computer: cpu, pos : point, display : screen) => {
  for (let instruction = 4; instruction >= 1; instruction--) {
    if (maze.get(hash(next(pos, instruction))) != undefined) continue

    const result = move(computer, pos, instruction, display)

    if (result.output != 0) {
      go(computer, result.pos, display)
      move(computer, result.pos, reverse(instruction), display)
    }
  }
}

const reverse = (instruction : number) => {
  if (instruction == 1) return 2
  if (instruction == 2) return 1
  if (instruction == 3) return 4
  if (instruction == 4) return 3
  return 0
}

const move = (computer: cpu, pos : point, instruction: number, display : screen) : { output : number, pos : point } => {
  computer.input.push(instruction)
  computer.run()

  const output = computer.output.pop() || 0

  maze.set(hash(next(pos, instruction)), output)
  display.output(next(pos, instruction).x, next(pos, instruction).y, output)

  return { output, pos : next(pos, instruction) }
}

const next = (pos : point, instruction : number) => {
  const dx = instruction == 3 ? -1 : (instruction == 4 ? 1 : 0)
  const dy = instruction == 1 ? -1 : (instruction == 2 ? 1 : 0)
  return {x : pos.x + dx, y : pos.y + dy}
}

const hash = (p : point) : string => `${p.x},${p.y}`

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
      case 1: tile = '█'; color = 'green'; break
      case 2: tile = '🟊'; color = 'yellow'; break
    }

    terminal.moveTo(x + 40, y + 30).color(color)(tile)

    if (this.wait) (sleep(300))
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