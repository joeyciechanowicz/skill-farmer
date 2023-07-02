import crypto from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';

// Get these from
// https://login.eveonline.com/.well-known/oauth-authorization-server
// which has an entry jwks_uri that points to
// https://login.eveonline.com/oauth/jwks
// then the key is the RS256 'n' prop
const jwtData = {
	keys: [
		{
			alg: 'RS256',
			e: 'AQAB',
			kid: 'JWT-Signature-Key',
			kty: 'RSA',
			n: 'nehPQ7FQ1YK-leKyIg-aACZaT-DbTL5V1XpXghtLX_bEC-fwxhdE_4yQKDF6cA-V4c-5kh8wMZbfYw5xxgM9DynhMkVrmQFyYB3QMZwydr922UWs3kLz-nO6vi0ldCn-ffM9odUPRHv9UbhM5bB4SZtCrpr9hWQgJ3FjzWO2KosGQ8acLxLtDQfU_lq0OGzoj_oWwUKaN_OVfu80zGTH7mxVeGMJqWXABKd52ByvYZn3wL_hG60DfDWGV_xfLlHMt_WoKZmrXT4V3BCBmbitJ6lda3oNdNeHUh486iqaL43bMR2K4TzrspGMRUYXcudUQ9TycBQBrUlT85NRY9TeOw',
			use: 'sig'
		},
		{
			alg: 'ES256',
			crv: 'P-256',
			kid: '8878a23f-2489-4045-989e-4d2f3ec1ae1a',
			kty: 'EC',
			use: 'sig',
			x: 'PatzB2HJzZOzmqQyYpQYqn3SAXoVYWrZKmMgJnfK94I',
			y: 'qDb1kUd13fRTN2UNmcgSoQoyqeF_C1MsFlY_a87csnY'
		}
	],
	SkipUnresolvedJsonWebKeys: true
} as const;

const publicKey = crypto.createPublicKey({
	key: jwtData.keys[0],
	format: 'jwk'
});

export interface ParsedJwtPayload extends JwtPayload {
	name: string;
	charId: number;
}
export function verifyJwt(accessToken: string): ParsedJwtPayload {
	const token = jwt.verify(accessToken, publicKey, { algorithms: ['RS256'] });

	if (typeof token === 'string') {
		throw new Error(`Unexpected token of type "string" from ESI: ${token}`);
	}

	if (!token.name) {
		throw new Error('No .name property returned from ESI login');
	}

	const charId = parseInt(token.sub?.replace('CHARACTER:EVE:', '') ?? '');

	if (!charId || isNaN(charId)) {
		throw new Error('No sub property provided in JWT, or it does not contain an integer');
	}

	return {
		...token,
		name: token.name,
		charId
	};
}
