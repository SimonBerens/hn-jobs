import {parse} from "node-html-parser";
import {entriesToRecord, recordToEntries, sleep} from "@/util";
import {Comment, HnData, HnDataSource, HnDataSources, PostData} from "@/hnData";
import {promises as fs} from "fs"

type SourceFilters = {
    titleFiler: (title: string) => boolean,
    commentFilter?: (comment: string) => boolean,
}

export const filterMap: Record<HnDataSource, SourceFilters> = {
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

export function getPostIds(source: HnDataSource, hiringJson: any): number[] {
    return hiringJson.hits
        .filter((post: any) => filterMap[source].titleFiler(post.title))
        .map((post: any) => post.objectID)
}

function cleanComment(comment: string): string {
    const root = parse(`<div>${comment}</div>`)
    return root.text
}

let i = 0

export async function getPostDatum(postId: number, source: HnDataSource, useCachedPosts: boolean): Promise<PostData> {
    console.log(i++, postId)
    let postData;
    if (useCachedPosts) {
        const raw = await fs.readFile(`cachedPosts/${postId}-${source}.json`, 'utf8')
        postData = JSON.parse(raw)
    } else {
        postData = await fetch(`https://hn.algolia.com/api/v1/items/${postId}`).then(res => res.json());
        await fs.writeFile(`cachedPosts/${postId}-${source}.json`, JSON.stringify(postData), {flag: "wx"})
    }
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

async function getPostDataSlowly(postIds: number[], source: HnDataSource, useCachedPosts: boolean): Promise<PostData[]> {
    const postComments = []
    for (const postId of postIds) {
        if (!useCachedPosts) {
            await sleep(5000)
        }
        postComments.push(await getPostDatum(postId, source, useCachedPosts))
    }
    return postComments
}

export async function generateHnData(useCachedPosts: boolean): Promise<HnData> {
    const hiringJson = await getRawHiringData()
    return entriesToRecord(await Promise.all(HnDataSources.map(async (source) => {
        const postIds = getPostIds(source, hiringJson)
        console.log(`Found ${postIds.length} posts for ${source}...`)
        const postComments = await getPostDataSlowly(postIds, source, useCachedPosts)
        return [source, postComments]
    })))
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