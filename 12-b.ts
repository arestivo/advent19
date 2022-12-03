export{}

const reader = require('readline').createInterface(process.stdin)

interface point {x : number, y : number, z : number}
interface moon {position : point, velocity : point}

const lines : string[] = []  
const moons : moon[] = []

const historyX : Set<string> = new Set
const historyY : Set<string> = new Set
const historyZ : Set<string> = new Set

reader.on('line', (line: string) => lines.push(line))

reader.on('close', () => { 
  lines.forEach(line => {
    const parts = line.split(',')
    const x = parseInt(parts[0].split('=')[1])
    const y = parseInt(parts[1].split('=')[1])
    const z = parseInt(parts[2].split('=')[1])
    moons.push({position : {x, y, z}, velocity : {x : 0, y : 0, z : 0} })
  })

  let steps = 0
  let peridiocityX = 0, peridiocityY = 0, peridiocityZ = 0

  while (peridiocityX == 0 || peridiocityY == 0 || peridiocityZ == 0) {

    if (peridiocityX == 0 && historyX.has(encode(moons, 'x'))) peridiocityX = steps
    if (peridiocityY == 0 && historyY.has(encode(moons, 'y'))) peridiocityY = steps
    if (peridiocityZ == 0 && historyZ.has(encode(moons, 'z'))) peridiocityZ = steps

    historyX.add(encode(moons, 'x'))
    historyY.add(encode(moons, 'y'))
    historyZ.add(encode(moons, 'z'))

    for (let m1 = 0; m1 < moons.length; m1++)    
      for (let m2 = m1 + 1; m2 < moons.length; m2++) {
        if (moons[m1].position.x < moons[m2].position.x) { moons[m1].velocity.x++; moons[m2].velocity.x-- }
        if (moons[m1].position.x > moons[m2].position.x) { moons[m1].velocity.x--; moons[m2].velocity.x++ }
        if (moons[m1].position.y < moons[m2].position.y) { moons[m1].velocity.y++; moons[m2].velocity.y-- }
        if (moons[m1].position.y > moons[m2].position.y) { moons[m1].velocity.y--; moons[m2].velocity.y++ }
        if (moons[m1].position.z < moons[m2].position.z) { moons[m1].velocity.z++; moons[m2].velocity.z-- }
        if (moons[m1].position.z > moons[m2].position.z) { moons[m1].velocity.z--; moons[m2].velocity.z++ }
      }

      for (let m = 0; m < moons.length; m++) {
        moons[m].position.x += moons[m].velocity.x
        moons[m].position.y += moons[m].velocity.y
        moons[m].position.z += moons[m].velocity.z
      }

      steps++
    }

    console.log (lcm(lcm(peridiocityX, peridiocityY), peridiocityZ))
})

const encode = (moons: moon[], coord : string) => {
  const parts : number[] = []
  moons.forEach(m => {
    if (coord == 'x') {
      parts.push(m.position.x)
      parts.push(m.velocity.x)
    }
    if (coord == 'y') {
      parts.push(m.position.y)
      parts.push(m.velocity.y)
    }
    if (coord == 'z') {
      parts.push(m.position.z)
      parts.push(m.velocity.z)
    }
  })
  return parts.join(',')
} 

const lcm = (x : number, y : number) => (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y))

const gcd = (x : number, y : number) => {
 while(y) x = [y, y = x % y][0]
 return x
}