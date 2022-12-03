export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

interface point { x : number, y : number }
interface you { pos : point, keys : Set<string>, steps : number }

const maze : string[][] = []
let total_keys = 0
const visited : Map<string, number> = new Map()

reader.on('line', (line: string) => maze.push(line.split('')))

reader.on('close', () => { 
  const y = maze.reduce((found, line, index) => found = line.includes('@') ? index : found, -1)
  const x = maze[y].reduce((found, character, index) => found = character == '@' ? index : found, -1)

  total_keys = (maze.join('').match(/[a-z]/g) || []).length

  const steps = bfs([{ pos : { x, y }, keys : new Set(), steps : 0 }])
  console.log(steps)
})

const bfs = (to_search : you[]) => {
  let best = Infinity

  while (to_search.length > 0) {
    const you = to_search.shift()
    if (you == undefined) throw "WHAT!"

    if (you.pos.y < 0 || you.pos.y > maze.length - 1) continue
    if (you.pos.x < 0 || you.pos.x > maze[you.pos.y].length - 1) continue
  
    if (maze[you.pos.y][you.pos.x] == '#') continue

    if (maze[you.pos.y][you.pos.x].match(/[A-Z]/) && !you.keys.has(maze[you.pos.y][you.pos.x].toLowerCase()))
      continue

    if (maze[you.pos.y][you.pos.x].match(/[a-z]/))
      you.keys.add(maze[you.pos.y][you.pos.x])
    
    if (you.keys.size == total_keys) { best = Math.min(you.steps, best) ; continue }

    const previous = visited.get(hash(you))
    if (previous != undefined && previous <= you.steps) continue
    visited.set(hash(you), you.steps)

    to_search.push({ pos : { x : you.pos.x + 1, y : you.pos.y }, keys : new Set(you.keys), steps : you.steps + 1})
    to_search.push({ pos : { x : you.pos.x - 1, y : you.pos.y }, keys : new Set(you.keys), steps : you.steps + 1})
    to_search.push({ pos : { x : you.pos.x, y : you.pos.y + 1 }, keys : new Set(you.keys), steps : you.steps + 1})
    to_search.push({ pos : { x : you.pos.x, y : you.pos.y - 1 }, keys : new Set(you.keys), steps : you.steps + 1})
  }

  return best
}

const hash = (you : you) => [...you.keys].sort().join(':') + `${you.pos.x}, ${you.pos.y}`