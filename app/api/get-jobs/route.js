import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION });
const JOBS_TABLE = "Jobs";

export async function GET(req) {
    try {
        // ✅ Extract userId from query params
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // ✅ Query DynamoDB
        const command = new ScanCommand({
            TableName: JOBS_TABLE,
            FilterExpression: "userId = :uid",
            ExpressionAttributeValues: {
                ":uid": { S: userId },
            },
        });

        const data = await dynamo.send(command);

        // ✅ Transform results
        const jobs = (data.Items || []).map((item) => ({
            jobId: item.jobId.S,
            title: item.title?.S || "",
            description: item.description?.S || "",
            createdAt: item.createdAt?.S || "",
        }));

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}
