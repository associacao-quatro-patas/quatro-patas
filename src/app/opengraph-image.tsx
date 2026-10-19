import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Imagem de compartilhamento (WhatsApp, redes sociais): logo oficial sobre
// Rosa Pastel, sem recolorir nem distorcer. Gerada no build.
export const alt = `${siteConfig.logo.alt} — ${siteConfig.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo-4patas.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #ffeaf2 55%, #ffd6e7 100%)",
          padding: "60px 80px",
          textAlign: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={logoSrc} width={150} height={150} alt="" style={{ borderRadius: 9999 }} />
        <div style={{ marginTop: 36, fontSize: 64, fontWeight: 700, color: "#b3125b" }}>{siteConfig.name}</div>
        <div style={{ marginTop: 18, fontSize: 28, color: "#2e2e2e", lineHeight: 1.35, maxWidth: 1000 }}>
          Adoção responsável e proteção animal em Manaus (AM)
        </div>
        <div style={{ marginTop: 22, fontSize: 20, color: "#5c5458", lineHeight: 1.35, maxWidth: 1040 }}>
          {siteConfig.fullName}
        </div>
      </div>
    ),
    size,
  );
}
