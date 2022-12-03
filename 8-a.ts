export{}

const reader = require('readline').createInterface(process.stdin)

const width = 25, height = 6
const layers : string[] = []
let input : string

reader.on('line', (line: string) => input = line)

reader.on('close', () => { 
  let layer = 0
  while (layer * width * height < input.length)
    layers.push(input.substr(layer++ * width * height, width * height))

  const zeros = layers.map(layer => (layer.match(/0/g) || []).length)
  const smallest = zeros.indexOf(Math.min(...zeros));
  console.log((layers[smallest].match(/1/g) || []).length * (layers[smallest].match(/2/g) || []).length)
})