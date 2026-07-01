import { Head, usePage } from '@inertiajs/react';
import { Bot, Send, Sparkles, Wand2, Zap, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const quickPrompts = [
    { icon: TrendingUp, label: 'Tren Pengeluaran', prompt: 'Bagaimana tren pengeluaranku bulan ini?' },
    { icon: PiggyBank, label: 'Tips Hemat', prompt: 'Berikan tips untuk hemat lebih banyak bulan ini' },
    { icon: Receipt, label: 'Pengeluaran Terbesar', prompt: 'Apa pengeluaran terbesarku bulan ini?' },
    { icon: Zap, label: 'Ringkasan Cepat', prompt: 'Berikan ringkasan keuangan singkat' },
];

export default function Chat() {
    const { csrfToken } = usePage().props as Record<string, string>;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();

        if (!msg) {
return;
}

        const userMessage: Message = { role: 'user', content: msg, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/money/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrfToken },
                credentials: 'same-origin',
                body: JSON.stringify({ message: msg, conversation_id: conversationId }),
            });

            if (!res.ok) {
throw new Error(`HTTP ${res.status}`);
}

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);

            if (data.conversation_id) {
setConversationId(data.conversation_id);
}
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', content: '** Koneksi terputus.** Silakan coba lagi.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const timeStr = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <Head title="Sekretaris Negara" />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col">
                {/* Header */}
                <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/30 to-[#0ea5e9]/20 border border-[#a855f7]/30 gaming-glow-purple">
                                <Bot className="h-5 w-5 text-[#a855f7]" />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#f59e0b] border-2 border-background shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-[#a855f7] uppercase" style={{ letterSpacing: '0.1em' }}>
                                Sekretaris Negara
                            </h2>
                            <p className="text-[10px] text-[#f59e0b] flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                                Online — Siap melayani
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-card border border-border px-3 py-1.5">
                                <Sparkles className="h-3 w-3 text-[#f59e0b]" />
                                <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider">{messages.length} MSG</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center">
                            {/* Glowing Orb */}
                            <div className="relative mb-6">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#0ea5e9]/10 border border-[#a855f7]/20 flex items-center justify-center gaming-glow-purple animate-[float_4s_ease-in-out_infinite]">
                                    <Wand2 className="h-10 w-10 text-[#a855f7]" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-[#a855f7]/5 animate-[pulse-glow_3s_ease-in-out_infinite]" />
                            </div>

                            <h3 className="text-base font-bold text-foreground mb-1">Salam, Bapak Presiden</h3>
                            <p className="text-xs text-muted-foreground mb-8 max-w-sm text-center">
                                Saya sekretaris negara Anda. Tanyakan apa saja tentang keuangan negara, pola pengeluaran, anggaran, atau kemajuan program pemerintahan.
                            </p>

                            {/* Quick Prompts */}
                            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                                {quickPrompts.map((qp) => (
                                    <button
                                        key={qp.label}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="group flex items-center gap-3 rounded-xl bg-card border border-border p-3 text-left transition-all hover:border-[#a855f7]/30 hover:bg-[#a855f7]/5"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] transition-colors group-hover:bg-[#a855f7]/20">
                                            <qp.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-secondary-foreground group-hover:text-foreground transition-colors">{qp.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 animate-[fadeSlideUp_0.3s_ease_both] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 mt-0.5">
                                    <Bot className="h-4 w-4 text-[#a855f7]" />
                                </div>
                            )}
                            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#f59e0b]/10 text-foreground border border-[#f59e0b]/20 rounded-br-md'
                                    : 'bg-card text-secondary-foreground border border-border rounded-bl-md prose prose-sm dark:prose-invert max-w-none'
                                }`}>
                                    {msg.role === 'assistant' ? <Markdown>{msg.content}</Markdown> : msg.content}
                                </div>
                                <p className={`text-[10px] text-muted-foreground mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {timeStr(msg.timestamp)}
                                </p>
                            </div>
                            {msg.role === 'user' && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 mt-0.5">
                                    <span className="text-xs font-bold text-[#f59e0b]">KAMU</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 animate-[fadeSlideUp_0.3s_ease_both]">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20">
                                <Bot className="h-4 w-4 text-[#a855f7]" />
                            </div>
                            <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-2 w-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-[10px] text-[#a855f7] font-bold tracking-wider">MENGANALISIS</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-sm px-5 py-4">
                    <div className="flex gap-2 max-w-3xl mx-auto">
                        <div className="relative flex-1">
                            <Input
                                ref={inputRef}
                                placeholder="Tanya sekretaris..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                disabled={loading}
                                className="w-full bg-card border-border text-sm h-11 rounded-xl pl-4 pr-4 focus-visible:ring-[#a855f7]/30 focus-visible:border-[#a855f7]/30 placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <Button
                            size="icon"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="h-11 w-11 rounded-xl bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 hover:bg-[#a855f7]/30 hover:shadow-[0_0_16px_rgba(168,85,247,0.3)] transition-all disabled:opacity-30"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
                        Sekretaris Negara bisa membuat kesalahan. Verifikasi keputusan keuangan penting.
                    </p>
                </div>
            </div>
        </>
    );
}

Chat.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Sekretaris Negara', href: '/money/chat' },
    ],
};
