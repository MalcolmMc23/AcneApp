/**
 * OpenAI API Client Configuration
 * 
 * This file exports a configured OpenAI instance to be used throughout the app.
 */

import OpenAI from 'openai';
import Constants from 'expo-constants';

// Get API key from config or environment
const apiKey = Constants.expoConfig?.extra?.openAIApiKey ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  'placeholder-api-key'; // Replace with your actual API key when testing

// DEBUGGING: Check if we have a valid API key (without exposing the full key)
const isPlaceholder = apiKey === 'placeholder-api-key';
const isMasked = !isPlaceholder && apiKey.startsWith('sk-');
console.log("OpenAI API Key Status:", 
  isPlaceholder ? "Using placeholder (WILL NOT WORK)" : 
  isMasked ? "Valid format SK key found" : 
  "Key found but in unexpected format");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Required for Expo/React Native
});

export default openai; 