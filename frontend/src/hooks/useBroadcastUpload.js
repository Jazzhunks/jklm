import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { waAPI } from "@/lib/api";

export function useBroadcastUpload() {
  const { mutateAsync, isPending, data } = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return waAPI.uploadContacts(fd);
    },
    onSuccess: (res) => {
      res.warnings?.forEach(w => toast.warning(w));
      toast.success(`Imported ${res.contacts_imported} contacts`);
    },
    onError: (e) => toast.error(e.response?.data?.detail || e.message || "Upload failed")
  });
  return { uploading: isPending, result: data, upload: mutateAsync };
}
