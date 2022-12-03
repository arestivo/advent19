export{}

const reader = require('readline').createInterface(process.stdin)

let sram : number[] = []  
reader.on('line', (line: string) => sram = line.split(',').map( n => parseInt(n)))

reader.on('close', () => { 
  const computer = new cpu([...sram])
  const panel = new Map<string, number>()
  const robot = {x: 0, y: 0, d: 0} 

  panel.set('0,0', 1)

  while (!computer.finished()) {
    const color = panel.get(`${robot.x},${robot.y}`)
    computer.input.push(color == undefined ? 0 : color)

    computer.run()
    const paint = computer.output.pop() || 0

    computer.run()
    const turn = computer.output.pop() || 0

    do_paint(robot, panel, paint)
    do_rotate(robot, turn)
    do_move(robot)
  } 

  const x1 = Math.min(...[...panel.keys()].map(k => parseInt(k.split(',')[0])))
  const x2 = Math.max(...[...panel.keys()].map(k => parseInt(k.split(',')[0])))
  const y1 = Math.min(...[...panel.keys()].map(k => parseInt(k.split(',')[1])))
  const y2 = Math.max(...[...panel.keys()].map(k => parseInt(k.split(',')[1])))

  for (let y = y1; y <= y2; y++) {
    const line = []
    for (let x = x1; x <= x2; x++) {
      const color = panel.get(`${x},${y}`) || 0
      line.push(color == 0 ? ' ' : '*')
    }
    console.log(line.join(''))
  }
})

const do_paint = (robot : {x: number, y: number}, panel : Map<string, number>, paint : number) => {
  const clear = panel.get(`${robot.x},${robot.y}`) == undefined
  const current = clear ? 0 : panel.get(`${robot.x},${robot.y}`)
  if (clear && paint == 1 || !clear && paint != current) panel.set(`${robot.x},${robot.y}`, paint)
}

const do_rotate = (robot : {d: number}, turn : number) => {
  robot.d += turn==0?-1:1
  if (robot.d < 0) robot.d +=4
  if (robot.d > 3) robot.d -=4
}

const do_move = (robot : {x: number, y: number, d: number}) => {
  switch(robot.d) {
    case 0: robot.y--; break 
    case 1: robot.x++; break 
    case 2: robot.y++; break 
    case 3: robot.x--; break 
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