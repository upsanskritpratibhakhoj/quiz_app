const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DIST_PATH = path.resolve(__dirname, "../dist");
const appJsonPath = path.resolve(__dirname, "../app.json");
let defaultRuntimeVersion = "1.0.1";
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    defaultRuntimeVersion = appJson.expo?.runtimeVersion || defaultRuntimeVersion;
  } catch (e) {}
}

const SERVER_URL = process.env.OTA_SERVER_URL || "https://vakyashilpi-ota-server.jayesh152005.workers.dev";
const UPLOAD_SECRET = process.env.UPLOAD_SECRET || "vakyashilpi_secret_ota_key_2026";
const RUNTIME_VERSION = process.env.RUNTIME_VERSION || defaultRuntimeVersion;

async function main() {
  console.log("🚀 Starting automated OTA update publish process for Android...");

  if (!fs.existsSync(DIST_PATH)) {
    console.error(`❌ Error: Export directory not found at ${DIST_PATH}.`);
    console.error("Please run 'bunx expo export -p android' first.");
    process.exit(1);
  }

  const metadataPath = path.join(DIST_PATH, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ Error: metadata.json not found in ${DIST_PATH}.`);
    process.exit(1);
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const androidMeta = metadata.fileMetadata?.android;

  if (!androidMeta) {
    console.error("❌ Error: Android metadata missing in metadata.json");
    process.exit(1);
  }

  console.log(`📦 Android Launch Bundle: ${androidMeta.bundle}`);
  console.log(`📁 Assets count: ${androidMeta.assets?.length || 0}`);

  const updateId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const filesToUpload = [];

  // Read Launch JS Bundle
  const bundleRelativePath = androidMeta.bundle;
  const bundleFullPath = path.join(DIST_PATH, bundleRelativePath);

  if (!fs.existsSync(bundleFullPath)) {
    console.error(`❌ Bundle file not found at ${bundleFullPath}`);
    process.exit(1);
  }

  const bundleBuffer = fs.readFileSync(bundleFullPath);
  const bundleHash = crypto.createHash("sha256").update(bundleBuffer).digest("hex");
  const bundleKey = `${bundleHash}.js`;

  filesToUpload.push({
    key: bundleKey,
    contentBase64: bundleBuffer.toString("base64"),
    contentType: "application/javascript",
  });

  const launchAsset = {
    key: bundleKey,
    contentType: "application/javascript",
    url: `${SERVER_URL}/assets/${bundleKey}`,
  };

  // Read Assets
  const assetsList = [];
  for (const assetObj of androidMeta.assets || []) {
    const assetRelPath = assetObj.path;
    const assetFullPath = path.join(DIST_PATH, assetRelPath);

    if (fs.existsSync(assetFullPath)) {
      const assetBuffer = fs.readFileSync(assetFullPath);
      const sha256 = crypto.createHash("sha256").update(assetBuffer).digest("hex");
      const ext = path.extname(assetRelPath) || `.${assetObj.ext || "png"}`;
      const assetKey = `${sha256}${ext}`;

      filesToUpload.push({
        key: assetKey,
        contentBase64: assetBuffer.toString("base64"),
        contentType: getContentType(ext),
      });

      assetsList.push({
        hash: crypto.createHash("sha256").update(assetBuffer).digest("base64url"),
        key: assetKey,
        contentType: getContentType(ext),
        fileExtension: ext,
        url: `${SERVER_URL}/assets/${assetKey}`,
      });
    }
  }

  const manifest = {
    id: updateId,
    createdAt,
    runtimeVersion: RUNTIME_VERSION,
    launchAsset,
    assets: assetsList,
    metadata: {},
    extra: {},
  };

  console.log(`📤 Uploading update ${updateId} to ${SERVER_URL}/api/upload...`);

  const headers = {
    "Content-Type": "application/json",
  };
  if (UPLOAD_SECRET) {
    headers["Authorization"] = `Bearer ${UPLOAD_SECRET}`;
  }

  const response = await fetch(`${SERVER_URL}/api/upload`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      runtimeVersion: RUNTIME_VERSION,
      platform: "android",
      manifest,
      files: filesToUpload,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`❌ Upload failed (${response.status}): ${text}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log("✅ OTA update published successfully!");
  console.log(JSON.stringify(result, null, 2));
}

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".ttf":
      return "font/ttf";
    case ".otf":
      return "font/otf";
    case ".json":
      return "application/json";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
}

main().catch((err) => {
  console.error("❌ Publishing error:", err);
  process.exit(1);
});
