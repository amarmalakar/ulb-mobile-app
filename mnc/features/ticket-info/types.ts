import type { StaffTicketDetail, UserTicketDetail } from "@/features/tickets/types";

export type TicketInfoAuthType = "Staff" | "User";

export type TicketInfoTicket = UserTicketDetail | StaffTicketDetail;
