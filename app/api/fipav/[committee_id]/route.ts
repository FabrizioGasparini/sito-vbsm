import { NextRequest, NextResponse } from "next/server";
import { Championship } from "@/lib/matches-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ committee_id: string }> }) {
  try {

    const { committee_id } = await params;

    const championships = await fetch(`https://app.fipavonline.it/api/v1/calendar/${committee_id}`).then(
      res => res.json().then(data => data.data.map((championship: Championship) => ({
        id: championship.id,
        parent: championship.parent,
        title: championship["title-short"],
        name: championship.title,
      })))
    );

    return NextResponse.json(championships, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error fetching championships" }, { status: 500 });
  }
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};
