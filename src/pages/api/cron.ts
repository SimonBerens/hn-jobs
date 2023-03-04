import type {NextApiRequest, NextApiResponse} from 'next'
import {generateHnData, removeCommentsFromHnData} from "@/dataGeneration"
import {uploadString} from "@/s3";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== "POST") {
        response.setHeader("Allow", "POST")
        response.status(405).end("Method Not Allowed")
        return
    }

    try {
        const { authorization } = request.headers

        if (authorization !== `Bearer ${process.env.CRON_TRIGGER_TOKEN}`) {
            response.status(401).end("Unauthorized")
            return
        }
    } catch (err) {
        response.status(500).json({ statusCode: 500, message: (err as Error).message })
        return
    }
    
    const fullData = await generateHnData(false)
    const smallData = removeCommentsFromHnData(fullData)
    try {
        await Promise.all([
            uploadString({Bucket: process.env.CF_BUCKET!, Key: "full-data.json", Body: JSON.stringify(fullData)}),
            uploadString({Bucket: process.env.CF_BUCKET!, Key: "small-data.json", Body: JSON.stringify(smallData)})
        ])
    } catch (e) {
        response.status(500).json({success: false, error: e})
        return
    }

    response.status(200).json({success: true})
}
