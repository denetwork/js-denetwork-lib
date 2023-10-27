import fs from 'fs';
import { toString as uint8ArrayToString } from "uint8arrays";
import { TypeUtil } from "denetwork-utils";

import { StorageService } from './StorageService.js';


/**
 * 	class SwarmKeyStorageService
 */
export class SwarmKeyStorageService
{
	/**
	 *	@returns {string}
	 */
	getDefaultFilename()
	{
		return `${ StorageService.getConfigDirectory() }/.swarmKey`;
	}

	/**
	 *	@param filename {string|null}
	 *	@returns {string}
	 */
	getSafeFilename( filename )
	{
		if ( ! filename || ! TypeUtil.isNotEmptyString( filename ) )
		{
			return this.getDefaultFilename();
		}

		return filename;
	}

	/**
	 *	@param obj	{any}
	 *	@returns {boolean}
	 */
	isValidSwarmKeyObject( obj )
	{
		return TypeUtil.isNotNullObjectWithKeys( obj, [ 'protocol', 'encode', 'key' ] );
	}

	/**
	 *	@param swarmKey	{Uint8Array}
	 *	@returns {{encode: string, protocol: string, key: string}|null}
	 */
	swarmKeyToObject( swarmKey )
	{
		/**
		 *	@type {string | null}
		 */
		let swarmKeyString = '';

		if ( swarmKey instanceof Uint8Array )
		{
			swarmKeyString = this.swarmKeyToString( swarmKey );
		}
		else if ( TypeUtil.isNotEmptyString( swarmKey ) )
		{
			swarmKeyString = swarmKey;
		}

		if ( ! swarmKeyString ||
		     ! TypeUtil.isNotEmptyString( swarmKeyString ) )
		{
			return null;
		}

		//	...
		const lines = swarmKeyString.split( /\r?\n/ );
		if ( ! Array.isArray( lines ) || lines.length < 3 )
		{
			return null;
		}

		const [ protocol, encode, key ] = lines;
		if ( ! TypeUtil.isNotEmptyString( protocol ) ||
		     ! TypeUtil.isNotEmptyString( encode ) ||
		     ! TypeUtil.isNotEmptyString( key ) )
		{
			return null;
		}

		return {
			protocol,
			encode,
			key
		}
	}

	/**
	 *	@param swarmKey	{Uint8Array}
	 *	@returns { string | null }
	 */
	swarmKeyToString( swarmKey )
	{
		try
		{
			if ( ! ( swarmKey instanceof Uint8Array ) )
			{
				return String( swarmKey );
			}

			return uint8ArrayToString( swarmKey );
		}
		catch ( err )
		{
			console.error( err );
		}

		return null;
	}

	/**
	 *	@param filename {string|null}
	 *	@returns {Promise<Uint8Array>}
	 */
	async loadSwarmKey( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				filename = this.getSafeFilename( filename );
				if ( ! fs.existsSync( filename ) )
				{
					return reject( `swarmKey file not found : ${ filename }` );
				}

				//	...
				const data = await StorageService.loadDataFromFile( filename );
				if ( ! ( data instanceof Uint8Array ) ||
				     0 === data.byteLength ||
				     0 === data.length )
				{
					return reject( `invalid swarmKey file` );
				}

				resolve( data );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param filename	{string|null}
	 *	@param swarmKey	{Uint8Array}
	 *	@returns {Promise<boolean>}
	 */
	async saveSwarmKey( filename, swarmKey )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! ( swarmKey instanceof Uint8Array ) )
				{
					return reject( `invalid swarmKey` );
				}

				filename = this.getSafeFilename( filename );
				const saved = await StorageService.saveDataToFile( filename, swarmKey );
				setTimeout( () =>
				{
					resolve( saved );

				}, 300 );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
}
