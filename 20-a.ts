import { stringify } from "querystring";

export{}

const reader = require('readline').createInterface(process.stdin)
const terminal = require( 'terminal-kit' ).terminal;

enum orientation { vertical, horizontal }
interface point { x : number, y : number }
interface location { point : point, orientation: orientation }
interface path { id : string, steps : number}
interface id { name : string, number : number}
interface portal { id : id, location : location, paths : path[]}

let map : string[] = []  
reader.on('line', (line: string) => map.push(line))

reader.on('close', () => { 
  const portals = get_portals(map)
  create_paths(map, portals)

  const start = portals.get('AA(0)')
  const finish = portals.get('ZZ(0)')

  if (start == undefined) throw 'WHAT!'
  if (finish == undefined) throw 'WHAT!'

  console.log(shortest_distance(portals, start, finish))
})

const shortest_distance = (portals: Map<string, portal>, start: portal, finish: portal) => {
  const to_search = [{ portal: start, steps : 0 }]
  const visited : Map<string, number> = new Map()
  let best = Infinity

  while (to_search.length > 0) {
    const current = to_search.shift()
    if (current == undefined) throw 'WHAT!'
    if (current.portal == finish) { best = Math.min(current.steps, best); continue }

    const previous = visited.get(hash_portal(current.portal.id))
    if (previous != undefined && previous < current.steps) continue
    visited.set(hash_portal(current.portal.id), current.steps)

    current.portal.paths.forEach(path => {
      const next = portals.get(path.id)
      if (next == undefined) throw 'WHAT!'
      to_search.push({portal : next, steps : current.steps + path.steps})
    })
  }

  return best
}

const create_paths = (map : string[], portals: Map<string, portal>) => {
  [...portals.keys()].forEach(name => {
    const portal = portals.get(name)
    if (portal == undefined) throw 'WHAT!'
    flood_search(map, portals, portal)

    const other = portals.get(hash_portal({name : portal.id.name, number : 1 - portal.id.number}))
    if (other != undefined)
      portal.paths.push({ id : hash_portal(other.id), steps : 1 })
  })
}

const flood_search = (map : string[], portals : Map<string, portal>, portal: portal) => {
  const to_search : {point : point, steps : number}[] = []
  const visited : Map<string, number> = new Map()

  to_search.push(...get_search_points(portal.location))

  while (to_search.length > 0) {
    const current = to_search.shift()
    if (current == undefined) throw 'WHAT!'

    if (map[current.point.y] == undefined || map[current.point.y][current.point.x] == undefined) continue
    if (map[current.point.y][current.point.x] == ' ') continue

    const previous = visited.get(hash_point(current.point))
    if (previous != undefined && previous < current.steps) continue
    visited.set(hash_point(current.point), current.steps)

    if (map[current.point.y][current.point.x] == '.') {
      to_search.push({point : {x : current.point.x - 1, y : current.point.y}, steps : current.steps + 1})
      to_search.push({point : {x : current.point.x + 1, y : current.point.y}, steps : current.steps + 1})
      to_search.push({point : {x : current.point.x, y : current.point.y - 1}, steps : current.steps + 1})
      to_search.push({point : {x : current.point.x, y : current.point.y + 1}, steps : current.steps + 1})
    } else {
      const other = get_portal(portals, current.point)
      if (other != undefined && hash_portal(other.id) != hash_portal(portal.id)) {
        portal.paths.push({id : hash_portal(other.id), steps : current.steps})
      }
    }
  }
}

const hash_point = (point : point) => `${point.x},${point.y}`
const hash_portal = (id : id) => `${id.name}(${id.number})`

const get_search_points = (location: location | undefined) : {point : point, steps : number}[] => {
  if (location == undefined) return []
  
  const points = []
  if (location.orientation == orientation.horizontal) {
    points.push(location.point)
    points.push({x : location.point.x + 1, y : location.point.y})
    points.push({x : location.point.x - 1, y : location.point.y})
    points.push({x : location.point.x, y : location.point.y - 1})
    points.push({x : location.point.x, y : location.point.y + 1})
    points.push({x : location.point.x + 2, y : location.point.y})
  } else {
    points.push(location.point)
    points.push({x : location.point.x, y : location.point.y + 1})
    points.push({x : location.point.x, y : location.point.y - 1})
    points.push({x : location.point.x - 1, y : location.point.y})
    points.push({x : location.point.x + 1, y : location.point.y})
    points.push({x : location.point.x, y : location.point.y + 2})
  }

  return points.map(p => {
    return {point : p, steps : -1}
  })
}

const get_portals = (map: string[]) => {
  const portals : Map<string, portal> = new Map()

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (x < map[y].length - 1 && map[y][x].match(/[A-Z]/) && map[y][x + 1].match(/[A-Z]/)) {
        const name = map[y][x] + map[y][x + 1]
        const portal = {id : {name, number : 0}, location : {point : {x, y}, orientation : orientation.horizontal}, paths : []}
        if (portals.get(hash_portal(portal.id)) != undefined) portal.id.number++
        portals.set(hash_portal(portal.id), portal)
      } else if (y < map.length - 1 && map[y][x].match(/[A-Z]/) && map[y + 1][x].match(/[A-Z]/)) {
        const name = map[y][x] + map[y + 1][x]
        const portal = {id : {name, number : 0}, location : {point : {x, y}, orientation : orientation.vertical}, paths : []}
        if (portals.get(hash_portal(portal.id)) != undefined) portal.id.number++
        portals.set(hash_portal(portal.id), portal)
      }
    }
  }
  return portals
}

const get_portal = (portals : Map<string, portal>, target : point) : portal | undefined => {
  let found = undefined
  portals.forEach(p => {
    const point = p.location.point
    if (p.location.orientation == orientation.horizontal) {
      if (point.x == target.x && point.y == target.y) found = p    
      if (point.x + 1 == target.x && point.y == target.y) found = p      
    } else {
      if (point.x == target.x && point.y == target.y) found = p   
      if (point.x == target.x && point.y + 1 == target.y) found = p   
    }
  })

  return found
}
