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
