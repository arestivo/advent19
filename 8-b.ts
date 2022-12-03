import { cursorTo } from "readline"

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

  const image = new Array(width * height).fill('2')
  layers.reverse().forEach(layer => layer.split('').forEach((pixel, pos) => image[pos] = pixel == '2'?image[pos]:pixel))
  console.log((image.map(p => p=='1'?'*':' ').join('').match(new RegExp('.{1,' + width + '}', 'g')) || []).join('\n'))
})