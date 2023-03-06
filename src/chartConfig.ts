import {HnDataSource} from "@/hnData";

interface ConfigData {
    label: string,

}

export const ChartConfig: Record<HnDataSource, ConfigData> = {
    hiring: {
        label: "Hiring",
    },
    looking: {
        label: "Looking",
    },
    freelancerLooking: {
        label: "Freelancer Looking",
    },
    hiringFreelancer: {
        label: "Hiring Freelancer",
    }
}

export const ChartColors = [
    "#CA472F",
    "#0B84A5",
    "#F6C85F",
    "#6F4E7C",
    "#9DD866",
    "#FFA056",
    "#8DDDD0",
]