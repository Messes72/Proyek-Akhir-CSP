"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface PaymentUploadProps {
  bookingId: string;
  onUploadComplete: () => void;
}

export default function PaymentUpload({
  bookingId,
  onUploadComplete,
}: PaymentUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Pilih gambar untuk diupload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${bookingId}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) {
        console.error(
          "Supabase Storage Error Details:",
          JSON.stringify(uploadError, null, 2)
        );
        throw uploadError;
      }

      // 2. Get Public URL (if public) or Signed URL.
      // Requirement says: "Saat upload bukti pembayaran → simpan signed URL (private) dan simpan path di bookings.proof_of_payment_url."
      // Actually simpler to store just the path and generate signed URL on display, OR store the path.
      // Let's store the path.

      // 3. Update bookings table
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          proof_of_payment_url: filePath,
          // Optionally auto-update status if logic requires, but requirement says manual approve.
          // Maybe status -> 'pending' (keep) or specialized 'awaiting_approval'?
          // Requirement: "booking dapat di-mark confirmed setelah bukti upload (manual approve)"
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error(
          "Supabase Database Error Details:",
          JSON.stringify(updateError, null, 2)
        );
        throw updateError;
      }

      alert("Bukti pembayaran berhasil diupload!");
      onUploadComplete();
    } catch (err: unknown) {
      console.error("Full Upload Error Object:", JSON.stringify(err, null, 2));
      console.error("Upload error (raw):", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "message" in err) {
        setError(String((err as { message: unknown }).message));
      } else {
        setError("Terjadi kesalahan saat upload.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2">
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <label className="block text-sm font-medium text-gray-700">
        Upload Bukti Pembayaran
      </label>
      <div className="mt-1 flex items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {uploading && (
          <span className="ml-2 text-sm text-gray-500">Uploading...</span>
        )}
      </div>
    </div>
  );
}
