const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const buildTypes = require('./buildTypes')

async function run() {
  await fs.remove(path.resolve(__dirname, '../dist'))

  await execa(
    'rollup',
    [
      '-c'
    ],
    { stdio: 'inherit' }
  )

  buildTypes()
}

run()