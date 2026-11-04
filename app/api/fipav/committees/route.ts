import { NextResponse } from "next/server";

interface Commettee {
  id: string;
  nome: string;
  title: string;
  image: string;
  "region-title": string;
}

export async function GET() {
  try {

    const commettees = await fetch("https://app.fipavonline.it/api/v1/commettees").then(
      res => res.json().then(data => data.data.commettees.others.map((commette: Commettee) => ({
        id: commette.id,
        name: commette.nome,
        title: commette.title,
        image: commette.image,
        "region-title": commette["region-title"],
      })))
    );  

    return NextResponse.json(commettees, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Errore database" }, { status: 500 });
  }
}

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://volleyballsanmartino.it",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};
