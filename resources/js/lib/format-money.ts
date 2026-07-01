export function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function maskIDR(amount?: number): string {
    const len = amount != null ? formatIDR(amount).length : 10;
    return 'Rp ' + '•'.repeat(Math.max(len - 3, 5));
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
