import { generateKey } from "libp2p/pnet";
import { BufferUtil } from "denetwork-utils";

import { SwarmKeyStorageService } from "./storage/SwarmKeyStorageService.js";

export class SwarmKeyService
{
	/**
	 *	@returns {Uint8Array}
	 */
	static generateSwarmKey()
	{
		let buffer = new Uint8Array( 256 );
		generateKey( buffer );
		return BufferUtil.trimZeroOfUint8Array( buffer );
	}

	/**
	 *	@param filename {string}
	 */
	static async flushSwarmKey( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const swarmKey = SwarmKeyService.generateSwarmKey();
				const saved = await new SwarmKeyStorageService().saveSwarmKey( filename, swarmKey );
				if ( ! saved )
				{
					return reject( `failed to save swarmKey` );
				}

				resolve( swarmKey );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param filename	{string}
	 *	@returns {Promise<Uint8Array>}
	 */
	static async loadSwarmKey( filename )
	{
		return new SwarmKeyStorageService().loadSwarmKey( filename );
	}
}
