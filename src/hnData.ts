// https://hn.algolia.com/api

import {entriesToRecord, recordToEntries, sleep} from "@/util";
import {parse} from "node-html-parser"

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

export type x = {
    titleFiler: (title: string) => boolean,
    commentFilter?: (comment: string) => boolean,
}

export const filterMap: Record<HnDataSource, x> = {
    hiring: {
        titleFiler: (title: string) => title.toLowerCase().startsWith("ask hn: who is hiring?"),
    },
    looking: {
        titleFiler: (title: string) => title.toLowerCase().startsWith("ask hn: who wants to be hired?"),
    },
    hiringFreelancer: {
        titleFiler: (title: string) => title.toLowerCase().includes("freelancer"),
        commentFilter: (comment: string) => comment.toLowerCase().startsWith("seeking freelancer"),
    },
    freelancerLooking: {
        titleFiler: (title: string) => title.toLowerCase().includes("freelancer"),
        commentFilter: (comment: string) => comment.toLowerCase().startsWith("seeking work"),
    },
}

export async function getRawHiringData() {
    return await fetch("http://hn.algolia.com/api/v1/search_by_date?tags=author_whoishiring,story&hitsPerPage=10000").then(res => res.json())
}

export async function getPostIds(source: HnDataSource, hiringJson: any): Promise<number[]> {
    return hiringJson.hits
        .filter((post: any) => filterMap[source].titleFiler(post.title))
        .map((post: any) => post.objectID)
}

function cleanComment(comment: string): string {
    const root = parse(`<div>${comment}</div>`)
    return root.text
}

let i = 0

export async function getPostDatum(postId: number, source: HnDataSource): Promise<PostData> {
    console.log(i++, postId)
    const postData = await fetch(`https://hn.algolia.com/api/v1/items/${postId}`).then(res => res.json())
    const topLevelComments: Comment[] = postData.children.filter((comment: any) => comment.text !== null)
        .map((comment: any) => ({
            text: cleanComment(comment.text),
        }))
        .filter((comment: any) => {
            const commentFilter = filterMap[source].commentFilter
            return commentFilter ? commentFilter(comment.text) : true
        })

    return {
        timestampMs: postData.created_at_i * 1000,
        url: `https://news.ycombinator.com/item?id=${postId}`,
        title: postData.title,
        topLevelComments,
        numTopLevelComments: topLevelComments.length
    }
}

async function getPostDataSlowly(postIds: number[], source: HnDataSource): Promise<PostData[]> {
    const postComments = []
    for (const postId of postIds) {
        await sleep(5000)
        postComments.push(await getPostDatum(postId, source))
    }
    return postComments
}

export async function generateHnData(): Promise<HnData> {
    const hiringJson = await getRawHiringData()
    return entriesToRecord(await Promise.all(HnDataSources.map(async (source) => {
        const postIds = await getPostIds(source, hiringJson)
        const postComments = await getPostDataSlowly(postIds, source)
        return [source, postComments]
    })))
}

export function getAllTimeLabels(posts: PostData[]) {
    return posts.map(post => post.timestampMs)
}

export function removeCommentsFromPost(post: PostData): PostData {
    return {
        ...post,
        topLevelComments: []
    }
}

export function removeCommentsFromHnData(chartData: HnData): HnData {
    return entriesToRecord(
        recordToEntries(chartData).map(
            ([key, value]) => [key, value.map(removeCommentsFromPost)]
        )
    )
}