import {useEffect, useState} from "react";
import {
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {Comment, getAllTimeLabels, HnDataSources} from "@/hnData";
import {Header} from "@/components/Header";
import {useHnData} from "@/hooks/useHnData";
import {ChartConfig} from "@/chartConfig";
import "chartjs-adapter-date-fns"
import {useImmer} from "use-immer";
import {DebounceInput} from "react-debounce-input";
import {recordToEntries} from "@/util";

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

export default function Home() {
    const {hnData, loading, error} = useHnData()
    const [commentFilters, setCommentFilters] = useImmer<{ filterString: string, uuid: string }[]>([])
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

    const datasets = commentFilters.flatMap((filter, filterIndex) =>
        recordToEntries(hnData).map(
            ([key, value]) => ({
                ...ChartConfig[key],
                tension: 0.2,
                data: value.map(post => ({
                    x: post.timestampMs,
                    y: loading === 'done' ?
                        post.topLevelComments.filter(comment => commentFilterFunction(comment, filter.filterString)).length
                        : post.numTopLevelComments
                }))
            })
        )
    )

    const data: ChartData<'line'> = {
        labels: getAllTimeLabels(hnData.hiring),
        datasets,
    }

    const options: ChartOptions<'line'> = {
        maintainAspectRatio: true,
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
                    text: "Number of comments",
                }
            }
        },
        plugins: {
            ...zoomOptions,
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


    return <>
        <Header/>
        <button onClick={() => setCommentFilters(draft => {
            draft.push({uuid: crypto.randomUUID(), filterString: ''})
        })}>Add filter
        </button>
        {commentFilters.map(({filterString, uuid}, filterIndex) =>
            <div key={uuid} className="flex flex-row">
                <DebounceInput className="focus:ring focus:ring-indigo-400 outline-none rounded" type="text"
                               value={filterString}
                               placeholder={"Filter comments by text"}
                               onChange={event => setCommentFilters(draft => {
                                   draft[filterIndex].filterString = event.target.value
                               })}/>
                <button onClick={() => setCommentFilters(draft => {
                    draft.splice(filterIndex, 1)
                })}>Remove filter
                </button>
            </div>
        )}
        <div className="">
            <Line data={data} options={options}/>
        </div>
    </>
}