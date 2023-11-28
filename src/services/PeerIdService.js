import { createRSAPeerId } from '@libp2p/peer-id-factory'
import { PeerIdStorageService } from "./storage/PeerIdStorageService.js";


export class PeerIdService
{
	/**
	 * @typedef {import('@libp2p/interface/peer-id').PeerId} PeerId
	 * @typedef {import('@libp2p/interface/peer-id').RSAPeerId} RSAPeerId
	 * @typedef {import('@libp2p/interface/peer-id').Ed25519PeerId} Ed25519PeerId
	 * @typedef {import('@libp2p/interface/peer-id').Secp256k1PeerId} Secp256k1PeerId
	 */

	/**
	 * @typedef {Object} HopRelayOptions
	 * @property {PeerId} [peerId]
	 * @property {string[]} [listenAddresses = []]
	 * @property {string[]} [announceAddresses = []]
	 * @property {boolean} [pubsubDiscoveryEnabled = true]
	 * @property {string[]} [pubsubDiscoveryTopics = ['_peer-discovery._p2p._pubsub']] uses discovery default
	 */


	/**
	 * 	@returns {Promise<PeerId>}
	 */
	static async generatePeerId()
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const rSAPeerId = await createRSAPeerId();
				resolve( rSAPeerId );
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}
	/**
	 *	@param {string} filename
	 *	@returns {Promise<PeerId>}
	 */
	static async flushPeerId( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//
				//	export type PeerId = RSAPeerId | Ed25519PeerId | Secp256k1PeerId
				//
				const rsaPeerIdObject = await this.generatePeerId();
				await new PeerIdStorageService().savePeerId( filename, rsaPeerIdObject );
				resolve( rsaPeerIdObject );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	load peer id from local file
	 *	@param	filename	{string} - filename where we store peerId
	 * 	@returns {Promise< PeerId | null >}
	 */
	static async loadPeerId( filename )
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				try
				{
					const peerId = await new PeerIdStorageService().loadPeerId( filename );
					return resolve( peerId );
				}
				catch ( err )
				{
				}

				//	...
				resolve( null );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
