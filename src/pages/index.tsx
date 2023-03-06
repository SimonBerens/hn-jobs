import {useEffect, useState} from "react";
import {
    ActiveElement,
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
import {ChartColors, ChartConfig} from "@/chartConfig";
import "chartjs-adapter-date-fns"
import {DebounceInput} from "react-debounce-input";
import {RemoveSearchButton} from "@/components/RemoveSearchButton";
import {AddSearchButton} from "@/components/AddSearchButton";
import Watermark from '@uiw/react-watermark';
import {Loading} from "@/components/Loading";
import {useRouterQueryState} from "@/hooks/useRouterQueryState";
import {SelectInput} from "@/components/SelectInput";
import {entriesToRecord} from "@/util";


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
        if (i - windowSize >= 0) {
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
    const [commentFilters, setCommentFilters] = useRouterQueryState<{ filterString: string, uuid: string, source: HnDataSource }[]>(
        [{
            uuid: '0',
            filterString: '',
            source: 'hiring',
        },
            {
                uuid: '0',
                filterString: '',
                source: 'looking',
            }
        ], 'q')
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

    const datasets: ChartDataset<"line", Point[]>[] = commentFilters.map(({filterString, source}, filterIndex) =>
        ({
            ...ChartConfig[source],
            ...(filterString && {label: `${ChartConfig[source].label} (${filterString})`}),
            borderColor: ChartColors[filterIndex],
            backgroundColor: ChartColors[filterIndex] + "40",
            tension: 0.2,
            data: hnData[source].map(post => ({
                x: post.timestampMs,
                y: loading === 'done' ?
                    post.topLevelComments.filter(comment => commentFilterFunction(comment, filterString)).length
                    : post.numTopLevelComments
            }))
        })
    )

    const originalDatasetsLength = datasets.length
    for (let i = 0; i < originalDatasetsLength; i++) {
        datasets.push({
            ...datasets[i],
            data: movingAverageFromRight(datasets[i].data, 6),
            borderColor: "#00000010",
            pointStyle: false,
            label: ''
        })
    }

    const data: ChartData<'line'> = {
        labels: getAllTimeLabels(hnData.hiring),
        datasets,
    }

    function areValidElements(elements: ActiveElement[]) {
        return elements.length > 0 && elements[0].datasetIndex < originalDatasetsLength;
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
                    filter: item => item.text !== ''
                }
            },
            tooltip: {
                filter: item => item.datasetIndex < originalDatasetsLength,
            }
        },
        onClick: (event, elements) => {
            if (areValidElements(elements)) {
                const datasetIndex = elements[0].datasetIndex
                const index = elements[0].index
                window.open(hnData[HnDataSources[datasetIndex]][index].url, "_blank")
            }
        },
        onHover: (event, elements) => {
            document.querySelector('body')!.style.cursor = areValidElements(elements) ? "pointer" : "default"
        }
    }


    return <div className="flex flex-col h-[800px]">
        <Header/>
        <Watermark className="w-full flex-1" content="hnhiringtrends.com" gapX={300} gapY={500}>
            <Line data={data} options={options}/>
        </Watermark>
        <Loading loading={loading}/>
        <div className="flex flex-col-reverse sm:flex-row mt-6 sm:space-x-10 px-10">
            {commentFilters.map(({filterString, uuid, source}, filterIndex) =>
                <div key={uuid} className="flex flex-col space-y-2 mb-10">
                    <RemoveSearchButton onClick={() => setCommentFilters(draft => {
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
                    <SelectInput selected={source} setSelected={newSelected => {
                        setCommentFilters(draft => {
                            draft[filterIndex].source = newSelected
                        })
                    }} options={entriesToRecord(HnDataSources.map(source => [source, ChartConfig[source].label]))}/>
                </div>
            )}
            {datasets.length / 2 < ChartColors.length &&
                <AddSearchButton
                    onClick={() => setCommentFilters(draft => {
                        draft.push({
                            uuid: crypto.randomUUID(),
                            filterString: '',
                            source: 'hiring',
                        })
                    })}/>
            }

        </div>
    </div>
}