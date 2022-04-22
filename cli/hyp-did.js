#!/usr/bin/env node

process.title = "hyp-did"

import subcommand from 'subcommand'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

import { commands } from './index.js'

const packageJson = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'))

// match & run the command
subcommand({
  commands: [

  ],
  none(args){
    if (args.version){
      console.log(packageJson.version)
      process.exit(0)
    }
    if (args._[0]){
      console.error(`Invalid command: ${args._[0]}`)
    }else{
      usage()
    }
  }
})(process.argv.slice(2))


export default function usage (commands, err, cmd) {
  if (err) {
    console.error(chalk.red(`${err}\n`))
  } else {
    console.error('')
  }

  if (cmd) {
    console.error(simple(cmd))
    if (cmd.usage.full) console.error(cmd.usage.full)
    else console.error('')
    process.exit(err ? 1 : 0)
  }

  console.error(`Usage: ${chalk.bold(process.title)} <command> ${chalk.gray(`[opts...]`)}

  ${chalk.green(`Learn more at ${packageJson.homepage}`)}
`)
  process.exit(err ? 1 : 0)
}

function simple (cmd) {
  return `${chalk.bold(`${process.title} ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}
