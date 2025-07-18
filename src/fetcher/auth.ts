import { Agent, CredentialSession } from "@atproto/api";
import { logger } from "./logger";
import { getSavedSession, type savedSessionData, saveSession, setCurrentDid } from "./session";

export async function signIn(serviceUrl: URL, identifier: string, password: string) {
	const session = new CredentialSession(serviceUrl);
	await session.login({ identifier, password });
	const data = session.session!;
	const avatar = await getAvatar(data.did);
	saveSession({ avatar, main: data, serviceUrl: serviceUrl.toString() });
	setCurrentDid(data.did);
}

async function getAvatar(actor: string) {
	return (await new Agent("https://public.api.bsky.app").app.bsky.actor.getProfile({ actor })).data.avatar;
}

export async function resumeSession(data: savedSessionData) {
	const session = new CredentialSession(new URL(data.serviceUrl));
	try {
		await session.resumeSession(data.main);
		return session;
	} catch (e) {
		logger.error(`Failed to resume session:${String(e)}`);
		return null;
	}
}

export const CHANGE_USER_KEY = "change_user_handle";
export function changeUser(targetDid: string, targetHandle?: string) {
	const targetSession = getSavedSession(targetDid);
	if (targetSession == null || targetSession.isexpired) {
		sessionStorage.setItem(CHANGE_USER_KEY, targetHandle ?? targetDid);
		location.href = "/login";
	} else {
		setCurrentDid(targetDid);
		location.href = "/";
	}
}
