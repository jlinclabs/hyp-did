#!/usr/bin/env node

const NAME = 'jlinx'
process.title = NAME

import { program } from 'commander'

program.name(NAME)
program.version('0.0.1')

program.command('servers', 'manage servers')
program.command('keys', 'manage keys')
program.command('dids', 'manage dids')
program.action(() => {
  program.help()
})
program.parse(process.argv)
