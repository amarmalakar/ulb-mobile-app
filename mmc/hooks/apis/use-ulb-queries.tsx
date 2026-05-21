import { useNetworkContext } from "@/components/provider/network-provider";
import { useQuery } from "@tanstack/react-query";

export interface iUlb {
  id: string;
  ulbId: string;
  key: string;
  name: string;
  active: boolean;
  totalWards: number;
  createdAt: string;
  updatedAt: string;
}

export interface iUlbByIdRes {
  ok: boolean;
  data: iUlb;
}

export function useGetUlbById(enabled = true) {
  const { client, ulbId } = useNetworkContext();

  const { data: ulb, isLoading, error, isError } = useQuery<iUlbByIdRes, Error>({
    queryKey: ['ulb', ulbId],
    queryFn: () => client.get(`/ulb`),
    enabled,
  });

  const totalWards = ulb?.data?.totalWards ?? 0;
  const wards = Array.from({ length: totalWards }, (_, index) => index + 1) as number[] || [];

  return {
    ulb: ulb?.data,
    wards,
    isLoading,
    isError,
    error,
  }
}