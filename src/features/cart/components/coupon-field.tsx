import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, TicketPercent, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { applyCouponRequest, type ApplyCouponRequest, type QuoteCoupon } from '@/api/contracts'
import { errorMessage } from '@/api/errors'
import { applyApiErrors } from '@/components/form/apply-api-errors'
import { cn } from '@/lib/utils'
import { useApplyCoupon, useRemoveCoupon } from '../queries'

type CouponFieldProps = {
  appliedCode: string | null
  coupon: QuoteCoupon | null | undefined
}

function couponStatusText(code: string, coupon: QuoteCoupon | null | undefined) {
  if (!coupon || coupon.code !== code) return `Cupom ${code} aplicado.`
  if (coupon.status === 'expired') return `O cupom ${code} expirou. Remova-o para continuar.`
  if (coupon.status === 'invalid')
    return `O cupom ${code} não é mais válido. Remova-o para continuar.`
  return `${coupon.label} · ${coupon.discountPercent}% de desconto`
}

export function CouponField({ appliedCode, coupon }: CouponFieldProps) {
  const inputId = useId()
  const errorId = useId()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const [removeError, setRemoveError] = useState<string | null>(null)
  const form = useForm<ApplyCouponRequest>({
    resolver: zodResolver(applyCouponRequest),
    defaultValues: { code: '' },
  })
  const error = form.formState.errors.code?.message

  const submit = form.handleSubmit(async ({ code }) => {
    try {
      await applyCoupon.mutateAsync(code)
      form.reset({ code: '' })
    } catch (caught) {
      const message = applyApiErrors(caught, form.setError, ['code'])
      if (message) form.setError('code', { message })
    }
  })

  async function remove() {
    setRemoveError(null)
    try {
      await removeCoupon.mutateAsync()
    } catch (caught) {
      setRemoveError(errorMessage(caught))
    }
  }

  if (appliedCode) {
    const problem = coupon?.code === appliedCode && coupon.status !== 'applied'
    return (
      <div className="flex flex-col gap-2">
        <p className="text-body leading-4 font-bold text-foreground">Código promocional</p>
        <div
          className={cn(
            'flex min-h-10 items-center gap-3 rounded-full border px-4 py-2 md:rounded-[3px]',
            problem ? 'border-destructive' : 'border-primary',
          )}
        >
          <TicketPercent
            aria-hidden="true"
            className={cn('size-5 shrink-0', problem ? 'text-destructive' : 'text-text-accent')}
          />
          <output aria-live="polite" className="min-w-0 flex-1">
            <span className="block text-body leading-4 font-bold text-foreground">
              {appliedCode}
            </span>
            <span
              className={cn(
                'mt-1 block text-caption',
                problem ? 'text-destructive' : 'text-text-secondary',
              )}
            >
              {couponStatusText(appliedCode, coupon)}
            </span>
          </output>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={removeCoupon.isPending}
            aria-label={`Remover cupom ${appliedCode}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-sand transition-colors hover:text-text-accent disabled:opacity-50"
          >
            {removeCoupon.isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <X aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {removeError && (
          <p role="alert" className="text-caption text-destructive">
            {removeError}
          </p>
        )}
      </div>
    )
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-body leading-4 font-bold text-foreground">
        Código promocional
      </label>
      <div
        className={cn(
          'flex h-[50px] overflow-hidden rounded-full border bg-surface-card transition-colors focus-within:border-text-accent md:h-10 md:rounded-[3px] md:bg-transparent',
          error ? 'border-destructive' : 'border-border md:border-primary',
        )}
      >
        <input
          id={inputId}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Digite o código promocional..."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-[13px] text-foreground uppercase outline-none placeholder:text-sand placeholder:normal-case md:px-2 md:text-caption"
          {...form.register('code')}
        />
        <button
          type="submit"
          disabled={applyCoupon.isPending}
          aria-busy={applyCoupon.isPending || undefined}
          className="flex w-[97px] shrink-0 items-center justify-center rounded-full bg-linear-to-r from-primary to-[#9b6537] text-[15px] font-bold text-foreground transition-opacity hover:opacity-90 disabled:opacity-60 md:w-[102px] md:rounded-none md:bg-primary md:bg-none md:text-ink md:hover:bg-text-accent"
        >
          {applyCoupon.isPending ? (
            <Loader2 aria-label="Aplicando cupom" className="size-4 animate-spin" />
          ) : (
            'Aplicar'
          )}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
