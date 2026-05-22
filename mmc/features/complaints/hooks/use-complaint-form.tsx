import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useAppInitContext } from "@/components/provider/app-init-provider";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { TicketCategory } from "@/features/tickets/types";
import { z } from "zod";

function generateComplaintFormSchema(totalWards: number) {
  return z.object({
    complaintId: z
      .string()
      .trim()
      .min(1, "Complaint type is required")
      .max(128, "Complaint type id is too long"),
    ticketCategory: z
      .enum([TicketCategory.COMPLIANT])
      .default(TicketCategory.COMPLIANT),
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(500, "Title must be at most 500 characters"),
    ward: (() => {
      const base = z.coerce
        .number({ error: "Ward must be a number" })
        .int("Ward must be a whole number")
        .min(1, "Ward number must be at least 1");
      return totalWards > 0
        ? base.max(totalWards, `Ward number must be at most ${totalWards}`)
        : base;
    })(),
    phoneNumber: z.coerce
      .string()
      .trim()
      .regex(/^\+?[0-9]{8,15}$/, "Enter a valid phone number"),
    description: z
      .string()
      .trim()
      .min(56, "Description must be at least 56 characters")
      .max(10_000, "Description must be at most 10,000 characters"),
    locationAddress: z
      .string()
      .trim()
      .max(2000, "Location must be at most 2,000 characters")
      .optional()
      .or(z.literal("")),
    locationSource: z.enum(["current", "profile"]),
    latitude: z
      .number()
      .min(-90, "Latitude must be ≥ -90")
      .max(90, "Latitude must be ≤ 90")
      .optional(),
    longitude: z
      .number()
      .min(-180, "Longitude must be ≥ -180")
      .max(180, "Longitude must be ≤ 180")
      .optional(),
    images: z.array(z.string()).max(3, "You can add at most 3 photos")
  });
}

export type ComplaintFormInputValues = z.input<
  ReturnType<typeof generateComplaintFormSchema>
>;
export type ComplaintFormValues = z.output<
  ReturnType<typeof generateComplaintFormSchema>
>;

export function useComplaintForm(
  defaultValues?: Partial<
    Pick<ComplaintFormValues, "phoneNumber" | "ward" | "ticketCategory" | "complaintId">
  >
) {
  const { ulb } = useAppInitContext();
  const formSchema = useMemo(
    () => generateComplaintFormSchema(ulb?.totalWards ?? 0),
    [ulb?.totalWards],
  );

  const form = useForm<ComplaintFormInputValues>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      complaintId: "",
      ticketCategory: TicketCategory.COMPLIANT,
      ward: 1,
      title: "",
      description: "",
      locationSource: "current",
      images: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    form.register("ticketCategory", { value: TicketCategory.COMPLIANT });
  }, [form]);

  return { form, formSchema, parseFormValues: formSchema.parse };
}
