import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Import models
import MarketPrice from './models/MarketPrice.js';
import Recommendation from './models/Recommendation.js';
import SoilReport from './models/SoilReport.js';
import User from './models/User.js';

const models = [
    { name: 'MarketPrice', model: MarketPrice },
    { name: 'Recommendation', model: Recommendation },
    { name: 'SoilReport', model: SoilReport },
    { name: 'User', model: User }
];

console.log("\n===================================================================");
console.log("             DATABASE TABLES (ENTITIES) FOR THIS PROJECT             ");
console.log("===================================================================\n");

models.forEach(({ name, model }) => {
    console.log(`\n\x1b[36m--- TABLE / ENTITY: ${name} ---\x1b[0m`);
    const paths = model.schema.paths;
    const tableData = [];
    
    for (const [key, value] of Object.entries(paths)) {
        if (key === '__v') continue; // Skip mongoose version key
        
        let typeName = value.instance;
        if (value.options && value.options.enum) {
            typeName += ` (Enum: ${value.options.enum.join(', ')})`;
        }
        if (value.options && value.options.ref) {
            typeName += ` (Ref: ${value.options.ref})`;
        }
        
        // Handle array of objects or strings better
        if (typeName === 'Array') {
            if (value.$isMongooseDocumentArray) {
               typeName = 'Array of Objects';
            } else if (value.caster) {
               typeName = `Array of ${value.caster.instance}`;
            }
        }

        tableData.push({
            Field: key,
            Type: typeName,
            Required: value.isRequired ? 'Yes' : 'No',
            Default: value.options && value.options.default !== undefined ? String(value.options.default) : '-'
        });
    }
    
    console.table(tableData);
});

console.log("\n===================================================================");
console.log("                         END OF TABLES                               ");
console.log("===================================================================\n");
process.exit(0);
