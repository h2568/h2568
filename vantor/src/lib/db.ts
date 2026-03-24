import { neon } from "@neondatabase/serverless";
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
export async function initDb(): Promise<void> {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id          SERIAL PRIMARY KEY,
      full_name   TEXT NOT NULL,
      company     TEXT NOT NULL,
      phone       TEXT NOT NULL,
      email       TEXT NOT NULL,
      location    TEXT NOT NULL,
      crew_type   TEXT NOT NULL,
      event_dates TEXT NOT NULL,
      message     TEXT,
      ip_hash     TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
export interface Submission {
  id: number;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  location: string;
  crew_type: string;
  event_dates: string;
  message: string | null;
  ip_hash: string | null;
  created_at: string;
}
export async function saveSubmission(
  data: Omit<Submission, "id" | "created_at">
): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO submissions
      (full_name, company, phone, email, location, crew_type, event_dates, message, ip_hash)
    VALUES
      (${data.full_name}, ${data.company}, ${data.phone}, ${data.email},
       ${data.location}, ${data.crew_type}, ${data.event_dates},
       ${data.message ?? null}, ${data.ip_hash ?? null})
  `;
}
const PAGE_SIZE = 25;
export async function getSubmissionsPage(page: number): Promise<{
  rows: Submission[];
  total: number;
  pageSize: number;
}> {
  const sql = getDb();
  const offset = (page - 1) * PAGE_SIZE;
  const [rows, countResult] = await Promise.all([
    sql<Submission[]>`
      SELECT id, full_name, company, phone, email, location,
             crew_type, event_dates, message, ip_hash, created_at
      FROM submissions
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    sql<[{ count: string }]>`SELECT COUNT(*)::text AS count FROM submissions`,
  ]);
  return {
    rows,
    total: parseInt(countResult[0].count, 10),
    pageSize: PAGE_SIZE,
  };
}
