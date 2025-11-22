export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- Upload file ---
    if (request.method === "POST" && path === "/upload") {
      const form = await request.formData();
      const file = form.get("file");
      const prompt = form.get("prompt") || "";
      const tags = (form.get("tags") || "")
        .split(/[,\s]+/)
        .filter(Boolean);

      if (!file) {
        return new Response("No file", { status: 400 });
      }

      // Generate random filename
      const key = `${Date.now()}-${file.name}`;

      // Upload to R2
      await env.MEDIA.put(key, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      const fileUrl = `https://pub-${env.MEDIA.bucket_name}.r2.dev/${key}`;

      // Save metadata to KV
      const item = {
        id: key,
        prompt,
        tags,
        fileUrl,
        created: Date.now()
      };
      await env.META.put(key, JSON.stringify(item));

      return Response.json(item);
    }

    // --- List all items ---
    if (request.method === "GET" && path === "/items") {
      const list = await env.META.list();
      const items = [];

      for (const k of list.keys) {
        const raw = await env.META.get(k.name);
        if (raw) items.push(JSON.parse(raw));
      }

      return Response.json(items);
    }

    // --- Search by tag ---
    if (request.method === "GET" && path === "/search") {
      const tag = url.searchParams.get("tag");
      if (!tag) return Response.json([]);

      const list = await env.META.list();
      const items = [];

      for (const k of list.keys) {
        const raw = await env.META.get(k.name);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.tags.includes(tag)) items.push(data);
        }
      }

      return Response.json(items);
    }

    return new Response("Not found", { status: 404 });
  }
};
