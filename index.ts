#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { Command } from 'commander';
import fs from 'fs';
import AsyncAPIHelper from './src/asyncapihelper'; 


const program = new Command();

program
  .version('0.1.0')
  .description('Decorate AsyncAPI specifications for SAP compliance')
  .requiredOption('-i <inputFile>', 'Input file containing AsyncAPI specification')
  .requiredOption('-o <outputFile>', 'Output file to save the decorated specification')
  .option('-f, --format <type>', 'Output format (json or yaml)', 'json');

program.parse(process.argv);

const options = program.opts();

fs.readFile(options.i, 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading input file:', err);
        process.exit(1);
    }
    try {
        const decoratedSpec = (await AsyncAPIHelper.decorateSAPCECompliantSpec(data)) as string;
        let outputData;
        if (options.format === 'yaml') {
            outputData = AsyncAPIHelper.JSONtoYAML(decoratedSpec);
        } else {
            try {
                outputData = AsyncAPIHelper.YAMLtoJSON(decoratedSpec);
            } catch (e) {
                outputData = decoratedSpec; // already JSON
            }
        }
        fs.writeFile(options.o, outputData, (err) => {
            if (err) {
                console.error('Error writing output file:', err);
                process.exit(1);
            }
            console.log('Output written to', options.o);
        });
    } catch (e) {
        console.error('Error during decoration:', e);
        process.exit(1);
    }
});
