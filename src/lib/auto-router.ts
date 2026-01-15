/**
 * Auto Router
 *
 * Automatically routes requests to the appropriate platform based on model.
 * Supports user-defined manual mappings and multi-platform rotation.
 */

import consola from "consola";

import {
  type Platform,
  normalizeModelName,
  isModelSupportedByPlatform,
  getRecommendedPlatform,
  mapModelForPlatform,
} from "./model-mapper";
import { state } from "./state";

/**
 * Multi-platform rotation configuration
 */
export interface RotationConfig {
  enabled: boolean;
  platforms: Array<Platform>;
  currentIndex: number;
  failedPlatforms: Set<Platform>;
}

// Rotation state
const rotationConfig: RotationConfig = {
  enabled: false,
  platforms: [],
  currentIndex: 0,
  failedPlatforms: new Set(),
};

/**
 * Enable multi-platform rotation
 */
export function enableRotation(platforms: Array<Platform>): void {
  rotationConfig.enabled = true;
  rotationConfig.platforms = platforms.filter((p) => isPlatformAvailable(p));
  rotationConfig.currentIndex = 0;
  rotationConfig.failedPlatforms.clear();
  consola.info(
    `Rotation enabled with platforms: ${rotationConfig.platforms.join(", ")}`,
  );
}

/**
 * Disable multi-platform rotation
 */
export function disableRotation(): void {
  rotationConfig.enabled = false;
  rotationConfig.platforms = [];
  rotationConfig.currentIndex = 0;
  rotationConfig.failedPlatforms.clear();
  consola.info("Rotation disabled");
}

/**
 * Check if rotation is enabled
 */
export function isRotationEnabled(): boolean {
  return rotationConfig.enabled && rotationConfig.platforms.length > 0;
}

/**
 * Get rotation config
 */
export function getRotationConfig(): Omit<RotationConfig, "failedPlatforms"> & {
  failedPlatforms: Array<Platform>;
} {
  return {
    ...rotationConfig,
    failedPlatforms: Array.from(rotationConfig.failedPlatforms),
  };
}

/**
 * Mark a platform as failed (for failover)
 */
export function markPlatformFailed(platform: Platform): void {
  rotationConfig.failedPlatforms.add(platform);
  consola.warn(`Platform ${platform} marked as failed`);
}

/**
 * Reset failed platforms
 */
export function resetFailedPlatforms(): void {
  rotationConfig.failedPlatforms.clear();
}

/**
 * Get current platform in rotation (stays on same platform until marked failed)
 * Only switches to next platform when current one is marked as failed
 */
export function getNextRotationPlatform(model: string): Platform | null {
  if (!rotationConfig.enabled || rotationConfig.platforms.length === 0) {
    return null;
  }

  const normalized = normalizeModelName(model);

  // Find first available platform starting from current index
  // Does NOT increment index on each call - stays on same platform until failed
  for (let i = 0; i < rotationConfig.platforms.length; i++) {
    const index =
      (rotationConfig.currentIndex + i) % rotationConfig.platforms.length;
    const platform = rotationConfig.platforms[index];

    if (
      !rotationConfig.failedPlatforms.has(platform) &&
      isModelSupportedByPlatform(normalized, platform)
    ) {
      // Update currentIndex to this platform (but don't advance past it)
      // This ensures we stay on this platform until it's marked failed
      if (i > 0) {
        rotationConfig.currentIndex = index;
        consola.info(`Switched to platform: ${platform}`);
      }
      return platform;
    }
  }

  // All platforms failed, reset and try again
  consola.warn("All platforms failed, resetting failed platforms");
  resetFailedPlatforms();

  // Return first platform that supports the model
  for (const platform of rotationConfig.platforms) {
    if (isModelSupportedByPlatform(normalized, platform)) {
      rotationConfig.currentIndex = rotationConfig.platforms.indexOf(platform);
      return platform;
    }
  }

  return null;
}

/**
 * User-defined model to platform mapping
 * Format: { "model-name": "platform" }
 */
export type ModelPlatformMapping = Record<string, Platform>;

// In-memory storage for manual mappings
let manualMappings: ModelPlatformMapping = {};

/**
 * Set manual model-to-platform mappings
 */
export function setManualMappings(mappings: ModelPlatformMapping): void {
  manualMappings = { ...mappings };
  consola.info(`Loaded ${Object.keys(mappings).length} manual model mappings`);
}

/**
 * Add a single manual mapping
 */
export function addManualMapping(model: string, platform: Platform): void {
  manualMappings[model] = platform;
  consola.debug(`Added manual mapping: ${model} -> ${platform}`);
}

/**
 * Remove a manual mapping
 */
export function removeManualMapping(model: string): void {
  delete manualMappings[model];
}

/**
 * Get all manual mappings
 */
export function getManualMappings(): ModelPlatformMapping {
  return { ...manualMappings };
}

/**
 * Check if a model has a manual mapping
 */
export function hasManualMapping(model: string): boolean {
  const normalized = normalizeModelName(model);
  return normalized in manualMappings || model in manualMappings;
}

/**
 * Get manual mapping for a model
 */
export function getManualMapping(model: string): Platform | null {
  const normalized = normalizeModelName(model);
  return manualMappings[normalized] ?? manualMappings[model] ?? null;
}

/**
 * Get currently enabled platforms based on state
 */
export function getEnabledPlatforms(): Array<Platform> {
  const platforms: Array<Platform> = [];

  // Check which platforms are configured
  if (state.copilotToken) platforms.push("copilot");
  if (state.zenApiKey) platforms.push("zen");
  if (state.antigravityModels?.data?.length) platforms.push("antigravity");
  if (state.kiroModels?.data?.length) platforms.push("kiro");
  if (state.droidsApiKey) platforms.push("droids");

  return platforms;
}

/**
 * Get the active platform from state
 */
export function getActivePlatform(): Platform {
  if (state.zenMode) return "zen";
  if (state.antigravityMode) return "antigravity";
  if (state.kiroMode) return "kiro";
  if (state.droidsMode) return "droids";
  return "copilot";
}

/**
 * Check if a platform is available (has credentials)
 */
export function isPlatformAvailable(platform: Platform): boolean {
  switch (platform) {
    case "copilot": {
      return Boolean(state.copilotToken);
    }
    case "zen": {
      return Boolean(state.zenApiKey);
    }
    case "antigravity": {
      return Boolean(state.antigravityModels?.data?.length);
    }
    case "kiro": {
      return Boolean(state.kiroModels?.data?.length);
    }
    case "droids": {
      return Boolean(state.droidsApiKey);
    }
    default: {
      return false;
    }
  }
}

/**
 * Select the best platform for a given model
 * Priority: manual mapping > rotation > active platform > recommended platform
 */
export function selectPlatformForModel(model: string): Platform {
  const normalized = normalizeModelName(model);

  // 1. Check manual mapping first
  const manualPlatform = getManualMapping(normalized);
  if (manualPlatform && isPlatformAvailable(manualPlatform)) {
    consola.debug(`Using manual mapping: ${model} -> ${manualPlatform}`);
    return manualPlatform;
  }

  // 2. If rotation is enabled, use rotation
  if (isRotationEnabled()) {
    const rotationPlatform = getNextRotationPlatform(normalized);
    if (rotationPlatform) {
      consola.debug(`Using rotation: ${model} -> ${rotationPlatform}`);
      return rotationPlatform;
    }
  }

  // 3. If active platform supports the model, use it
  const activePlatform = getActivePlatform();
  if (isModelSupportedByPlatform(normalized, activePlatform)) {
    return activePlatform;
  }

  // 4. Get recommended platform for this model
  const recommended = getRecommendedPlatform(normalized);
  if (recommended && isPlatformAvailable(recommended)) {
    consola.info(`Auto-routing ${model} to ${recommended}`);
    return recommended;
  }

  // 5. Fallback to active platform
  return activePlatform;
}

/**
 * Route info for a request
 */
export interface RouteInfo {
  platform: Platform;
  model: string;
  mappedModel: string;
  originalModel: string;
}

/**
 * Determine routing for a request
 */
export function routeRequest(model: string): RouteInfo {
  const normalized = normalizeModelName(model);
  const platform = selectPlatformForModel(normalized);
  const mappedModel = mapModelForPlatform(normalized, platform);

  return {
    platform,
    model: normalized,
    mappedModel,
    originalModel: model,
  };
}

export { type Platform } from "./model-mapper";
