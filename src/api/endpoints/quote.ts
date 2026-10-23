import { quote, type QuoteRequest } from '../contracts'
import { request } from '../http'

export const quoteApi = {
  create: (body: QuoteRequest, signal?: AbortSignal) =>
    request(quote, { method: 'POST', url: '/quotes', data: body, signal }),
}
