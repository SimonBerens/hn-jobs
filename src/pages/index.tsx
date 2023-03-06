import {useEffect, useState} from "react";
import {
    Chart as ChartJS,
    ChartData,
    ChartDataset,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    Point,
    PointElement,
    TimeScale,
    Title,
    Tooltip
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {Comment, getAllTimeLabels, HnDataSource, HnDataSources} from "@/hnData";
import {Header} from "@/components/Header";
import {useHnData} from "@/hooks/useHnData";
import {ChartConfig} from "@/chartConfig";
import "chartjs-adapter-date-fns"
import {DebounceInput} from "react-debounce-input";
import {recordToEntries} from "@/util";
import {RemoveFilterButton} from "@/components/RemoveFilterButton";
import {AddFilterButton} from "@/components/AddFilterButton";
import chroma from "chroma-js";
import Watermark from '@uiw/react-watermark';
import {Loading} from "@/components/Loading";
import {useRouterQueryState} from "@/hooks/useRouterQueryState";


ChartJS.register(
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    LinearScale,
);

const commentFilterFunction = (comment: Comment, filterString: string) => {
    if (filterString === '') {
        return true
    }
    return comment.text.toLowerCase().includes(filterString.toLowerCase())
}

function movingAverageFromRight(data: { x: number, y: number }[], windowSize: number) {
    const result: { x: number, y: number }[] = []
    let sum = 0
    for (let i = 0; i < data.length; i++) {
        sum += data[i].y
        if (i - windowSize >=0) {
            sum -= data[i - windowSize].y
        }
        result.push({
            x: data[i].x,
            y: sum / Math.min(windowSize, i + 1)
        })
    }
    return result
}

export default function Home() {
    const {hnData, loading, error} = useHnData()
    const firstFilter = {
        uuid: '0',
        filterString: '',
        sourcesUsed: {hiring: true, looking: true, freelancerLooking: false, hiringFreelancer: false}
    }
    const [commentFilters, setCommentFilters] = useRouterQueryState<{ filterString: string, uuid: string, sourcesUsed: Record<HnDataSource, boolean> }[]>([firstFilter], 'q')
    const [zoomOptions, setZoomOptions] = useState({})

    useEffect(() => {
        async function loadZoomPlugin() {
            const zoomPlugin = (await import('chartjs-plugin-zoom')).default;
            ChartJS.register(zoomPlugin);
            setZoomOptions({
                zoom: {
                    zoom: {
                        mode: 'x',
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        }
                    }
                }
            });

        }

        loadZoomPlugin()
    }, [])

    if (!hnData) {
        return <div>Loading...</div>
    }

    const datasets:  ChartDataset<"line", Point[]>[] = commentFilters.flatMap(({filterString, sourcesUsed}, filterIndex) =>
        recordToEntries(hnData)
            .filter(([key,]) => sourcesUsed[key])
            .map(
                ([key, value]) => ({
                    ...ChartConfig[key],
                    ...(filterString && {label: `${ChartConfig[key].label} (${filterString})`}),
                    borderColor: chroma(ChartConfig[key].borderColor).darken(filterIndex / commentFilters.length * 3).hex(),
                    tension: 0.2,
                    data: value.map(post => ({
                        x: post.timestampMs,
                        y: loading === 'done' ?
                            post.topLevelComments.filter(comment => commentFilterFunction(comment, filterString)).length
                            : post.numTopLevelComments
                    }))
                })
            )
    )

    const l = datasets.length
    for (let i = 0; i < l; i++) {
        const borderColor = datasets[i].borderColor as string
        datasets.push({
            ...datasets[i],
            data: movingAverageFromRight(datasets[i].data, 6),
            borderColor: chroma(borderColor).brighten(2).hex(),
            pointStyle: false,
            label: 'to hide'
        })
    }

    const data: ChartData<'line'> = {
        labels: getAllTimeLabels(hnData.hiring),
        datasets,
    }

    const options: ChartOptions<'line'> = {
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "month",
                    tooltipFormat: "MMM yyyy",
                },
                title: {
                    text: "Date",
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Number of top level comments"
                }
            }
        },
        plugins: {
            ...zoomOptions,
            legend: {
                labels: {
                    filter: item => item.text !== 'to hide'
                }
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const datasetIndex = elements[0].datasetIndex
                const index = elements[0].index
                window.open(hnData[HnDataSources[datasetIndex]][index].url, "_blank")
            }
        },
        onHover: (event, elements) => {
            document.querySelector('body')!.style.cursor = elements.length > 0 ? "pointer" : "default"
        }
    }


    return <div className="flex flex-col h-[800px]">
        <Header/>
        <Watermark className="w-full flex-1" content="hnhiringtrends.com" gapX={300} gapY={500}>
            <Line data={data} options={options}/>
        </Watermark>
        <Loading loading={loading}/>
        <div className="flex flex-col-reverse sm:flex-row mt-6 sm:space-x-10 px-10">
            {commentFilters.map(({filterString, uuid, sourcesUsed}, filterIndex) =>
                <div key={uuid} className="flex flex-col space-y-1">
                    <RemoveFilterButton onClick={() => setCommentFilters(draft => {
                        draft.splice(filterIndex, 1)
                    })}/>
                    <DebounceInput
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        type="text"
                        value={filterString}
                        placeholder={"Filter comments by text"}
                        onChange={event => setCommentFilters(draft => {
                            draft[filterIndex].filterString = event.target.value
                        })}/>
                    {HnDataSources.map(source =>
                        <div key={uuid + source} className="flex flex-row ml-1 items-center">
                            <input id={uuid + source + 'checkbox'}
                                   className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                   type="checkbox" checked={sourcesUsed[source]}
                                   onChange={() => setCommentFilters(draft => {
                                       draft[filterIndex].sourcesUsed[source] = !draft[filterIndex].sourcesUsed[source]
                                   })}/>
                            <label className="ml-2" htmlFor={uuid + source + 'checkbox'}>
                                {ChartConfig[source].label}
                            </label>
                        </div>
                    )}
                </div>
            )}
            <AddFilterButton
                onClick={() => setCommentFilters(draft => {
                    draft.push({
                        uuid: crypto.randomUUID(),
                        filterString: '',
                        sourcesUsed: {hiring: true, looking: true, freelancerLooking: false, hiringFreelancer: false}
                    })
                })}/>
        </div>
    </div>
}