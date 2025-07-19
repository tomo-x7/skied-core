/**
 * GENERATED CODE - DO NOT MODIFY
 */

type $Type<Id extends string, Hash extends string> = Hash extends "main" ? Id : `${Id}#${Hash}`;

function isObject<V>(v: V): v is V & object {
	return v != null && typeof v === "object";
}

function is$type<Id extends string, Hash extends string>($type: unknown, id: Id, hash: Hash): $type is $Type<Id, Hash> {
	return hash === "main"
		? $type === id
		: // $type === `${id}#${hash}`
			typeof $type === "string" &&
				$type.length === id.length + 1 + hash.length &&
				$type.charCodeAt(id.length) === 35 /* '#' */ &&
				$type.startsWith(id) &&
				$type.endsWith(hash);
}

type $TypedObject<V, Id extends string, Hash extends string> = V extends {
	$type: $Type<Id, Hash>;
}
	? V
	: V extends { $type?: string }
		? V extends { $type?: infer T extends $Type<Id, Hash> }
			? V & { $type: T }
			: never
		: V & { $type: $Type<Id, Hash> };

export function is$typed<V, Id extends string, Hash extends string>(
	v: V,
	id: Id,
	hash: Hash,
): v is $TypedObject<V, Id, Hash> {
	return isObject(v) && "$type" in v && is$type(v.$type, id, hash);
}

export function maybe$typed<V, Id extends string, Hash extends string>(
	v: V,
	id: Id,
	hash: Hash,
): v is V & object & { $type?: $Type<Id, Hash> } {
	return isObject(v) && ("$type" in v ? v.$type === undefined || is$type(v.$type, id, hash) : true);
}
