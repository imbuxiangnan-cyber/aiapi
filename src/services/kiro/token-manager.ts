import consola from "consola"

import {
  type KiroAuthConfig,
  type KiroTokenInfo,
  AUTH_METHOD_SOCIAL,
  AUTH_METHOD_IDC,
  REFRESH_TOKEN_URL,
  IDC_REFRESH_TOKEN_URL,
  loadKiroAuth,
} from "./auth"

interface CachedToken {
  config: KiroAuthConfig
  token: KiroTokenInfo | null
  lastUsed: Date
  usageCount: number
  errorCount: number
}

class KiroTokenManager {
  private tokens: Array<CachedToken> = []
  private currentIndex = 0

  async initialize(): Promise<void> {
    const configs = await loadKiroAuth()
    if (!configs || configs.length === 0) {
      throw new Error("No Kiro auth configs found")
    }

    this.tokens = configs.map((config) => ({
      config,
      token: null,
      lastUsed: new Date(0),
      usageCount: 0,
      errorCount: 0,
    }))

    consola.info(
      `KiroTokenManager initialized with ${this.tokens.length} configs`,
    )
  }

  async getToken(): Promise<string> {
    if (this.tokens.length === 0) {
      throw new Error("No Kiro tokens available")
    }

    // Try to get a valid token
    for (let i = 0; i < this.tokens.length; i++) {
      const idx = (this.currentIndex + i) % this.tokens.length
      const cached = this.tokens[idx]

      if (cached.errorCount >= 3) continue

      try {
        const token = await this.ensureValidToken(cached)
        cached.lastUsed = new Date()
        cached.usageCount++
        this.currentIndex = idx
        return token.accessToken
      } catch {
        cached.errorCount++
        consola.warn(`Token ${idx} failed, trying next`)
      }
    }

    // Reset errors and try again
    for (const t of this.tokens) {
      t.errorCount = 0
    }
    throw new Error("All Kiro tokens exhausted")
  }

  private async ensureValidToken(cached: CachedToken): Promise<KiroTokenInfo> {
    if (cached.token && cached.token.expiresAt > new Date()) {
      return cached.token
    }

    // Refresh token
    const newToken = await this.refreshToken(cached.config)
    cached.token = newToken
    return newToken
  }

  private async refreshToken(config: KiroAuthConfig): Promise<KiroTokenInfo> {
    if (config.auth === AUTH_METHOD_SOCIAL) {
      return this.refreshSocialToken(config.refreshToken)
    } else if (config.auth === AUTH_METHOD_IDC) {
      return this.refreshIdCToken(config)
    }
    throw new Error(`Unsupported auth type: ${config.auth}`)
  }

  private async refreshSocialToken(
    refreshToken: string,
  ): Promise<KiroTokenInfo> {
    const response = await fetch(REFRESH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Social token refresh failed: ${response.status} ${text}`)
    }

    const data = (await response.json()) as {
      accessToken: string
      expiresIn: number
    }

    return {
      accessToken: data.accessToken,
      refreshToken,
      expiresIn: data.expiresIn,
      expiresAt: new Date(Date.now() + data.expiresIn * 1000),
    }
  }

  private async refreshIdCToken(
    config: KiroAuthConfig,
  ): Promise<KiroTokenInfo> {
    const response = await fetch(IDC_REFRESH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "oidc.us-east-1.amazonaws.com",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: config.refreshToken,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`IdC token refresh failed: ${response.status} ${text}`)
    }

    const data = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    return {
      accessToken: data.access_token,
      refreshToken: config.refreshToken,
      expiresIn: data.expires_in,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    }
  }

  getStatus() {
    return {
      totalTokens: this.tokens.length,
      currentIndex: this.currentIndex,
      tokens: this.tokens.map((t, i) => ({
        index: i,
        auth: t.config.auth,
        usageCount: t.usageCount,
        errorCount: t.errorCount,
        hasValidToken: t.token ? t.token.expiresAt > new Date() : false,
      })),
    }
  }
}

export const kiroTokenManager = new KiroTokenManager()
