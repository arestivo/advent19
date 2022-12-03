export{}

const reader = require('readline').createInterface(process.stdin)

interface point { x: number, y: number}

const steps : string[][] = []

reader.on('line', (line : string) => steps.push(line.split(',')))

reader.on('close', () => {
  const w1 = layout(steps[0]).map(step => `${step.x},${step.y}`)
  const w2 = layout(steps[1]).map(step => `${step.x},${step.y}`)

  const crosses = intersect(new Set([...w1]), new Set([...w2])).filter(p => p != '0,0')
  const distances = crosses.map(c => w1.indexOf(c) + w2.indexOf(c))

  console.log(Math.min(...distances))
})

const layout = (steps : string[]) =>  steps.map(step => delta(step)).reduce((path, delta) => path.concat(move(path.slice(-1)[0], delta)), [{x : 0, y : 0}])

const move = function (pos : point, delta : point) {
  const path = []

  const dx = delta.x == 0 ? 0 : delta.x / Math.abs(delta.x)
  const dy = delta.y == 0 ? 0 : delta.y / Math.abs(delta.y)

  for (let i = 1; i <= distance({x: 0, y: 0}, delta); i++)
    path.push({x : pos.x + i * dx, y : pos.y + i * dy})

  return path
}

const delta = function(step: string) : point {
  switch(step[0]) {
    case 'L': return {x: -parseInt(step.substring(1)), y: 0}
    case 'D': return {x: 0, y: parseInt(step.substring(1))}
    case 'R': return {x: parseInt(step.substring(1)), y: 0}
    case 'U': return {x: 0, y: -parseInt(step.substring(1))}
  } throw ('ERROR')
}

const intersect = (a: Set<string>, b: Set<string>) => Array.from([...a].filter(x => b.has(x)))
const distance = (a : point, b : point ) => Math.abs(b.x - a.x) + Math.abs(b.y - a.y)