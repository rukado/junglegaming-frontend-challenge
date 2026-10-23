import type { NftDetail } from '@/api/contracts'
import { networkLabels } from '@/api/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`.toUpperCase().replace('0X', '0x')
}

export function NftDetailsTabs({ nft }: { nft: NftDetail }) {
  return (
    <section aria-label="Informações detalhadas" className="container-page mt-12 md:mt-24">
      <Tabs defaultValue="details" className="gap-0">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-5 rounded-none border-b border-primary/60 p-0"
        >
          <TabsTrigger
            value="details"
            className="h-auto flex-1 rounded-none px-0 pb-1.5 text-left text-body font-medium whitespace-normal md:flex-none md:text-body-lg md:whitespace-nowrap text-foreground data-active:font-bold data-active:text-text-accent after:bottom-0 after:bg-primary"
          >
            Detalhes do NFT
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="h-auto flex-1 rounded-none px-0 pb-1.5 text-left text-body font-medium whitespace-normal md:flex-none md:text-body-lg md:whitespace-nowrap text-foreground data-active:font-bold data-active:text-text-accent after:bottom-0 after:bg-primary"
          >
            Avaliações de colecionadores ({nft.rating.count})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="flex flex-col gap-4 pt-4 text-body leading-[22px]">
          {nft.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-text-secondary">
              {paragraph}
            </p>
          ))}
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="font-bold text-foreground">Rede:</dt>
              <dd className="text-text-secondary">
                Cunhado na {networkLabels[nft.network]} com procedência imutável e metadados
                armazenados no {nft.storage}.
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-bold text-foreground">Contrato:</dt>
              <dd className="text-text-secondary">
                {shortAddress(nft.contract.address)} · Contrato inteligente {nft.contract.standard}{' '}
                verificado.
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-bold text-foreground">Direitos autorais:</dt>
              <dd className="text-text-secondary">
                Direitos autorais do criador: {nft.creator.royaltyPercent}% nas vendas secundárias,
                pagos automaticamente pelos mercados compatíveis.
              </dd>
            </div>
          </dl>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4 text-body text-text-secondary">
          <p>
            Nota média {nft.rating.average.toFixed(1)} de 5 com {nft.rating.count} avaliações. A
            leitura das avaliações individuais ainda não está disponível nesta versão.
          </p>
        </TabsContent>
      </Tabs>
    </section>
  )
}
