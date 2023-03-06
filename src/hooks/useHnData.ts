import {useEffect, useState} from "react";
import {HnData} from "@/hnData";

export type LoadingState = "loadingSmallData" | "loadingFullData" | "done"

const smallDataUrl = `https://${process.env.NEXT_PUBLIC_CF_DATA_SUBDOMAIN}.hnhiringtrends.com/small-data.json`
const fullDataUrl = `https://${process.env.NEXT_PUBLIC_CF_DATA_SUBDOMAIN}.hnhiringtrends.com/full-data.json`

export function useHnData() {
    const [chartData, setChartData] = useState<HnData | null>(null)
    const [loading, setLoading] = useState<LoadingState>("loadingSmallData")
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchChartData() {
            try {
                let smallDataJson = await fetch(smallDataUrl).then(res => res.json())
                setChartData(smallDataJson)
                setLoading("loadingFullData")
                let fullDataJson = await fetch(fullDataUrl).then(res => res.json())
                setChartData(fullDataJson)
            } catch (e) {
                setError(e as Error)
            }
            setLoading("done")
        }
        fetchChartData()
    }, [])

    return {hnData: chartData, loading, error}
}