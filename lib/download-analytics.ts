import type { SqlDatabase } from "./repository";

export async function recordRecipeDownload(db: SqlDatabase, promptId: string, versionId: string, date = new Date()) {
  await db.prepare(`INSERT INTO recipe_download_counts(day,prompt_id,version_id,downloads) VALUES (?,?,?,1)
    ON CONFLICT(day,prompt_id,version_id) DO UPDATE SET downloads=downloads+1`)
    .bind(date.toISOString().slice(0, 10), promptId, versionId).run();
}

export async function downloadReport(db: SqlDatabase, date = new Date()) {
  const since = new Date(date);
  since.setUTCDate(since.getUTCDate() - 29);
  return (await db.prepare(`SELECT p.id,p.slug,p.title,COALESCE(SUM(d.downloads),0) AS downloads
    FROM prompts p JOIN recipe_projects r ON r.prompt_id=p.id
    LEFT JOIN recipe_download_counts d ON d.prompt_id=p.id AND d.day>=?
    GROUP BY p.id,p.slug,p.title ORDER BY downloads DESC,p.title`)
    .bind(since.toISOString().slice(0, 10)).all<{ id: string; slug: string; title: string; downloads: number }>()).results ?? [];
}
