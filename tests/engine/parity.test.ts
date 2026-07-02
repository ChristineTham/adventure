import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initializeGame, processCommand, saveFiles, handleEOF } from '../../engine/core';
import { useGameStore } from '../../store/gameStore';

describe('Regression Parity Tests', () => {
  const testsDir = path.resolve(__dirname, '../../open-adventure-source/tests');
  const logFiles = fs.readdirSync(testsDir)
    .filter(f => f.endsWith('.log'))
    .sort();

  for (const logFile of logFiles) {
    const stem = logFile.replace('.log', '');
    const chkFile = `${stem}.chk`;
    const chkPath = path.join(testsDir, chkFile);
    
    if (!fs.existsSync(chkPath)) {
      continue;
    }

    it(`should match parity for ${stem}`, () => {
      saveFiles.clear();
      useGameStore.getState().reset();
      initializeGame();

      const logPath = path.join(testsDir, logFile);
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const lines = logContent.split('\n');
      // A trailing newline produces a final empty split element that
      // corresponds to EOF, not an actual blank input line; drop it.
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }

      let terminated = false;
      for (let line of lines) {
        // The reference reader ignores comment lines beginning with '#'
        // entirely (no prompt, no echo). Every other line - including a
        // blank one - is read and echoed as a '> ' prompt.
        if (line.startsWith('#')) {
          continue;
        }

        try {
          processCommand(line);
        } catch (error) {
          if (error instanceof Error && error.message === 'GAME_TERMINATED') {
            terminated = true;
            break;
          }
          throw error;
        }
      }

      if (!terminated) {
        try {
          handleEOF();
        } catch (error) {
          if (!(error instanceof Error && error.message === 'GAME_TERMINATED')) {
            throw error;
          }
        }
      }

      const chkContent = fs.readFileSync(chkPath, 'utf-8');
      const actualHistory = useGameStore.getState().history;
      
      const normalizedActual = normalizeOutput(actualHistory.join('\n'));
      const normalizedExpected = normalizeOutput(chkContent);

      if (normalizedActual !== normalizedExpected) {
        console.log(`[MISMATCH] ${stem} failed:`);
        let diffIdx = 0;
        while (diffIdx < normalizedActual.length && diffIdx < normalizedExpected.length && normalizedActual[diffIdx] === normalizedExpected[diffIdx]) {
          diffIdx++;
        }
        console.log(`  First diff at index ${diffIdx}:`);
        console.log(`  Actual context:   "${normalizedActual.substring(Math.max(0, diffIdx - 30), diffIdx + 50)}"`);
        console.log(`  Expected context: "${normalizedExpected.substring(Math.max(0, diffIdx - 30), diffIdx + 50)}"`);
      }

      if (normalizedActual !== normalizedExpected) {
        expect.fail(`Mismatched output for ${stem}`);
      }
    });
  }
});

function normalizeOutput(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}
