import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { errorMessage } from '@/api/errors'
import { ActionButton } from '@/components/common/action-button'
import { StatusMessage } from '@/components/common/status-message'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const queryReset = useQueryErrorResetBoundary()
  return (
    <div className="container-page py-12">
      <StatusMessage
        tone="error"
        title="Algo deu errado"
        description={errorMessage(error)}
        action={
          <ActionButton
            onClick={() => {
              queryReset.reset()
              reset()
              void router.invalidate()
            }}
          >
            Tentar novamente
          </ActionButton>
        }
      />
    </div>
  )
}
