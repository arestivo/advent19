export{}

const reader = require('readline').createInterface(process.stdin)

interface planet {
  orbited: string[]
}

const orbits : string [] = [] 
const planets : any = {}
reader.on('line', (line: string) => orbits.push(line))

reader.on('close', () => { 
  orbits.forEach((orbit) => {
    const pair = orbit.split(')')

    if (!(pair[0] in planets))
      planets[pair[0]] = {orbited : []}

    planets[pair[0]].orbited.push(pair[1])
  })

  console.log(count('COM', 1))
})

const count = (name: string, level : number) => {
  if (planets[name] == undefined || planets[name].orbited.length == 0) return 0;

  let total = planets[name].orbited.length * level
  planets[name].orbited.forEach((name: string) => {
    total += count(name, level + 1)
  })

  return total
}