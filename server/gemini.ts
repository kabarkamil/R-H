/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Server-side Gemini Client initialization
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const isApiKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 5);

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const MODEL_NAME = 'gemini-3.8-flash';

/**
 * Executes a Gemini model call with exponential backoff for transient 503/429 spikes
 */
export async function generateContentWithRetry(params: any, maxRetries = 2): Promise<any> {
  const mergedParams = {
    ...params,
    config: {
      ...params.config,
      thinkingConfig: params.config?.thinkingConfig || { thinkingLevel: ThinkingLevel.LOW },
    },
  };

  let attempt = 0;
  while (true) {
    try {
      const timeoutMs = 45000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API isteği zaman aşımına uğradı (45s).')), timeoutMs)
      );
      return await Promise.race([ai.models.generateContent(mergedParams), timeoutPromise]);
    } catch (err: any) {
      attempt++;
      const isTransient = 
        err.message?.includes('503') ||
        err.message?.includes('UNAVAILABLE') ||
        err.message?.includes('high demand') ||
        err.message?.includes('429') ||
        err.message?.includes('RESOURCE_EXHAUSTED');

      if (isTransient && attempt <= maxRetries) {
        const delay = attempt * 1500;
        console.warn(`[Gemini API] Geçici hata (${err.message}). ${delay}ms sonra ${attempt}. deneme yapılıyor...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}
