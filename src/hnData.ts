export interface Comment {
    text: string,
}

export interface PostData {
    timestampMs: number,
    url: string,
    title: string,
    topLevelComments: Comment[],
    numTopLevelComments: number
}

export const HnDataSources = ["hiring", "looking", "hiringFreelancer", "freelancerLooking"] as const
export type HnDataSource = typeof HnDataSources[number]

export type HnData = Record<HnDataSource, PostData[]>

export function getAllTimeLabels(posts: PostData[]) {
    return posts.map(post => post.timestampMs)
}
