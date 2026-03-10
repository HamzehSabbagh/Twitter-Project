import { useEffect, useRef, useState } from 'react';

type MentionSuggestion = {
    id: number;
    username: string;
    name: string;
    followed_by_viewer: boolean;
};

type MentionTextareaProps = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

function findMentionContext(value: string, caret: number) {
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/(^|\s)@([A-Za-z0-9_]*)$/);

    if (! match) {
        return null;
    }

    return {
        query: match[2],
        start: caret - match[2].length - 1,
        end: caret,
    };
}

export function MentionTextarea({ id, value, onChange, placeholder, className }: MentionTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [mentionContext, setMentionContext] = useState<ReturnType<typeof findMentionContext>>(null);
    const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (! mentionContext) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            try {
                const params = new URLSearchParams();
                params.set('q', mentionContext.query);

                const response = await fetch(`/users/suggest?${params.toString()}`, {
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (! response.ok) {
                    return;
                }

                const payload = (await response.json()) as MentionSuggestion[];
                setSuggestions(payload);
                setOpen(payload.length > 0);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    setSuggestions([]);
                }
            }
        }, 150);

        return () => {
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [mentionContext]);

    function applySuggestion(suggestion: MentionSuggestion) {
        if (! mentionContext) {
            return;
        }

        const nextValue = `${value.slice(0, mentionContext.start)}@${suggestion.username} ${value.slice(mentionContext.end)}`;
        onChange(nextValue);
        setOpen(false);
        setSuggestions([]);

        window.requestAnimationFrame(() => {
            const nextCaret = mentionContext.start + suggestion.username.length + 2;
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
        });
    }

    return (
        <div className="relative">
            <textarea
                id={id}
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    onChange(nextValue);
                    setMentionContext(findMentionContext(nextValue, e.target.selectionStart ?? nextValue.length));
                }}
                onClick={(e) => setMentionContext(findMentionContext(e.currentTarget.value, e.currentTarget.selectionStart ?? e.currentTarget.value.length))}
                onKeyUp={(e) => setMentionContext(findMentionContext(e.currentTarget.value, e.currentTarget.selectionStart ?? e.currentTarget.value.length))}
                onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                placeholder={placeholder}
                className={className}
            />

            {open && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Mention suggestions
                    </p>
                    <div className="space-y-1">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    applySuggestion(suggestion);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{suggestion.name}</p>
                                    <p className="text-xs text-slate-500">@{suggestion.username}</p>
                                </div>
                                {suggestion.followed_by_viewer && (
                                    <span className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300">
                                        Following
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
