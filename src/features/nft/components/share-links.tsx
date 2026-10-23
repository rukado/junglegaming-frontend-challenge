import { Mail } from 'lucide-react'

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[15px] fill-current">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[15px] fill-current">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  )
}

export function ShareLinks({ name, url }: { name: string; url: string }) {
  const text = `Confira ${name} na Kurio`
  const links = [
    {
      label: `Compartilhar ${name} no LinkedIn`,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: <LinkedinIcon />,
    },
    {
      label: `Compartilhar ${name} por e-mail`,
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
      icon: <Mail aria-hidden="true" className="size-[18px]" />,
    },
    {
      label: `Compartilhar ${name} no X`,
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      icon: <XIcon />,
    },
  ]
  return (
    <div className="flex items-center gap-2">
      <p className="text-body font-bold text-foreground">Compartilhar este NFT:</p>
      <ul className="flex items-center gap-1">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex size-7 items-center justify-center rounded-sm text-foreground hover:text-text-accent"
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
