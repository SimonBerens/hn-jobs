import {useEffect, useMemo, useState} from "react";
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
import {useRouterQueryState} from "@/hooks/useRouterQueryState";
import {SelectInput} from "@/components/SelectInput";
import {entriesToRecord} from "@/util";
import {useWindowWidth} from "@react-hook/window-size/throttled";
import {useLoadingText} from "@/hooks/useLoadingText";

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
    return filterString.split(',').some(filter =>
        comment.text.toLowerCase().includes(filter.toLowerCase().trim())
    )
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
    const [searches, setSearches] = useRouterQueryState<{ filterString: string, uuid: string, source: HnDataSource }[]>(
        [{
            uuid: '0',
            filterString: '',
            source: 'hiring',
        },
            {
                uuid: '1',
                filterString: '',
                source: 'looking',
            }
        ], 'q')
    const [zoomOptions, setZoomOptions] = useState({})
    const screenWidth = useWindowWidth()
    const loadingPlaceholderText = useLoadingText()

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


    const data: ChartData<'line'> = useMemo(() => {

        if (!hnData) {
            return {
                labels: [],
                datasets: [],
            }
        }
        function modifiedConfig(i: number, isMovingAverage: boolean) {

            const isMobile = screenWidth < 640
            const isPrimaryGraph = isMobile ? isMovingAverage : !isMovingAverage
            const {filterString, source} = searches[i]
            const labelText = filterString ? `${ChartConfig[source].label} (${filterString})` : ChartConfig[source].label
            const label = isPrimaryGraph ? labelText : ''
            if (isPrimaryGraph) {
                return {
                    label,
                    borderColor: ChartColors[i],
                    backgroundColor: ChartColors[i] + "40",
                }
            } else {
                return {
                    label,
                    borderColor: "#00000010",
                    backgroundColor: "#00000010",
                }
            }

        }

        const datasets: ChartDataset<"line", Point[]>[] = searches.map(({filterString, source}, filterIndex) =>
            ({
                ...modifiedConfig(filterIndex, false),
                tension: 0.2,
                data: hnData[source].map(post => ({
                    x: post.timestampMs,
                    y: loading === 'done' ?
                        post.topLevelComments.filter(comment => commentFilterFunction(comment, filterString)).length
                        : post.numTopLevelComments
                }))
            })
        )

        for (let i = 0; i < searches.length; i++) {
            datasets.push({
                ...modifiedConfig(i, true),
                tension: 0.2,
                data: movingAverageFromRight(datasets[i].data, 6),
                pointStyle: false,
            })
        }

        return {
            labels: getAllTimeLabels(hnData.hiring),
            datasets,
        }
    }, [hnData, searches, screenWidth])

    if (!hnData) {
        return <div>Loading...</div>
    }

    function areValidElements(elements: ActiveElement[]) {
        return elements.length > 0 && elements[0].datasetIndex < searches.length;
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
                filter: item => item.datasetIndex < searches.length,
            }
        },
        onClick: (event, elements) => {
            if (areValidElements(elements)) {
                const datasetIndex = elements[0].datasetIndex
                const index = elements[0].index
                window.open(hnData[searches[datasetIndex].source][index].url, "_blank")
            }
        },
        onHover: (event, elements) => {
            document.querySelector('body')!.style.cursor = areValidElements(elements) ? "pointer" : "default"
        }
    }


    return <div className="flex flex-col h-[800px]">
        <Header/>
        <div className="w-full flex-1">
            <Line data={data} options={options}/>
        </div>
        <div className="flex flex-col-reverse flex-wrap sm:flex-row mt-6 sm:space-x-10 px-10">
            {searches.map(({filterString, uuid, source}, filterIndex) =>
                <div key={uuid} className="flex flex-col space-y-2 mb-10">
                    <RemoveSearchButton onClick={() => setSearches(draft => {
                        draft.splice(filterIndex, 1)
                    })}/>
                    <DebounceInput debounceTimeout={300}
                                   className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                   type="text"
                                   value={filterString}
                                   placeholder={loading !== 'done' ? loadingPlaceholderText : 'Filter comments by text'}
                                   disabled={loading !== 'done'}
                                   onChange={event => setSearches(draft => {
                                       draft[filterIndex].filterString = event.target.value
                                   })}/>
                    <SelectInput selected={source} setSelected={newSelected => {
                        setSearches(draft => {
                            draft[filterIndex].source = newSelected
                        })
                    }} options={entriesToRecord(HnDataSources.map(source => [source, ChartConfig[source].label]))}/>
                </div>
            )}
            {searches.length < ChartColors.length &&
                <AddSearchButton
                    onClick={() => setSearches(draft => {
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