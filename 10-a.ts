export{}

const reader = require('readline').createInterface(process.stdin)

interface point {x: number, y: number}

let map : string[] = []
let asteroids : {x: number, y: number, count: number}[] = []  
reader.on('line', (line: string) => map.push(line))

reader.on('close', () => { 
  map.forEach((line, y) => {
    line.split('').forEach((char, x) => {
      if (char == '#') asteroids.push({x, y, count: 0})
    })
  })

  for (let a1 = 0; a1 < asteroids.length; a1++) {
    for (let a2 = a1 + 1; a2 < asteroids.length; a2++) {
      const others = asteroids.filter((_, other) => other != a1 && other != a2) 
      if (others.every(other => distToSegment(other, asteroids[a1], asteroids[a2]) > 0.01)){
        asteroids[a1].count++  
        asteroids[a2].count++  
      }
    }
  }
  
  console.log(Math.max.apply(Math, asteroids.map(function(a) { return a.count })))
})

const sqr = (x: number) => x * x
const dist2 = (v: point, w: point) => sqr(v.x - w.x) + sqr(v.y - w.y) 
const distToSegment = (p: point, v: point, w: point) => Math.sqrt(distToSegmentSquared(p, v, w))
const distToSegmentSquared = (p: point, v: point, w: point) => {
  const l2 = dist2(v, w)
  if (l2 == 0) return dist2(p, v)
    
  const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
    
  if (t < 0) return dist2(p, v)
  if (t > 1) return dist2(p, w)
    
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) })
}