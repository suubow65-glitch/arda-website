import { noStoreJson } from "@/lib/apiCache";
import { requireAdmin, uploadPublicFile } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const form = await request.formData();
    const file = form.get("image") as File | null;
    const updates: Record<string, unknown> = {};

    for (const key of [
      "title",
      "category",
      "description",
      "button_text",
      "button_link",
      "image_url",
    ]) {
      const value = form.get(key);
      if (typeof value === "string") updates[key] = value;
    }
    if (form.get("order_index") != null) {
      updates.order_index = Number(form.get("order_index"));
    }
    if (form.get("active") != null) {
      updates.active = String(form.get("active")) === "true";
    }
    if (file && file.size > 0) {
      updates.image_url = await uploadPublicFile(supabase, "slide-images", file);
    }

    const { data, error: updateError } = await supabase
      .from("slides")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .single();
    if (updateError) {
      return noStoreJson({ error: updateError.message }, { status: 400 });
    }
    return noStoreJson({ slide: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) {
    return noStoreJson(
      { error: "Supabase is not configured. Add URL and keys to .env.local." },
      { status: 503 }
    );
  }
  try {
    const { error: deleteError } = await supabase
      .from("slides")
      .delete()
      .eq("id", params.id);
    if (deleteError) {
      return noStoreJson({ error: deleteError.message }, { status: 400 });
    }
    return noStoreJson({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return noStoreJson({ error: message }, { status: 500 });
  }
}
