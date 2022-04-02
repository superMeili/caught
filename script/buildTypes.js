const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const pkg = require('../package.json')

module.exports = async function buildTypes () {
 // build types
 const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')

 const extractorConfigPath = path.resolve(__dirname, `api-extractor.json`)
 const extractorConfig =
   ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
 const extractorResult = Extractor.invoke(extractorConfig, {
   localBuild: true,
   showVerboseMessages: true
 })

 if (extractorResult.succeeded) {
   // concat additional d.ts to rolled-up dts
   const typesDir = path.resolve(__dirname, 'types')
   if (await fs.exists(typesDir)) {
     const dtsPath = path.resolve(__dirname, pkg.types)
     const existing = await fs.readFile(dtsPath, 'utf-8')
     const typeFiles = await fs.readdir(typesDir)
     const toAdd = await Promise.all(
       typeFiles.map(file => {
         return fs.readFile(path.resolve(typesDir, file), 'utf-8')
       })
     )
     await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'))
   }
   console.log(
     chalk.bold(chalk.green(`API Extractor completed successfully.`))
   )
 } else {
   console.error(
     `API Extractor completed with ${extractorResult.errorCount} errors` +
       ` and ${extractorResult.warningCount} warnings`
   )
   process.exitCode = 1
 }
 
 const allInDist = await fs.readdir(path.resolve(__dirname, '../dist'))
 allInDist.forEach(name => {
   if (!/^caught/.test(name)) {
    fs.remove(path.resolve(__dirname, `../dist/${name}`))
   }
 })
}