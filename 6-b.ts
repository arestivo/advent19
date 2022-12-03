export{}

const reader = require('readline').createInterface(process.stdin)

interface planet {
  orbits: string
  distance: number
}

const orbits : string [] = [] 
const planets : any = {}
reader.on('line', (line: string) => orbits.push(line))

reader.on('close', () => { 
  orbits.forEach((orbit) => {
    const pair = orbit.split(')')

    planets[pair[1]] = {orbits : pair[0]}
  })

  planets['COM'] = {}

  travel('YOU', -1)
  travel('SAN', -1)
})

const travel = (name: string, hops: number) => {
  if ('distance' in planets[name]) return console.log(hops + planets[name].distance)
  if ('orbits' in planets[name]) {
    planets[name].distance = hops
    travel(planets[name].orbits, hops + 1)
  }
}