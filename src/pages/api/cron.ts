import type {NextApiRequest, NextApiResponse} from 'next'
import {generateHnData, removeCommentsFromHnData} from "@/dataGeneration"
import {uploadString} from "@/s3";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    const fullData = await generateHnData()
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
