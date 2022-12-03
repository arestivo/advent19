export{}

const reader = require('readline').createInterface(process.stdin)

interface point { x : number, y : number }
interface you { pos : point, keys : Set<string>, steps : number }

const maze : string[][] = []
const visited : Map<string, number> = new Map()

reader.on('line', (line: string) => maze.push(line.split('')))

reader.on('close', () => { 
  const y = maze.reduce((found, line, index) => found = line.includes('@') ? index : found, -1)
  const x = maze[y].reduce((found, character, index) => found = character == '@' ? index : found, -1)

  maze[y][x] = '#'
  maze[y - 1][x - 1] = '@'
  maze[y + 1][x - 1] = '@'
  maze[y - 1][x + 1] = '@'
  maze[y + 1][x + 1] = '@'
  maze[y + 1][x] = '#'
  maze[y - 1][x] = '#'
  maze[y][x + 1] = '#'
  maze[y][x - 1] = '#'

  remove_doors(x - 1, y - 1, get_keys(x - 1, y - 1))
  remove_doors(x - 1, y + 1, get_keys(x - 1, y + 1))
  remove_doors(x + 1, y + 1, get_keys(x + 1, y + 1))
  remove_doors(x + 1, y - 1, get_keys(x + 1, y - 1))

  for (let y = 0; y < maze.length; y++)
    console.log(maze[y].join(''))

    const steps = bfs([{ pos : { x : x - 1, y: y - 1 }, keys : new Set(), steps : 0 }], get_keys(x - 1, y - 1).size) +
                  bfs([{ pos : { x : x + 1, y: y + 1 }, keys : new Set(), steps : 0 }], get_keys(x + 1, y + 1).size) +
                  bfs([{ pos : { x : x - 1, y: y + 1 }, keys : new Set(), steps : 0 }], get_keys(x - 1, y + 1).size) +
                  bfs([{ pos : { x : x + 1, y: y - 1 }, keys : new Set(), steps : 0 }], get_keys(x + 1, y - 1).size)
    console.log(steps)
})

const get_keys = (x: number, y: number) => {
  const to_search = [{x, y}]

  const visited : Set<string> = new Set()
  const keys : Set<string> = new Set()

  while (to_search.length > 0) {
    const current = to_search.shift()
    if (current == undefined) throw ('WHAT!')
    
    if (visited.has(`${current.x},${current.y}`)) continue
    visited.add(`${current.x},${current.y}`)

    if (maze[current.y][current.x].match(/[a-z]/)) keys.add(maze[current.y][current.x])

    for (let d = 0; d < 4; d++) {
      const dx = d == 0 ? -1 : (d == 2 ? 1 : 0)
      const dy = d == 1 ? -1 : (d == 3 ? 1 : 0)

      if (valid({x : current.x + dx, y : current.y + dy}))
        to_search.push({x : current.x + dx, y : current.y + dy})
    }
  }

  console.log(keys)

  return keys
}

const remove_doors = (x: number, y: number, doors: Set<string>) => {
  const to_search = [{x, y}]

  const visited : Set<string> = new Set()

  while (to_search.length > 0) {
    const current = to_search.shift()
    if (current == undefined) throw ('WHAT!')
    
    if (visited.has(`${current.x},${current.y}`)) continue
    visited.add(`${current.x},${current.y}`)

    if (maze[current.y][current.x].match(/[A-Z]/) && !doors.has(maze[current.y][current.x].toLowerCase())) {
      maze[current.y][current.x] = '.'
    }

    for (let d = 0; d < 4; d++) {
      const dx = d == 0 ? -1 : (d == 2 ? 1 : 0)
      const dy = d == 1 ? -1 : (d == 3 ? 1 : 0)

      if (valid({x : current.x + dx, y : current.y + dy}))
        to_search.push({x : current.x + dx, y : current.y + dy})
    }
  }
}


const valid = (pos : point) => {
  if (pos.y < 0 || pos.y > maze.length - 1) return false
  if (pos.x < 0 || pos.x > maze[pos.y].length - 1) return false
  if (maze[pos.y][pos.x] == '#') return false
  return true
}

const bfs = (to_search : you[], total_keys: number) => {
  let best = Infinity

  console.log(total_keys)

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