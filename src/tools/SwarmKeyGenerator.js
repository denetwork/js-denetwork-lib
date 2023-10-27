import { LogUtil } from 'denetwork-utils';
import { TypeUtil } from 'denetwork-utils';
import { SwarmKeyStorageService } from '../services/storage/SwarmKeyStorageService.js';
import minimist from "minimist";
import { SwarmKeyService } from "../services/SwarmKeyService.js";
const argv = minimist( process.argv.slice( 2 ) );

/**
 * 	command line:
 * 	node src/tools/SwarmKeyGenerator.js --output <full output filename>
 * 	npm run swarm-key-generator -- --output <full output filename>
 *
 *	@returns {Promise<boolean>}
 */
async function swarmKeyFuncGenerator()
{
	const filename = argv.output;
	if ( ! TypeUtil.isNotEmptyString( filename ) )
	{
		LogUtil.say( `please give me a filename to save swarmKey by --output <full output filename>` );
		return false;
	}

	//	Create a Uint8Array and write the swarm key to it
	const swarmKey = await SwarmKeyService.flushSwarmKey( filename );

	//
	//	read the result
	//
	setTimeout( async () =>
	{
		const swarmKeyString = new SwarmKeyStorageService().swarmKeyToString( swarmKey );
		console.log( `swarmKey in file ${ filename }:` )
		console.log( `------------------------------------------------------------` )
		console.log( swarmKeyString );
		console.log( `------------------------------------------------------------` )

	}, 100 );

	return true;
}


swarmKeyFuncGenerator().then();
