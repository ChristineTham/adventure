import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import gameDataRaw from '../data/game-data.json';
import { GameData, GameLocation } from '../types/game';

const gameData = gameDataRaw as unknown as GameData;

// Initialize the Google Gen AI SDK
// It will automatically use the GEMINI_API_KEY environment variable.
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

async function generateLocationImages() {
  const imagesDir = path.resolve(process.cwd(), 'data/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Define target locations for Phase 1/Phase 3.
  // For this test, let's just generate LOC_START and LOC_VALLEY if they are empty or missing.
  // We can pass a command line arg to do all or specific ones.
  const targetLocs = process.argv.slice(2);
  const locationsToProcess = targetLocs.length > 0 
    ? targetLocs 
    : ['LOC_START', 'LOC_VALLEY'];

  console.log(`Generating images for: ${locationsToProcess.join(', ')}`);

  for (const locId of locationsToProcess) {
    const loc = gameData.locations[locId];
    if (!loc) {
      console.warn(`Location ${locId} not found in game data.`);
      continue;
    }

    const description = loc.description.long?.replace(/\n/g, ' ') || '';
    
    // Extract exits
    const exits = loc.travel?.map(rule => {
      // Find the primary word for the verb
      const verbKey = rule.verbs.filter(v => v !== 'ENTER' && v !== 'OUT')[0] || rule.verbs[0];
      const motionWords = gameData.motions[verbKey]?.words || [verbKey];
      return motionWords[0];
    }).filter(Boolean) || [];
    
    const uniqueExits = [...new Set(exits)];
    let exitDescription = '';
    if (uniqueExits.length > 0) {
      exitDescription = `Paths or exits lead to the ${uniqueExits.join(', ').toLowerCase()}.`;
    }

    const prompt = `A Studio Ghibli style hand-painted postcard of ${description} ${exitDescription} Lush colours, whimsical atmosphere, highly detailed, soft natural lighting.`;
    
    console.log(`Prompt for ${locId}:\n${prompt}\n`);

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
      });

      const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
      
      if (base64Image) {
        const buffer = Buffer.from(base64Image, 'base64');
        const filePath = path.join(imagesDir, `${locId}.jpg`);
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Successfully generated and saved ${locId}.jpg`);
      } else {
        console.error(`❌ Failed to get image data for ${locId}`);
      }
    } catch (error) {
      console.error(`❌ Error generating image for ${locId}:`, error);
    }
  }
}

generateLocationImages().catch(console.error);
