import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useAppInitContext } from "@/components/providers/app-init-provider";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { TicketCategory } from "@/features/tickets/types";
import { z } from "zod";

function generateServiceFormSchema(totalWards: number) {
  return z.object({
    serviceId: z
      .string()
      .trim()
      .min(1, "Service is required")
      .max(128, "Service id is too long"),
    subServiceId: z
      .string()
      .trim()
      .min(1, "Sub-service is required")
      .max(128, "Sub-service id is too long"),
    ticketCategory: z
      .enum([TicketCategory.SERVICE])
      .default(TicketCategory.SERVICE),
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
      .min(1, "Description is required")
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
    images: z.array(z.string()).max(3, "You can add at most 3 photos"),
  });
}

export type ServiceFormInputValues = z.input<
  ReturnType<typeof generateServiceFormSchema>
>;
export type ServiceFormValues = z.output<
  ReturnType<typeof generateServiceFormSchema>
>;

export function useServiceForm(
  defaultValues?: Partial<
    Pick<
      ServiceFormValues,
      "ward" | "ticketCategory" | "serviceId" | "phoneNumber"
    >
  >,
) {
  const { ulb } = useAppInitContext();
  const formSchema = useMemo(
    () => generateServiceFormSchema(ulb?.totalWards ?? 0),
    [ulb?.totalWards],
  );

  const form = useForm<ServiceFormInputValues>({
    resolver: standardSchemaResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      serviceId: "",
      subServiceId: "",
      ticketCategory: TicketCategory.SERVICE,
      ward: 1,
      description: "",
      locationSource: "current",
      images: [],
      ...defaultValues,
    },
  });

  useEffect(() => {
    form.register("ticketCategory", { value: TicketCategory.SERVICE });
  }, [form]);

  return { form, formSchema, parseFormValues: formSchema.parse };
}
