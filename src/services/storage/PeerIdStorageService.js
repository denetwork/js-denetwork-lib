import fs from 'fs';
import { toString as uint8ArrayToString } from 'uint8arrays'

import { createFromJSON } from '@libp2p/peer-id-factory'
import { StorageService } from './StorageService.js';
import { TypeUtil } from 'denetwork-utils';

/**
 * 	class PeerIdStorageService
 */
export class PeerIdStorageService
{
	/**
	 * @typedef {import('@libp2p/interface/peer-id').PeerId} PeerId
	 * @typedef {import('@libp2p/interface/peer-id').RSAPeerId} RSAPeerId
	 * @typedef {import('@libp2p/interface/peer-id').Ed25519PeerId} Ed25519PeerId
	 * @typedef {import('@libp2p/interface/peer-id').Secp256k1PeerId} Secp256k1PeerId
	 */


	/**
	 *	@return {string}
	 */
	getDefaultFilename()
	{
		return `${ StorageService.getConfigDirectory() }/.peerId`;
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
     	 *	@param peerIdObject {PeerId}
	 *	@returns {{privKey: string;id: string;pubKey: string;} | null}
	 */
	storagePeerIdFromRaw( peerIdObject )
	{
		if ( ! this.isValidPeerId( peerIdObject ) )
		{
			return null;
		}
		if ( ! peerIdObject.privateKey || ! peerIdObject.publicKey )
		{
			return null;
		}

		try
		{
			//	convert to storage format
			return {
				id: uint8ArrayToString( peerIdObject.multihash.bytes, 'base58btc' ),
				privKey: uint8ArrayToString( peerIdObject.privateKey, 'base64pad' ),
				pubKey: uint8ArrayToString( peerIdObject.publicKey, 'base64pad' )
			};
		}
		catch ( err ) {}

		return null;
	}

	/**
	 * 	convert storagePeerId to PeerId
	 *	@param storagePeerIdObject	{{privKey: string, id: string, pubKey: string}}
	 *	@returns {Promise<PeerId>}
	 */
	async peerIdFromStorage( storagePeerIdObject )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.isValidStoragePeerId( storagePeerIdObject ) )
				{
					return reject( `invalid storagePeerIdObject` );
				}

				//	PeerId : { id: string, privKey?: string, pubKey?: string }
				const peerId = await createFromJSON( storagePeerIdObject );
				resolve( peerId );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param peerIdObject {any}
     	 */
	isValidStoragePeerId( peerIdObject )
	{
		return TypeUtil.isNotNullObjectWithKeys( peerIdObject, [ 'id', 'privKey', 'pubKey' ] );
	}

	/**
	 *	@param peerIdObject {any}
	 */
	isValidPeerId( peerIdObject )
	{
		return TypeUtil.isNotNullObjectWithKeys( peerIdObject, [ 'type', 'multihash', 'privateKey', 'publicKey' ] );
	}

	/**
	 *	@param	filename	{string|null}
	 *	@returns {Promise<{ id: string, privKey: string, pubKey: string }>}
	 */
	async loadStoragePeerId( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				filename = this.getSafeFilename( filename );
				if ( ! fs.existsSync( filename ) )
				{
					return reject( `file not found : ${ filename }` );
				}

				const dataObject = await StorageService.loadDataFromFile( filename );
				const jsonString = String( dataObject );
				if ( 'string' !== typeof jsonString ||
				     ! TypeUtil.isNotEmptyString( jsonString ) )
				{
					return reject( `empty content in file : ${ filename }` );
				}

				const storagePeerIdObject = JSON.parse( jsonString );
				if ( ! this.isValidStoragePeerId( storagePeerIdObject ) )
				{
					return reject( `invalid peerId in file : ${ filename }` );
				}

				resolve( storagePeerIdObject );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param filename	{string}
	 *	@returns {Promise<PeerId>}
	 */
	async loadPeerId( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const storagePeerIdObject = await this.loadStoragePeerId( filename );

				//	PeerId : { id: string, privKey?: string, pubKey?: string }
				const rawPeerIdObject = await this.peerIdFromStorage( storagePeerIdObject );
				if ( ! this.isValidPeerId( rawPeerIdObject ) )
				{
					return reject( `invalid peerId` );
				}

				//	...
				resolve( rawPeerIdObject );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param filename			{string|null}
	 *	@param	rawPeerIdObject		{PeerId}
	 *	@returns {Promise<boolean>}
	 */
	savePeerId( filename, rawPeerIdObject )
	{
		//
		//	rawPeerIdObject:
		//	{
		//		readonly type: 'RSA'
		//		readonly multihash: MultihashDigest
		//		readonly privateKey?: Uint8Array
		//		readonly publicKey?: Uint8Array
		//	}
		//
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.isValidPeerId( rawPeerIdObject ) )
				{
					return reject( `invalid rawPeerIdObject` );
				}

				filename = this.getSafeFilename( filename );
				const peerIdObject = this.storagePeerIdFromRaw( rawPeerIdObject );
				const peerIdJsonString = JSON.stringify( peerIdObject );
				await StorageService.saveDataToFile( filename, peerIdJsonString );

				//	...
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
