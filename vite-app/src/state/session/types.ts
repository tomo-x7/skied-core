import type { PersistedAccount } from "#/state/persisted";

export type SessionAccount = PersistedAccount;

export type SessionStateContext = {
	accounts: SessionAccount[];
	currentAccount: SessionAccount | undefined;
	hasSession: boolean;
};

export type SessionApiContext = {
	createAccount: (props: {
		service: string;
		email: string;
		password: string;
		handle: string;
		birthDate: Date;
		inviteCode?: string;
		verificationPhone?: string;
		verificationCode?: string;
	}) => Promise<void>;
	login: (props: {
		service: string;
		identifier: string;
		password: string;
		authFactorToken?: string | undefined;
	}) => Promise<void>;
	logoutCurrentAccount: () => void;
	logoutEveryAccount: () => void;
	resumeSession: (account: SessionAccount) => Promise<void>;
	removeAccount: (account: SessionAccount) => void;
};
