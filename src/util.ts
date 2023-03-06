export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function recordToEntries<K extends string, V>(record: Record<K, V>) {
    return Object.entries(record) as [K, V][];
}

export function entriesToRecord<K extends string, V>(entries: [K, V][]) {
    return Object.fromEntries(entries) as Record<K, V>;
}

export function mapRecordValues<K extends string, V, R>(record: Record<K, V>, mapFn: (value: V) => R): Record<K, R> {
    return entriesToRecord(recordToEntries(record).map(([key, value]) => [key, mapFn(value)]))
}