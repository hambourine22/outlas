import "server-only";

// Airtable REST client via native fetch (no SDK dependency).
// Docs: https://airtable.com/developers/web/api/create-records
// POST https://api.airtable.com/v0/<baseId>/<tableName>
//   Authorization: Bearer <token>
//   Content-Type: application/json
//   body: { fields: {...} }
// Returns: { id, createdTime, fields }

type AirtableCreateResult = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
};

export async function createAirtableRecord({
  token,
  baseId,
  tableName,
  fields,
}: {
  token: string;
  baseId: string;
  tableName: string;
  fields: Record<string, unknown>;
}): Promise<AirtableCreateResult> {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`airtable create failed: ${res.status} ${detail}`);
  }
  return (await res.json()) as AirtableCreateResult;
}

// Build a direct-record link so the notification email can jump straight
// to the submission in Airtable's UI.
export function airtableRecordLink(baseId: string, tableName: string, recordId: string): string {
  // Airtable's URL uses the table's ID, not its name — a limitation of the
  // open REST shape. If the base's primary view is attached to the given
  // table name, the generic "find record" link below works for staff.
  return `https://airtable.com/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
}
