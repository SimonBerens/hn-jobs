import {useEffect, useState} from "react";
import {HnData} from "@/hnData";

type LoadingState = "loadingSmallData" | "loadingFullData" | "done"

export function useHnData() {
    const [chartData, setChartData] = useState<HnData | null>(null)
    const [loading, setLoading] = useState<LoadingState>("loadingSmallData")
    const [error, setError] = useState<Error | null>(null)

    const smallDataUrl = `https://${process.env.NEXT_PUBLIC_CF_DATA_SUBDOMAIN}.hnhiringtrends.com/small-data.json`
    const fullDataUrl = `https://${process.env.NEXT_PUBLIC_CF_DATA_SUBDOMAIN}.hnhiringtrends.com/full-data.json`

    useEffect(() => {
        async function fetchChartData() {
            try {
                let smallDataJson = await fetch(smallDataUrl).then(res => res.json())
                console.log(smallDataJson)
                setChartData(smallDataJson)
                setLoading("loadingFullData")
                console.log("loading the big stuff 😉")
                let fullDataJson = await fetch(fullDataUrl).then(res => res.json())
                setChartData(fullDataJson)
                console.log("the big stuff has been loaded 💦")
            } catch (e) {
                setError(e as Error)
            }
            setLoading("done")
        }
        fetchChartData()
    }, [])

    return {hnData: chartData, loading, error}
}