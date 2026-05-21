import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkContext } from "@/components/provider/network-provider";
import { isApiError } from "@/lib/api-client";

import { MPIN_LENGTH, OTP_LENGTH } from "../constants";
import {
	useUserMpinResetConfirmMutation,
	useUserMpinResetOtpSendMutation,
	useUserMpinSetMutation,
	useUserMpinStatusQuery,
	useUserMpinVerifyMutation,
} from "./use-user-auth-queries";
import { userQueryKeys } from "../query-keys";
import { USER_MPIN_MESSAGES } from "../messages";

type FlowStep =
	| "loading"
	| "locked"
	| "enter_mpin"
	| "create_mpin"
	| "reset_mpin";

export function useUserMpinFlow(
	accessToken: string,
	refreshToken: string,
	onComplete: () => void,
	onSessionTokens: (tokens: { accessToken: string; refreshToken?: string }) => void | Promise<void>,
) {
	const { queryClient } = useNetworkContext();
	const inResetWizard = useRef(false);

	const statusQuery = useUserMpinStatusQuery(accessToken);
	const setMutation = useUserMpinSetMutation();
	const verifyMutation = useUserMpinVerifyMutation();
	const resetRequestMutation = useUserMpinResetOtpSendMutation();
	const resetConfirmMutation = useUserMpinResetConfirmMutation();

	const [step, setStep] = useState<FlowStep>("loading");
	const [createMpin, setCreateMpin] = useState("");
	const [createConfirm, setCreateConfirm] = useState("");
	const [enterMpin, setEnterMpin] = useState("");
	const [resetOtp, setResetOtp] = useState("");
	const [resetToken, setResetToken] = useState<string | null>(null);
	const [resetNew, setResetNew] = useState("");
	const [resetNewConfirm, setResetNewConfirm] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const invalidateStatus = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: userQueryKeys.mpinStatus(accessToken),
		});
	}, [accessToken, queryClient]);

	const errorMessage = (error: unknown, fallback: string) =>
		isApiError(error) ? error.message : error instanceof Error ? error.message : fallback;

	useEffect(() => {
		if (inResetWizard.current) return;

		if (statusQuery.isLoading) {
			setStep("loading");
			return;
		}
		if (statusQuery.isError) {
			setStep("loading");
			return;
		}

		const data = statusQuery.data;
		if (!data) {
			setStep("loading");
			return;
		}

		if (data.locked) {
			setStep("locked");
			return;
		}

		setStep(data.mpinSet ? "enter_mpin" : "create_mpin");
	}, [statusQuery.data, statusQuery.isLoading, statusQuery.isError]);

	const clearErrors = useCallback(() => {
		setFormError(null);
	}, []);

	const submitCreate = useCallback(async () => {
		clearErrors();
		if (createMpin.length !== MPIN_LENGTH || createConfirm.length !== MPIN_LENGTH) {
			setFormError("MPIN must be 4 digits");
			return;
		}
		if (createMpin !== createConfirm) {
			setFormError("MPINs do not match");
			return;
		}
		try {
			const res = await setMutation.mutateAsync({
				accessToken,
				mpin: createMpin,
				confirmMpin: createConfirm,
			});
			if (res.accessToken) {
				await onSessionTokens({ accessToken: res.accessToken });
			} else {
				const verified = await verifyMutation.mutateAsync({
					mpin: createMpin,
					refreshToken,
				});
				await onSessionTokens({
					accessToken: verified.accessToken,
					refreshToken: verified.refreshToken,
				});
			}
			invalidateStatus();
			onComplete();
		} catch (e) {
			setFormError(errorMessage(e, "Could not save MPIN"));
		}
	}, [
		accessToken,
		clearErrors,
		createConfirm,
		createMpin,
		invalidateStatus,
		onComplete,
		onSessionTokens,
		refreshToken,
		setMutation,
		verifyMutation,
	]);

	const submitEnter = useCallback(async () => {
		clearErrors();
		if (enterMpin.length !== MPIN_LENGTH) {
			setFormError("MPIN must be 4 digits");
			return;
		}
		try {
			const out = await verifyMutation.mutateAsync({
				mpin: enterMpin,
				refreshToken,
			});
			await onSessionTokens({
				accessToken: out.accessToken,
				refreshToken: out.refreshToken,
			});
			invalidateStatus();
			onComplete();
		} catch (e) {
			setFormError(errorMessage(e, "Incorrect MPIN"));
			setEnterMpin("");
		}
	}, [
		clearErrors,
		enterMpin,
		invalidateStatus,
		onComplete,
		onSessionTokens,
		refreshToken,
		verifyMutation,
	]);

	const startReset = useCallback(async () => {
		clearErrors();
		try {
			const { resetToken: token } = await resetRequestMutation.mutateAsync({
				accessToken,
			});
			inResetWizard.current = true;
			setResetToken(token);
			setResetOtp("");
			setResetNew("");
			setResetNewConfirm("");
			setStep("reset_mpin");
		} catch (e) {
			setFormError(errorMessage(e, "Could not start reset"));
		}
	}, [accessToken, clearErrors, resetRequestMutation]);

	const submitResetNew = useCallback(async () => {
		clearErrors();
		if (!resetToken) {
			setFormError("Reset session expired. Try again.");
			return;
		}
		if (resetOtp.length < 4 || resetOtp.length > OTP_LENGTH) {
			setFormError("Enter the SMS code");
			return;
		}
		if (resetNew.length !== MPIN_LENGTH || resetNewConfirm.length !== MPIN_LENGTH) {
			setFormError("MPIN must be 4 digits");
			return;
		}
		if (resetNew !== resetNewConfirm) {
			setFormError("MPINs do not match");
			return;
		}
		try {
			await resetConfirmMutation.mutateAsync({
				resetToken,
				otp: resetOtp,
				mpin: resetNew,
				confirmMpin: resetNewConfirm,
			});
			const out = await verifyMutation.mutateAsync({
				mpin: resetNew,
				refreshToken,
			});
			await onSessionTokens({
				accessToken: out.accessToken,
				refreshToken: out.refreshToken,
			});
			inResetWizard.current = false;
			setResetToken(null);
			invalidateStatus();
			onComplete();
		} catch (e) {
			setFormError(errorMessage(e, "Could not reset MPIN"));
			setResetOtp("");
		}
	}, [
		accessToken,
		clearErrors,
		invalidateStatus,
		onComplete,
		onSessionTokens,
		refreshToken,
		resetConfirmMutation,
		resetNew,
		resetNewConfirm,
		resetOtp,
		resetToken,
		verifyMutation,
	]);

	const cancelReset = useCallback(() => {
		inResetWizard.current = false;
		setResetToken(null);
		setResetOtp("");
		setResetNew("");
		setResetNewConfirm("");
		setFormError(null);
		setStep("enter_mpin");
		void statusQuery.refetch();
	}, [statusQuery]);

	const refetchStatus = useCallback(() => {
		void statusQuery.refetch();
	}, [statusQuery]);

	const isBusy =
		setMutation.isPending ||
		verifyMutation.isPending ||
		resetRequestMutation.isPending ||
		resetConfirmMutation.isPending;

	const resetRequestPending = resetRequestMutation.isPending;

	const statusError = statusQuery.isError
		? statusQuery.error instanceof Error
			? statusQuery.error.message
			: "Could not load MPIN status"
		: null;

	return {
		step,
		statusQuery,
		statusError,
		refetchStatus,
		formError,
		clearErrors,
		createMpin,
		setCreateMpin,
		createConfirm,
		setCreateConfirm,
		enterMpin,
		setEnterMpin,
		resetOtp,
		setResetOtp,
		resetNew,
		setResetNew,
		resetNewConfirm,
		setResetNewConfirm,
		submitCreate,
		submitEnter,
		startReset,
		submitResetNew,
		cancelReset,
		isBusy,
		resetRequestPending,
		messages: USER_MPIN_MESSAGES,
	};
}
