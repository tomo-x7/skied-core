import { CredentialSession } from "@atproto/api";
import { type PropsWithChildren, createContext, useContext } from "react";

interface context {
	session: CredentialSession;
}
const context = createContext<context>({ session: new CredentialSession(new URL("https://example.com")) });

export function SessionProvider({ children, session }: PropsWithChildren<{ session: CredentialSession }>) {
	return <context.Provider value={{ session }}>{children}</context.Provider>;
}

export function useSession() {
	return useContext(context).session;
}
