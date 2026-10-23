import type { User } from '@/api/contracts'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  user: Pick<User, 'displayName' | 'avatarUrl'>
  size?: number
  className?: string
}

export function UserAvatar({ user, size = 40, className }: UserAvatarProps) {
  const initials = user.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-surface-dark font-bold text-text-accent',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials}
    </span>
  )
}
