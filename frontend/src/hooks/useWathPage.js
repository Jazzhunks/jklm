import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWathPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["wathPage"],
    queryFn: () => api.get("/wath/page").then(r => r.data || null)
  });
  // ponytail: standard react-query replaces hand-rolled state
  return { pageState: data, loading: isLoading, load: refetch };
}
