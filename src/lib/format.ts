import { Big } from 'big.js'

const ptNumber = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatDecimalPtBr(value: string | number) {
  return ptNumber.format(Number(value))
}

export function formatEthAmount(value: string, decimals = 2) {
  const big = new Big(value)
  const places = Math.max(
    decimals,
    Math.min(6, (big.toFixed().split('.')[1] ?? '').replace(/0+$/, '').length),
  )
  return `${big.toFixed(places)} ETH`
}

export function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso)).replace(/\./g, '').replace(/ de /g, ' ')
}
