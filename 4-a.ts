export{}

const reader = require('readline').createInterface(process.stdin)

const inputs : number[] = []

reader.on('line', (line : string) => inputs.push(parseInt(line)))

reader.on('close', () => {
  const numbers = [...range(inputs[0], inputs[1])].map(n => n.toString()).filter(consecutive).filter(increasing)
  console.log(numbers.length)
})

const consecutive = function(number : string) {
  for (let i = 0; i < number.length - 1; i++)
    if (number[i] == number[i + 1]) return true
  return false
}

const increasing = function(number : string) {
  for (let i = 0; i < number.length - 1; i++)
    if (number[i] > number[i + 1]) return false
  return true
}

const range = function*(start: number, end: number) {
  for (let i = start; i <= end; i++) yield i;
}
