import { userInfo } from "os"

export{}

const reader = require('readline').createInterface(process.stdin)

interface material { material : string, quantity : number }
interface recipe { quantity : number, inputs : material[] }

const lines : string[] = []
const recipes : Map<string, recipe> = new Map()

const produced : Map<string, number> = new Map()
const used : Map<string, number> = new Map()

reader.on('line', (line: string) => lines.push(line))

reader.on('close', () => { 
  lines.forEach(line => {
    const parts = line.split('=>').map(p => p.trim())
    const recipe : recipe = { quantity: parseInt(parts[1].split(' ')[0].trim()), inputs : [] }
    const material = parts[1].split(' ')[1].trim()
    recipes.set(material, recipe )

    produced.set(material, 0)
    used.set(material, 0)

    const inputs = parts[0].split(',').map(i => i.trim())
    inputs.forEach(i => {
      const parts = i.split(' ').map(i => i.trim())
      recipe.inputs.push({ material : parts[1], quantity : parseInt(parts[0]) })
    })
  })


  let min = 0, max = 1000000000000
  while (true) {
    const current = Math.round((max + min) / 2)
    produced.clear()
    used.clear()  
    const needed = neededOre('FUEL', current)
    if (needed < 1000000000000) min = current + 1
    if (needed > 1000000000000) max = current - 1
    if (max <= min || needed == 1000000000000) {console.log(current) ; break}    
  }
})

const neededOre = (material : string, quantity : number) : number => {
  if (material == 'ORE') {
    produced.set(material, (produced.get(material) || 0) + quantity)
    return quantity    
  }

  const recipe = recipes.get(material)
  if (recipe == undefined) throw 'ERROR'

  const spare = Math.abs((produced.get(material) || 0) - (used.get(material) || 0))
  if (spare >= quantity) {
    used.set(material, (used.get(material) || 0) + quantity)
    quantity = 0
  } else {
    used.set(material, (used.get(material) || 0) + spare)
    quantity -= spare
  }

  const toProduce = Math.ceil(quantity / recipe.quantity) * recipe.quantity
  const toBeUsed = quantity

  let total = 0
  recipe.inputs.forEach(i => {
    total += neededOre(i.material, toProduce / recipe.quantity * i.quantity)
  })

  produced.set(material, (produced.get(material) || 0) + toProduce)
  used.set(material, (used.get(material) || 0) + toBeUsed)

  return total
}