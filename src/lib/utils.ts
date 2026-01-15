import consola from "consola"

import { getModels } from "~/services/copilot/get-models"
import { getVSCodeVersion } from "~/services/get-vscode-version"

import { state } from "./state"

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined

export async function cacheModels(): Promise<void> {
  const models = await getModels()
  state.models = models

  // 调试：输出完整模型列表，查看是否有被过滤的 Claude 模型
  const claudeModels = models.data.filter(
    (m) =>
      m.id.includes("claude")
      || m.vendor?.toLowerCase().includes("anthropic")
      || m.name?.toLowerCase().includes("claude"),
  )
  if (claudeModels.length > 0) {
    consola.info(
      "Found Claude models:",
      claudeModels.map((m) => ({ id: m.id, policy: m.policy })),
    )
  } else {
    consola.warn("No Claude models found in API response")
  }
}

export const cacheVSCodeVersion = async () => {
  const response = await getVSCodeVersion()
  state.vsCodeVersion = response

  consola.info(`Using VSCode version: ${response}`)
}
