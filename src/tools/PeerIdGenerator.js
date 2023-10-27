import { LogUtil } from 'denetwork-utils';
import { TypeUtil } from 'denetwork-utils';
import minimist from "minimist";
import { PeerIdService } from "../services/PeerIdService.js";
import { PeerIdStorageService } from "../services/storage/PeerIdStorageService.js";
const argv = minimist( process.argv.slice( 2 ) );

/**
 * 	command line:
 * 	node src/tools/PeerIdGenerator.js --output <full output filename>
 * 	npm run peer-id-generator -- --output <full output filename>
 *
 *	@returns {Promise<boolean>}
 */
async function peerIdFuncGenerator()
{
	const filename = argv.output;
	if ( ! TypeUtil.isNotEmptyString( filename ) )
	{
		LogUtil.say( `please give me a filename to save peerId by --output <full output filename>` );
		return false;
	}

	//	Create a Uint8Array and write the swarm key to it
	const peerId = await PeerIdService.flushPeerId( filename );

	//
	//	read the result
	//
	setTimeout( async () =>
	{
		const storagePeerId = new PeerIdStorageService().storagePeerIdFromRaw( peerId );
		console.log( `swarmKey in file ${ filename }:` )
		console.log( `------------------------------------------------------------` )
		console.log( JSON.stringify( storagePeerId ) );
		console.log( `------------------------------------------------------------` )

	}, 100 );

	return true;
}


peerIdFuncGenerator().then();
