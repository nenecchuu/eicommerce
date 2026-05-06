import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface UploadProofRequest {
  order_id: string;
  tenant_id: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const STORAGE_BUCKET = "payment-proofs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const order_id = formData.get("order_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const file = formData.get("file") as File | null;

    // Validate inputs
    if (!order_id) {
      return NextResponse.json({ error: "Order ID diperlukan" }, { status: 400 });
    }

    if (!tenant_id) {
      return NextResponse.json({ error: "Tenant ID diperlukan" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "File diperlukan" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak valid. Gunakan JPG, PNG, atau PDF." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Verify order exists and belongs to tenant
    const { data: order } = await supabase
      .from("orders")
      .select("id, tenant_id, status_text, payment_proof_url")
      .eq("id", order_id)
      .eq("tenant_id", tenant_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.status_text === "completed" || order.status_text === "cancelled") {
      return NextResponse.json(
        { error: `Pesanan tidak dapat diubah (status: ${order.status_text})` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${order_id}_${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { getStorageClient } = await import("@/lib/supabase/storage");
    const storage = await getStorageClient();

    const { data: uploadData, error: uploadError } = await storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error("[Upload Proof API] Upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengupload bukti transfer" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: "Gagal mendapatkan URL file" },
        { status: 500 }
      );
    }

    // Update order with payment proof URL
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_proof_url: publicUrlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("[Upload Proof API] Update error:", updateError);
      // Try to delete uploaded file (best effort)
      await storage.from(STORAGE_BUCKET).remove([fileName]);
      return NextResponse.json(
        { error: "Gagal menyimpan bukti transfer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order_id,
        payment_proof_url: publicUrlData.publicUrl,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Upload Proof API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
