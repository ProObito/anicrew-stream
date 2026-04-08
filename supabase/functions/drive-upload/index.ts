const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY");
    const FOLDER_ID = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID");

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_DRIVE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, fileUrl, fileName, folderId } = await req.json();
    const targetFolder = folderId || FOLDER_ID || "";

    if (action === "upload_from_url") {
      // Download file from URL then upload to Drive
      if (!fileUrl) {
        return new Response(
          JSON.stringify({ error: "fileUrl required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch the file
      const fileResp = await fetch(fileUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": "https://megacloud.tv/",
        },
      });

      if (!fileResp.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to download file: ${fileResp.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const blob = await fileResp.blob();
      const contentType = fileResp.headers.get("content-type") || "application/octet-stream";
      const finalName = fileName || `anime_${Date.now()}.mp4`;

      // Upload to Google Drive using resumable upload
      const metadata = {
        name: finalName,
        ...(targetFolder ? { parents: [targetFolder] } : {}),
      };

      // Initiate resumable upload
      const initResp = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&key=" + GOOGLE_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Type": contentType,
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!initResp.ok) {
        const err = await initResp.text();
        return new Response(
          JSON.stringify({ error: `Drive init failed: ${err}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const uploadUrl = initResp.headers.get("Location");
      if (!uploadUrl) {
        return new Response(
          JSON.stringify({ error: "No upload URL returned from Drive" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Upload the file
      const uploadResp = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });

      if (!uploadResp.ok) {
        const err = await uploadResp.text();
        return new Response(
          JSON.stringify({ error: `Drive upload failed: ${err}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const driveFile = await uploadResp.json();
      const driveUrl = `https://drive.google.com/file/d/${driveFile.id}/view`;
      const embedUrl = `https://drive.google.com/file/d/${driveFile.id}/preview`;

      return new Response(
        JSON.stringify({
          fileId: driveFile.id,
          driveUrl,
          embedUrl,
          name: driveFile.name,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: upload_from_url" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Drive upload error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
