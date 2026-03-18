"use client";

import hljs from "highlight.js";
import { useCallback, useEffect, useRef } from "react";
import {
  CONFIDENCE_THRESHOLDS,
  resolveLanguage,
  type SupportedLanguage,
} from "./languages";

interface DetectionResult {
  language: SupportedLanguage | null;
  confidence: number;
  isSupported: boolean;
}

/**
 * Client-side hook for automatic language detection using highlight.js.
 * Handles both paste (immediate detection) and typing (debounced detection).
 */
export function useCodeLanguageDetection() {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  /**
   * Detects the language from code using highlight.js highlightAuto.
   * Applies confidence thresholds and returns a supported language or null.
   */
  const detect = useCallback((code: string): DetectionResult => {
    if (!code || code.trim().length === 0) {
      return { language: null, confidence: 0, isSupported: false };
    }

    try {
      // Supported languages for detection
      const supportedLangs = [
        "javascript",
        "typescript",
        "python",
        "go",
        "rust",
        "java",
        "ruby",
        "php",
        "sql",
        "shell",
        "css",
        "html",
        "json",
      ];

      // Use highlight.js auto-detection
      const result = hljs.highlightAuto(code, supportedLangs);

      // Extract confidence from highlight.js result
      // relevance is a score from 0 to a positive number (higher = more confident)
      // Normalize to 0-1 range: divide by 100 to get a rough percentage
      const confidence = Math.min(result.relevance / 100, 1);

      // If confidence is below threshold, don't trust the detection
      if (confidence < CONFIDENCE_THRESHOLDS.LOW) {
        return {
          language: null,
          confidence,
          isSupported: false,
        };
      }

      // Resolve the detected language to our supported set
      const detectedLang = result.language ?? "plaintext";
      const resolvedLanguage = resolveLanguage(detectedLang);

      return {
        language: resolvedLanguage,
        confidence,
        isSupported: resolvedLanguage !== null,
      };
    } catch (error) {
      console.error("Language detection failed:", error);
      return { language: null, confidence: 0, isSupported: false };
    }
  }, []);

  /**
   * Debounced detection for typing events.
   * Delays detection by 500ms to avoid excessive re-renders.
   */
  const detectDebounced = useCallback(
    (
      code: string,
      onDetected: (result: DetectionResult) => void,
      delay: number = 500,
    ) => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        const result = detect(code);
        onDetected(result);
      }, delay);
    },
    [detect],
  );

  /**
   * Immediate detection for paste events.
   */
  const detectImmediate = useCallback(
    (code: string): DetectionResult => {
      return detect(code);
    },
    [detect],
  );

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    detect,
    detectImmediate,
    detectDebounced,
  };
}
