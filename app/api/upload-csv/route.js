import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamo = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export async function POST(req) {
  try {
    

    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const description = formData.get("description");
    const userId = formData.get("userId")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const jobId = randomUUID()
    const filePath = `job/${jobId}.csv`

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        title,
        description,
        jobId,
        userId
      },
    };

    await s3.send(new PutObjectCommand(uploadParams));

    await dynamo.send(
      new PutItemCommand({
        TableName: "Jobs",
        Item: {
          jobId: { S: jobId },
          userId: { S: userId },
          title: { S: title || "Untitles" },
          description: { S: description || "No Description" },
          filePath: { S: filePath },
          createdAt: { S: new Date().toISOString() }
        }
      })
    )

    return NextResponse.json({
      success: true,
      jobId,
      filePath
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
