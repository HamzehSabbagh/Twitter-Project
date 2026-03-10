import { Link } from '@inertiajs/react';

type TextWithMentionsProps = {
    text: string;
    className?: string;
};

export function TextWithMentions({ text, className }: TextWithMentionsProps) {
    const parts = text.split(/(@[A-Za-z0-9_]+)/g);

    return (
        <span className={className}>
            {parts.map((part, index) =>
                /^@[A-Za-z0-9_]+$/.test(part) ? (
                    <Link
                        key={`${part}-${index}`}
                        href={`/profile/${part.slice(1)}`}
                        className="font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
                    >
                        {part}
                    </Link>
                ) : (
                    <span key={`${part}-${index}`}>{part}</span>
                ),
            )}
        </span>
    );
}
