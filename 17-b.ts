export{}

interface point {x : number, y : number}
interface robot {pos : point, dir : point}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu(sram)

  computer.ram[0] = 2

  computer.input.push(...to_code('A,B,B,A,B,C,A,C,B,C\n'))
  computer.input.push(...to_code('L,4,L,6,L,8,L,12\n'))
  computer.input.push(...to_code('L,8,R,12,L,12\n'))
  computer.input.push(...to_code('R,12,L,6,L,6,L,8\n'))
  computer.input.push(...to_code('n\n'))

  while (!computer.finished()) computer.run()
  console.log(computer.output[computer.output.length - 1])
})

const part1 = () => {
  const computer = new cpu(sram)

  const output = []
  while (true) {
    computer.run()
    output.push(computer.output.pop() || 0)
    if (computer.finished()) break
  }
  const ascii = output.map(c => String.fromCharCode(c))
  const width = ascii.join('').indexOf('\n')

  const map : string[][] = []
  for (let i = 0; i < ascii.length; i++) {
    if (i % (width + 1) == 0) map.push([])
    if (i % (width + 1) != width)
      map[map.length - 1].push(ascii[i])
  }

  for (let r = 0; r < map.length; r++)
    console.log(map[r].join(''))

  const robot = get_robot(map)
  const commands = get_commands(map, robot)
  console.log(commands)

    /* A: L,4,L,6,L,8,L,12,
     B: L,8,R,12,L,12,
     B: L,8,R,12,L,12,
     A: L,4,L,6,L,8,L,12,
     B: L,8,R,12,L,12,
     C: R,12,L,6,L,6,L,8,
     A: L,4,L,6,L,8,L,12,
     C: R,12,L,6,L,6,L,8,
     B: L,8,R,12,L,12,
     C: R,12,L,6,L,6,L,8*/
}

const to_code = (ascii : string) => ascii.split('').map(a => a.charCodeAt(0))

const rotate = (dir : point, action : string) => {
  switch(action) {
    case 'L': return {x : dir.y, y : -dir.x}
    case 'R': return {x : -dir.y, y : dir.x}
  }
  throw 'INVALID ACTION'
}

const get_commands = (map: string[][], robot : robot) => {
  let commands = 'L'
  robot.dir = rotate(robot.dir, 'L')

  while (true) {
    console.log(commands)

    let steps = 0
    while(next(map, robot, robot.dir) == '#') {
      steps++
      move(robot)
    }

    if (steps != 0) {
      commands += `,${steps}`
      continue
    }

    if (next(map, robot, rotate(robot.dir, 'L')) == '#') {
      commands += ',L'
      robot.dir = rotate(robot.dir, 'L')
      continue
    }

    if (next(map, robot, rotate(robot.dir, 'R')) == '#') {
      commands += ',R'
      robot.dir = rotate(robot.dir, 'R')
      continue
    }

    break
  }

  return commands
}

const move = (robot : robot) => { robot.pos.x += robot.dir.x ; robot.pos.y += robot.dir.y }

const next = (map : string[][], robot : robot, look : point) => {
  const y = robot.pos.y + look.y
  const x = robot.pos.x + look.x
  if (y < 0 || y > map.length - 1) return '.'
  if (x < 0 || x > map[y].length - 1) return '.'
  return map[y][x]
}

const get_robot = (map: string[][]) => {
  for (let y = 0; y < map.length; y++)
    for (let x = 0; x < map[y].length; x++) {
      switch (map[y][x]) {
        case '<': return { pos : { x, y}, dir : {x : -1, y: 0}}
        case '>': return { pos : { x, y}, dir : {x : 1, y: 0}}
        case '^': return { pos : { x, y}, dir : {x : 0, y: -1}}
        case '>': return { pos : { x, y}, dir : {x : 0, y: 1}}
      }
    }
  throw "NO ROBOT"
}

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

const sleep = (ms: number) => {
  for (let i = 0; i < ms * 10000; i++) {}
}