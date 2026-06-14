import { View } from "react-native";

import { KeyboardFormScroll } from "@/components/common/keyboard-form-scroll";
import { Controller } from "react-hook-form";
import { Typography } from "@/components/common/typography";
import { Button } from "@/components/ui/button";
import { EMAIL_MAX_LENGTH, MOBILE_NUMBER_LENGTH, OTP_LENGTH } from "./constants";
import { useStaffLoginForm, type UseStaffLoginFormOptions } from "./hooks/use-staff-login-form";
import { ContactMethodToggle } from "./components/contact-method-toggle";
import { StaffMobileInput } from "./components/staff-mobile-input";
import { StaffEmailInput } from "./components/staff-email-input";
import { StaffOtpInput } from "./components/staff-otp-input";

export type StaffAuthProps = UseStaffLoginFormOptions;

export default function StaffAuth({ onVerified }: StaffAuthProps) {
  const {
    step,
    isLoading,
    isVerifyingOtp,
    isResending,
    sendError,
    clearSendError,
    contactForm,
    otpForm,
    switchMethod,
    activeContact,
    goBackToContact,
    resendOtp,
    stepsActions,
  } = useStaffLoginForm({ onVerified });

  const method = contactForm.watch("method");
  const otp = otpForm.watch("otp");

  return (
    <KeyboardFormScroll scrollViewProps={{ contentContainerClassName: 'flex-grow' }}>
      <View className="mt-12 gap-4">
        {step === "contact" ? (
          <>
            <Controller
              control={contactForm.control}
              name="method"
              render={({ field: { value } }) => (
                <ContactMethodToggle
                  value={value}
                  onChange={switchMethod}
                  disabled={isLoading}
                />
              )}
            />

            {method === "phone" ? (
              <Controller
                control={contactForm.control}
                name="mobileNumber"
                render={({ field, fieldState }) => (
                  <StaffMobileInput
                    value={field.value}
                    onChangeText={(text) =>
                      field.onChange(text.replace(/\D/g, "").slice(0, MOBILE_NUMBER_LENGTH))
                    }
                    maxLength={MOBILE_NUMBER_LENGTH}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />
            ) : (
              <Controller
                control={contactForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <StaffEmailInput
                    value={field.value}
                    onChangeText={field.onChange}
                    maxLength={EMAIL_MAX_LENGTH}
                    error={fieldState.error?.message}
                    disabled={isLoading}
                  />
                )}
              />
            )}

            {sendError ? (
              <Typography variant="body2" color="destructive" className="px-1">{sendError}</Typography>
            ) : null}
          </>
        ) : activeContact ? (
          <>
            <StaffOtpInput
              value={otp ?? ""}
              onChangeText={(text) => {
                otpForm.setValue("otp", text, { shouldDirty: true });
                clearSendError();
              }}
              error={otpForm.formState.errors.otp?.message}
              cellCount={OTP_LENGTH}
              contact={activeContact}
              onChangeContact={goBackToContact}
              disabled={isVerifyingOtp || isResending}
              onResend={resendOtp}
            />
            {sendError ? (
              <Typography variant="body2" color="destructive" className="px-1">{sendError}</Typography>
            ) : null}
          </>
        ) : null}
      </View>

      <Button
        disabled={isLoading}
        className="mt-auto h-14 rounded-lg bg-primary"
        onPress={stepsActions.onPress}
      >
        <Typography variant="h5" weight="bold" className="text-white">
          {isLoading ? stepsActions.loadingText : stepsActions.title}
        </Typography>
      </Button>
    </KeyboardFormScroll>
  );
}
