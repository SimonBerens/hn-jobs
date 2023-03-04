import {HnData} from "@/hnData";

interface ConfigData {
    label: string,
    backgroundColor: string,
    borderColor: string,

}

export const ChartConfig: Record<keyof HnData, ConfigData> = {
    hiring: {
        label: "Hiring",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
    },
    looking: {
        label: "Looking",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
    },
    freelancerLooking: {
        label: "Freelancer Looking",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderColor: "rgba(255, 206, 86, 1)",
    },
    hiringFreelancer: {
        label: "Hiring Freelancer",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
    }
}