// HTML email template for the post-purchase delivery.
//
// We deliberately keep this self-contained (no Tailwind, no React) so it
// renders the same in Gmail / Outlook / Apple Mail without needing a
// CSS-in-email library.

interface BuildEmailParams {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
  productKind: "keepsake" | "signature";
  cardUrl: string;
  svgHorizontalUrl?: string;
  svgVerticalUrl?: string;
  brandSiteUrl: string;
  supportEmail: string;
}

export function buildOrderEmail(p: BuildEmailParams): { subject: string; html: string; text: string } {
  const isSignature = p.productKind === "signature";

  const subject = `${p.chineseName} (${p.pinyin}) — your Ink Name keepsake is ready 🖌`;

  const text = [
    `Thank you for your purchase!`,
    ``,
    `Your Chinese name: ${p.chineseName} (${p.pinyin})`,
    `Meaning: ${p.meaning}`,
    p.classicalAllusion ? `Classical allusion: ${p.classicalAllusion}` : null,
    ``,
    `📄 HD calligraphy card (PNG):`,
    `   ${p.cardUrl}`,
    isSignature && p.svgHorizontalUrl ? `\n✒️  Tattoo-ready SVG (horizontal):\n   ${p.svgHorizontalUrl}` : null,
    isSignature && p.svgVerticalUrl ? `\n✒️  Tattoo-ready SVG (vertical):\n   ${p.svgVerticalUrl}` : null,
    isSignature
      ? `\n🎬 Brushstroke MP4: arriving within 24 hours by separate email — reply if you don't see it.`
      : null,
    ``,
    `Questions? Just reply to this email.`,
    ``,
    `— Ink Name · 落墨即名`,
    `${p.brandSiteUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  // ---------------- HTML ----------------
  const downloadButton = (label: string, url: string) =>
    `<a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 22px;border-radius:9999px;background:linear-gradient(135deg,#c2392c 0%,#7e1810 100%);color:#fbf2e2;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.02em;">${escapeHtml(label)}</a>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#fbf6ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f1410;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fbf6ee;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px -24px rgba(60,38,22,0.18);">
          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 8px;text-align:center;">
              <div style="font-size:11px;letter-spacing:0.4em;color:#a8770a;text-transform:uppercase;">墨名 · INK NAME</div>
            </td>
          </tr>

          <!-- Big calligraphy name -->
          <tr>
            <td style="padding:8px 40px 4px;text-align:center;">
              <div style="font-size:80px;font-weight:700;color:#1f1410;letter-spacing:-0.02em;line-height:1;">
                ${escapeHtml(p.chineseName)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 4px;text-align:center;">
              <div style="font-size:20px;letter-spacing:0.18em;color:#5a4332;font-style:italic;">
                ${escapeHtml(p.pinyin)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;text-align:center;">
              <div style="font-size:15px;color:#5a4332;font-style:italic;line-height:1.5;">
                &ldquo;${escapeHtml(p.meaning)}&rdquo;
              </div>
            </td>
          </tr>

          ${
            p.classicalAllusion
              ? `<tr><td style="padding:0 40px 24px;text-align:center;">
                   <div style="font-size:11px;letter-spacing:0.4em;color:#a8770a;text-transform:uppercase;margin-bottom:6px;">典 · Classical Allusion</div>
                   <div style="font-size:13px;color:#3a2a1f;line-height:1.6;font-style:italic;">${escapeHtml(p.classicalAllusion)}</div>
                 </td></tr>`
              : ""
          }

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e7e5e4;margin:0;" />
            </td>
          </tr>

          <!-- Body intro -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#1f1410;">Your downloads</h2>
              <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#57534e;">
                Each link generates a fresh file with your name. Tap to open or right-click to save.
              </p>
            </td>
          </tr>

          <!-- HD card -->
          <tr>
            <td style="padding:0 40px 20px;">
              <div style="background:#faf6ee;border:1px solid #e7e5e4;border-radius:14px;padding:20px 22px;">
                <div style="font-size:14px;font-weight:600;color:#1f1410;margin-bottom:4px;">📄 HD calligraphy card</div>
                <div style="font-size:13px;color:#78716c;margin-bottom:14px;">2400 × 1600 PNG · print or set as wallpaper</div>
                ${downloadButton("Download PNG", p.cardUrl)}
              </div>
            </td>
          </tr>

          ${
            isSignature && p.svgHorizontalUrl
              ? `<tr><td style="padding:0 40px 20px;">
                  <div style="background:#faf6ee;border:1px solid #e7e5e4;border-radius:14px;padding:20px 22px;">
                    <div style="font-size:14px;font-weight:600;color:#1f1410;margin-bottom:4px;">✒️ Tattoo-ready SVG · horizontal</div>
                    <div style="font-size:13px;color:#78716c;margin-bottom:14px;">Transparent vector · scales to any size</div>
                    ${downloadButton("Download SVG", p.svgHorizontalUrl)}
                  </div>
                </td></tr>`
              : ""
          }

          ${
            isSignature && p.svgVerticalUrl
              ? `<tr><td style="padding:0 40px 20px;">
                  <div style="background:#faf6ee;border:1px solid #e7e5e4;border-radius:14px;padding:20px 22px;">
                    <div style="font-size:14px;font-weight:600;color:#1f1410;margin-bottom:4px;">✒️ Tattoo-ready SVG · vertical (traditional column)</div>
                    <div style="font-size:13px;color:#78716c;margin-bottom:14px;">Transparent vector · scales to any size</div>
                    ${downloadButton("Download SVG", p.svgVerticalUrl)}
                  </div>
                </td></tr>`
              : ""
          }

          ${
            isSignature
              ? `<tr><td style="padding:0 40px 20px;">
                  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:14px;padding:18px 22px;">
                    <div style="font-size:14px;font-weight:600;color:#7c2d12;margin-bottom:4px;">🎬 Brushstroke MP4 — coming separately</div>
                    <div style="font-size:13px;color:#92400e;line-height:1.5;">
                      We render a unique MP4 of your name being brushed and email it
                      within 24 hours. If you don't see it, just reply to this email.
                    </div>
                  </div>
                </td></tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 40px;border-top:1px solid #e7e5e4;">
              <p style="margin:0 0 10px;font-size:13px;color:#78716c;line-height:1.6;">
                Save this email — your download links don't expire.
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:#78716c;line-height:1.6;">
                Questions, edits, or anything off? Just reply to this email — a
                human reads every one.
              </p>
              <p style="margin:18px 0 0;font-size:11px;letter-spacing:0.4em;color:#a8770a;text-transform:uppercase;text-align:center;">
                落墨即名 · ink falls. the name appears.
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#a8a29e;text-align:center;">
                <a href="${escapeHtml(p.brandSiteUrl)}" style="color:#a8770a;text-decoration:none;">${escapeHtml(p.brandSiteUrl.replace(/^https?:\/\//, ""))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
