import chalk from 'chalk';

const usage = `
npm run <command> included in ${ chalk.bold( process.env.npm_package_name ) }:

Usage:

npm run ${ chalk.bold( 'help' ) }\t\t\t\t\t\t- this usage page
npm run ${ chalk.bold( 'peer-id-generator -- --output {filename}' ) }\t- generate a new swarmKey
npm run ${ chalk.bold( 'swarm-key-generator -- --output {filename}' ) }\t- generate a new swarmKey

`

console.log( '%s', usage );
