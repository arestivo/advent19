export{}

const reader = require('readline').createInterface(process.stdin)

interface point {x : number, y : number, z : number}
interface moon {position : point, velocity : point}

const lines : string[] = []  
const moons : moon[] = []  
reader.on('line', (line: string) => lines.push(line))

reader.on('close', () => { 
  lines.forEach(line => {
    const parts = line.split(',')
    const x = parseInt(parts[0].split('=')[1])
    const y = parseInt(parts[1].split('=')[1])
    const z = parseInt(parts[2].split('=')[1])
    moons.push({position : {x, y, z}, velocity : {x : 0, y : 0, z : 0} })
  })

  for (let step = 0; step < 1000; step++) {
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
    }

    console.log(moons.reduce((t, m) => {
      return t + (Math.abs(m.position.x) + Math.abs(m.position.y) + Math.abs(m.position.z)) * (Math.abs(m.velocity.x) + Math.abs(m.velocity.y) + Math.abs(m.velocity.z)) 
    }, 0))

})