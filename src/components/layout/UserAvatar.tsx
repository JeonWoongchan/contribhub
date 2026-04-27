import Image from 'next/image'

type UserAvatarProps = {
    image: string | null | undefined
    name: string | null | undefined
}

export function UserAvatar({ image, name }: UserAvatarProps) {
    return (
        <div className="flex items-center gap-2">
            {image ? (
                <div className="overflow-hidden rounded-full ring-1 ring-interactive-selected-border">
                    <Image
                        src={image}
                        alt={name ?? 'avatar'}
                        width={28}
                        height={28}
                        className="h-7 w-7 bg-interactive-selected object-cover"
                    />
                </div>
            ) : null}
            <span className="max-w-32 truncate text-sm text-muted-foreground sm:max-w-none">
                {name ?? '사용자'}
            </span>
        </div>
    )
}
