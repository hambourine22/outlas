import "server-only";

// Vercel Blob client via native fetch (no SDK dependency).
// Docs: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
// REST reference: PUT https://blob.vercel-storage.com/<pathname>
//   Authorization: Bearer <token>
//   x-content-type: <mime>
//   x-add-random-suffix: 1
//   body: raw bytes
// Returns: { url, pathname, contentType, contentDisposition }

type BlobPutResult = {
  url: string;
  pathname: string;
  contentType: string;
};

export async function putToBlob({
  token,
  pathname,
  mime,
  body,
}: {
  token: string;
  pathname: string;     // e.g. "rental-submissions/abc123.jpg"
  mime: string;
  body: Blob | ArrayBuffer | Uint8Array;
}): Promise<BlobPutResult> {
  const bytes =
    body instanceof Blob ? await body.arrayBuffer()
    : body instanceof ArrayBuffer ? body
    : body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength);

  const res = await fetch(`https://blob.vercel-storage.com/${encodeURI(pathname)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-content-type": mime,
      "x-add-random-suffix": "0",
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`blob upload failed: ${res.status} ${detail}`);
  }
  return (await res.json()) as BlobPutResult;
}
