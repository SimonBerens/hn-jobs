export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function recordToEntries<K extends string, V>(record: Record<K, V>) {
    return Object.entries(record) as [K, V][];
}

export function entriesToRecord<K extends string, V>(entries: [K, V][]) {
    return Object.fromEntries(entries) as Record<K, V>;
}