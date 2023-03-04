import {S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";

export const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: `${process.env.CF_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.CF_SECRET_ACCESS_KEY}`,
    },
});

interface UploadStringParams {
    Bucket: string,
    Key: string,
    Body: string
}

export async function uploadString({Bucket, Key, Body}: UploadStringParams) {

    const parallelUploads3 = new Upload({
        client: s3,
        params: { Bucket, Key, Body },
    });

    await parallelUploads3.done();
}