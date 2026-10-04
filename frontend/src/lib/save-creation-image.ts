// Best-effort persistence of a generated image onto its creation row (see
// /api/creations/[id]). Fire-and-forget by design: a failure here must never
// surface to the visitor or block the art they're already looking at — it
// only means that piece won't appear later in "My Names".
export function saveImageToCreation(
  creationId: string | undefined,
  field: "calligraphyImageData" | "sealImageData",
  imageDataUrl: string,
) {
  if (!creationId) return;
  fetch(`/api/creations/${creationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: imageDataUrl }),
  }).catch((err) => {
    console.warn("[save-creation-image] failed to save image to account:", err);
  });
}
