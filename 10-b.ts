export{}

const reader = require('readline').createInterface(process.stdin)

interface point {x: number, y: number}

const map : string[] = []
const asteroids : {x: number, y: number, count: number, vaporized: boolean, angle: number}[] = []  
reader.on('line', (line: string) => map.push(line))

reader.on('close', () => { 
  map.forEach((line, y) => {
    line.split('').forEach((char, x) => {
      if (char == '#') asteroids.push({x, y, count: 0, vaporized: false, angle: 0})
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
  
  const max = Math.max.apply(Math, asteroids.map(function(a) { return a.count }))
  const station = asteroids.filter(a => a.count == max)[0]
  asteroids.splice(asteroids.indexOf(station), 1)
 
  asteroids.forEach(a => a.angle = angle(station, {x: station.x, y: station.y - 1}, station, a))
  asteroids.sort((i, j) => (i.angle < j.angle)?-1:1); 

  while (asteroids.filter(asteroid => !asteroid.vaporized).length > 0) {
    const remaining = asteroids.filter(asteroid => !asteroid.vaporized)

    remaining.forEach((asteroid, index) => {
      const others = remaining.filter((_, other) => other != index) 
      if (others.every(other => distToSegment(other, station, asteroid) > 0.01)) {
        asteroid.vaporized = true
        if (asteroids.filter(asteroid => asteroid.vaporized).length == 200)
          console.log(asteroid.x * 100 + asteroid.y)
      }
    })
  }
})

function angle (p1: point, p2: point, p3: point, p4: point) {
  const dx0  = p2.x - p1.x
  const dy0  = p2.y - p1.y
  const dx1  = p4.x - p3.x
  const dy1  = p4.y - p3.y
  let angle = Math.atan2(dx0 * dy1 - dx1 * dy0, dx0 * dx1 + dy0 * dy1)
  angle = angle * 180 / 3.1415926
  return angle < 0?angle + 360:angle
}

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
