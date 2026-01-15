import consola from "consola"

export interface TokenConfig {
  token: string
  name?: string
  disabled?: boolean
}

export interface CachedToken {
  config: TokenConfig
  lastUsed: Date
  usageCount: number
  isExhausted: boolean
  errorCount: number
}

export class TokenPool {
  private tokens: Map<string, CachedToken> = new Map()
  private tokenOrder: Array<string> = []
  private currentIndex = 0

  constructor(configs: Array<TokenConfig>) {
    this.initializePool(configs)
  }

  private initializePool(configs: Array<TokenConfig>) {
    for (const [index, config] of configs.entries()) {
      if (config.disabled) continue

      const key = `token_${index}`
      this.tokens.set(key, {
        config,
        lastUsed: new Date(0),
        usageCount: 0,
        isExhausted: false,
        errorCount: 0,
      })
      this.tokenOrder.push(key)
    }

    consola.info(`TokenPool initialized with ${this.tokens.size} tokens`)
  }

  getBestToken(): TokenConfig | null {
    if (this.tokenOrder.length === 0) return null

    for (let i = 0; i < this.tokenOrder.length; i++) {
      const key = this.tokenOrder[this.currentIndex]
      const cached = this.tokens.get(key)

      if (cached && !cached.isExhausted && cached.errorCount < 3) {
        cached.lastUsed = new Date()
        cached.usageCount++
        return cached.config
      }

      this.currentIndex = (this.currentIndex + 1) % this.tokenOrder.length
    }

    this.resetExhausted()
    return this.tokens.get(this.tokenOrder[0])?.config ?? null
  }

  markExhausted(token: string) {
    for (const [, cached] of this.tokens) {
      if (cached.config.token === token) {
        cached.isExhausted = true
        this.currentIndex = (this.currentIndex + 1) % this.tokenOrder.length
        consola.warn(`Token marked as exhausted, switching to next`)
        break
      }
    }
  }

  markError(token: string) {
    for (const [, cached] of this.tokens) {
      if (cached.config.token === token) {
        cached.errorCount++
        if (cached.errorCount >= 3) {
          cached.isExhausted = true
          this.currentIndex = (this.currentIndex + 1) % this.tokenOrder.length
        }
        break
      }
    }
  }

  private resetExhausted() {
    for (const [, cached] of this.tokens) {
      cached.isExhausted = false
      cached.errorCount = 0
    }
    this.currentIndex = 0
  }

  getStatus() {
    const status: Array<{
      name: string
      usageCount: number
      isExhausted: boolean
      errorCount: number
      lastUsed: string
    }> = []

    for (const [index, key] of this.tokenOrder.entries()) {
      const cached = this.tokens.get(key)
      if (cached) {
        status.push({
          name: cached.config.name ?? `Token ${index + 1}`,
          usageCount: cached.usageCount,
          isExhausted: cached.isExhausted,
          errorCount: cached.errorCount,
          lastUsed: cached.lastUsed.toISOString(),
        })
      }
    }

    return {
      totalTokens: this.tokens.size,
      currentIndex: this.currentIndex,
      tokens: status,
    }
  }
}
