import {
  delay,
  HttpResponse,
  type DefaultBodyType,
  type HttpResponseResolver,
  type PathParams,
} from 'msw'
import type { ApiErrorCode } from '@/api/contracts'
import { hashString } from './db/random'
import { getRuntime, type RouteKey } from './scenarios'

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  extra: { fieldErrors?: Record<string, string>; details?: Record<string, unknown> } = {},
) {
  return HttpResponse.json({ error: { code, message, ...extra } }, { status })
}

function latencyFor(route: RouteKey, request: Request): number {
  const runtime = getRuntime()
  runtime.sequence += 1
  const seed = hashString(`${request.method}:${new URL(request.url).pathname}:${runtime.sequence}`)
  switch (runtime.scenario.latency) {
    case 'none':
      return 0
    case 'fast':
      return 120 + (seed % 200)
    case 'slow':
      return 2_500
    case 'variable':
      return 200 + (seed % 2_000)
    case 'out-of-order': {
      if (route !== 'nfts:list') return 120 + (seed % 200)
      runtime.listSequence += 1
      return runtime.listSequence % 2 === 1 ? 1_800 : 150
    }
  }
}

function matchFailure(route: RouteKey) {
  const runtime = getRuntime()
  const rule = runtime.scenario.failures?.find(
    (candidate) => candidate.route === route || candidate.route === 'any',
  )
  if (!rule) return null
  const count = runtime.failureCounts.get(rule) ?? 0
  if (rule.times !== undefined && count >= rule.times) return null
  runtime.failureCounts.set(rule, count + 1)
  return rule
}

export function withNetwork<Params extends PathParams, Body extends DefaultBodyType>(
  route: RouteKey,
  resolver: HttpResponseResolver<Params, Body>,
): HttpResponseResolver<Params, Body> {
  return async (info) => {
    const runtime = getRuntime()
    const wait = latencyFor(route, info.request)
    if (wait > 0) await delay(wait)
    if (runtime.scenario.offline) return HttpResponse.error()
    const failure = matchFailure(route)
    if (failure) return apiError(failure.status, failure.code, failure.message)
    return resolver(info)
  }
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
