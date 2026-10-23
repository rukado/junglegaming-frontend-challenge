import { Big } from 'big.js'

Big.DP = 18
Big.RM = Big.roundHalfUp

export type EthString = string

export function eth(value: EthString | number): Big {
  return new Big(value)
}

export function toEthString(value: Big): EthString {
  return value.toFixed()
}

export function addEth(...values: EthString[]): EthString {
  return toEthString(values.reduce((sum, value) => sum.plus(value), new Big(0)))
}

export function multiplyEth(value: EthString, quantity: number): EthString {
  return toEthString(new Big(value).times(quantity))
}

export function subtractEth(a: EthString, b: EthString): EthString {
  return toEthString(new Big(a).minus(b))
}

export function compareEth(a: EthString, b: EthString): -1 | 0 | 1 {
  return new Big(a).cmp(b)
}

export function isEthEqual(a: EthString, b: EthString): boolean {
  return new Big(a).eq(b)
}

export function formatEth(
  value: EthString,
  options: { minDecimals?: number; maxDecimals?: number } = {},
): string {
  const { minDecimals = 2, maxDecimals = 6 } = options
  const fixed = new Big(value).round(maxDecimals, Big.roundHalfUp).toFixed(maxDecimals)
  const [whole = '0', fraction = ''] = fixed.split('.')
  let trimmed = fraction.replace(/0+$/, '')
  if (trimmed.length < minDecimals) trimmed = trimmed.padEnd(minDecimals, '0')
  return `${whole}${trimmed ? `.${trimmed}` : ''} ETH`
}
