import {useRouter} from "next/router";
import {useEffect} from "react";
import {DraftFunction, useImmer} from "use-immer";
import base64url from "base64url";
import {castDraft, produce} from "immer";


export function useRouterQueryState<T>(initialValue: T, queryKey: string) {
    const {query, push, isReady, beforePopState} = useRouter()
    const [value, setValue] = useImmer<T>(initialValue)

    useEffect(() => {
        beforePopState(({url}) => {
            const mockUrl = new URL(`http://localhost:3000${url}`)
            const queryValue = mockUrl.searchParams.get(queryKey)
            if (queryValue === null) {
                setValue(initialValue)
            } else {
                setValue(JSON.parse(base64url.decode(queryValue)))
            }
            return true
        })
    }, [setValue, initialValue, queryKey, beforePopState])

    useEffect(() => {
        if (isReady && query[queryKey] !== undefined) {
            setValue(JSON.parse(base64url.decode(query[queryKey] as string)))
        }
    }, [isReady, query, queryKey, setValue])

    function updateValue(updateFunction: DraftFunction<T>) {
        setValue(updateFunction)
        const nextValue = produce(castDraft(value), updateFunction)
        push(`?${queryKey}=${base64url.encode(JSON.stringify(nextValue))}`, undefined, {shallow: true})
    }
    return [value, updateValue] as const
}