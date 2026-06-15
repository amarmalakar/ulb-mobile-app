import type { AxiosInstance } from "axios";
import { useMutation } from "@tanstack/react-query";

import { useNetworkContext } from "@/components/providers/network-provider";
import { useUserAuth } from "@/components/providers/user-auth-provider";
import { API_PATHS } from "@/lib/api-paths";
import { userBearerHeaders, throwUnlessOk } from "@/features/user-auth/utils/api-response";
import type {
  CreateUserServiceTicketRequest,
  CreateUserServiceTicketResult,
} from "@/features/service/types";

type CreateUserServiceTicketApiResponse = {
  ok: boolean;
  data?: CreateUserServiceTicketResult;
  message?: string;
};

async function postUserServiceTicket(
  client: AxiosInstance,
  accessToken: string,
  body: CreateUserServiceTicketRequest,
): Promise<CreateUserServiceTicketResult> {
  const res = (await client.post(API_PATHS.user.tickets, body, {
    headers: userBearerHeaders(accessToken),
  })) as CreateUserServiceTicketApiResponse;

  return throwUnlessOk(res, "Failed to submit service request");
}

/** Creates a ticket via `POST /user/tickets`. */
export function useCreateUserServiceTicketMutation() {
  const { client, queryClient } = useNetworkContext();
  const { session } = useUserAuth();
  const accessToken = session?.accessToken;

  return useMutation<
    CreateUserServiceTicketResult,
    Error,
    CreateUserServiceTicketRequest
  >({
    mutationFn: async (body) => {
      const token = accessToken;
      if (!token) {
        throw new Error("You must be signed in to submit a service request");
      }
      return postUserServiceTicket(client, token, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", "tickets"] });
    },
  });
}
