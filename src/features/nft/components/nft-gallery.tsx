import { Search } from 'lucide-react'
import { useState } from 'react'
import type { NftImage } from '@/api/contracts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type NftGalleryProps = {
  images: NftImage[]
  name: string
}

export function NftGallery({ images, name }: NftGalleryProps) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]
  if (!current) return null

  return (
    <div className="flex gap-7">
      <ul aria-label="Imagens do NFT" className="hidden w-[100px] shrink-0 flex-col gap-4 md:flex">
        {images.map((image, imageIndex) => (
          <li key={`${image.lg}-${imageIndex}`}>
            <button
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`Ver imagem ${imageIndex + 1} de ${images.length}`}
              aria-pressed={imageIndex === index}
              className={cn(
                'block size-[100px] overflow-hidden rounded-[10px] border-2 transition-colors',
                imageIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-border-soft',
              )}
            >
              <img
                src={image.sm}
                alt=""
                width={100}
                height={100}
                className="size-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative flex aspect-square w-full items-center justify-center bg-surface-card p-5 md:size-[444px]">
        <img
          src={current.lg}
          srcSet={`${current.md} 320w, ${current.lg} 640w`}
          sizes="(min-width: 768px) 404px, 100vw"
          width={404}
          height={404}
          alt={current.alt}
          fetchPriority="high"
          className="aspect-square w-full rounded-[18px] object-cover"
        />
        <Dialog>
          <DialogTrigger
            aria-label={`Ampliar imagem de ${name}`}
            className="absolute top-[15px] right-[13px] flex size-[30px] items-center justify-center rounded-full bg-surface-card/80 text-foreground hover:text-text-accent"
          >
            <Search aria-hidden="true" className="size-4" />
          </DialogTrigger>
          <DialogContent className="max-w-[min(90vw,720px)] border-border-soft bg-surface-card p-4 sm:max-w-[min(90vw,720px)]">
            <DialogTitle className="text-lead">{name}</DialogTitle>
            <DialogDescription className="sr-only">{current.alt}</DialogDescription>
            <img
              src={current.lg}
              alt={current.alt}
              width={640}
              height={640}
              className="aspect-square w-full rounded-lg object-cover"
            />
          </DialogContent>
        </Dialog>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 md:hidden">
          {images.map((image, imageIndex) => (
            <button
              key={`${image.sm}-dot-${imageIndex}`}
              type="button"
              aria-label={`Ver imagem ${imageIndex + 1} de ${images.length}`}
              aria-pressed={imageIndex === index}
              onClick={() => setIndex(imageIndex)}
              className="flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  'block h-[7px] rounded-full bg-primary transition-all',
                  imageIndex === index ? 'w-4' : 'w-[7px] opacity-60',
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
