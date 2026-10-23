import { FlaskConical } from 'lucide-react'
import { useId, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { mockControl } from '../control'
import { listConnections, subscribeConnections } from '../realtime/server'
import { getScenario, scenarios, setScenario, subscribeScenario } from '../scenarios'

function useScenarioId() {
  return useSyncExternalStore(subscribeScenario, () => getScenario().id)
}

function useConnectionCount() {
  return useSyncExternalStore(subscribeConnections, () => listConnections().length)
}

function nftIdFromLocation() {
  const match = window.location.pathname.match(/^\/nft\/([^/]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : 'emerald-ape-042'
}

export default function MockPanel() {
  const scenarioId = useScenarioId()
  const connections = useConnectionCount()
  const [open, setOpen] = useState(false)
  const [nftId, setNftId] = useState(nftIdFromLocation)
  const [status, setStatus] = useState('')
  const nftInputId = useId()

  function run(action: () => string) {
    try {
      setStatus(action())
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao executar a ação.')
    }
  }

  function bumpPrice() {
    run(() => {
      const nft = mockControl.findNft(nftId)
      const edition = nft?.editions.find((item) => item.available > 0) ?? nft?.editions[0]
      if (!edition) throw new Error('NFT não encontrado.')
      const next = (Math.round(Number(edition.priceEth) * 100) + 10) / 100
      const event = mockControl.updateNft(nftId, {
        editionId: edition.id,
        priceEth: next.toFixed(2),
      })
      return `Evento ${event.id} enviado: ${edition.kind} agora custa ${next.toFixed(2)} ETH.`
    })
  }

  function sellOut() {
    run(() => {
      const nft = mockControl.findNft(nftId)
      const edition = nft?.editions.find((item) => item.available > 0)
      if (!edition) throw new Error('Nenhuma edição disponível para esgotar.')
      const event = mockControl.updateNft(nftId, { editionId: edition.id, available: 0 })
      return `Evento ${event.id} enviado: edição ${edition.kind} esgotada.`
    })
  }

  function settlePending(outcome: 'confirmed' | 'rejected') {
    run(() => {
      const pending = mockControl.orders().filter((order) => order.status === 'pending')
      pending.forEach((order) => mockControl.settleOrder(order.id, outcome))
      return pending.length
        ? `${pending.length} pedido(s) liquidado(s).`
        : 'Nenhum pedido pendente.'
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) setNftId(nftIdFromLocation())
        setOpen(next)
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Cenários de simulação"
          className="fixed bottom-32 left-3 z-50 inline-flex size-10 items-center justify-center gap-2 rounded-full border border-border-soft bg-surface-dark text-caption font-bold text-text-accent shadow-lg md:bottom-4 md:w-auto md:px-3"
        >
          <FlaskConical className="size-4" aria-hidden="true" />
          <span className="hidden md:inline">Cenários</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto bg-surface-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Cenários de simulação</SheetTitle>
          <SheetDescription>
            Controle a API simulada (MSW) e o servidor Socket.IO. As mudanças passam pela camada de
            rede.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-body font-bold">Cenário ativo</legend>
            <RadioGroup
              value={scenarioId}
              onValueChange={(value) => setScenario(value)}
              className="gap-2"
            >
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-start gap-3 rounded-md border border-border p-3"
                >
                  <RadioGroupItem
                    value={scenario.id}
                    id={`scenario-${scenario.id}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`scenario-${scenario.id}`}
                    className="flex flex-col items-start gap-1"
                  >
                    <span className="text-body font-bold">{scenario.label}</span>
                    <span className="text-caption font-normal text-text-secondary">
                      {scenario.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          <section className="flex flex-col gap-3" aria-labelledby="mock-events">
            <h3 id="mock-events" className="text-body font-bold">
              Eventos em tempo real
            </h3>
            <p className="text-caption text-text-secondary">
              Conexões Socket.IO ativas: {connections}
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor={nftInputId}>NFT alvo</Label>
              <Input
                id={nftInputId}
                value={nftId}
                onChange={(event) => setNftId(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={bumpPrice}>
                Subir preço +0,10
              </Button>
              <Button type="button" variant="secondary" onClick={sellOut}>
                Esgotar edição
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => run(() => (mockControl.dropSockets(), 'Conexões derrubadas.'))}
              >
                Derrubar Socket.IO
              </Button>
            </div>
          </section>
          <section className="flex flex-col gap-3" aria-labelledby="mock-orders">
            <h3 id="mock-orders" className="text-body font-bold">
              Pedidos pendentes
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => settlePending('confirmed')}>
                Confirmar pendentes
              </Button>
              <Button type="button" variant="secondary" onClick={() => settlePending('rejected')}>
                Recusar pendentes
              </Button>
            </div>
          </section>
          <Button
            type="button"
            onClick={async () => {
              await mockControl.reset({ scenario: scenarioId })
              window.location.reload()
            }}
          >
            Restaurar dados iniciais
          </Button>
          <output aria-live="polite" className="text-caption text-text-secondary">
            {status}
          </output>
        </div>
      </SheetContent>
    </Sheet>
  )
}
