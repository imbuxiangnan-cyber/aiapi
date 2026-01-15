import { CODE_WHISPERER_URL } from "./auth"
import { mapModelToInternal } from "./models"
import { kiroTokenManager } from "./token-manager"

export interface KiroMessage {
  role: "user" | "assistant"
  content: string
}

export interface KiroChatRequest {
  model: string
  messages: Array<KiroMessage>
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export async function createKiroChatCompletion(
  request: KiroChatRequest,
): Promise<Response> {
  const token = await kiroTokenManager.getToken()
  const internalModel = mapModelToInternal(request.model)

  // Convert to CodeWhisperer format
  const cwRequest = {
    conversationState: {
      currentMessage: {
        userInputMessage: {
          content: request.messages.at(-1)?.content ?? "",
        },
      },
      chatTriggerType: "MANUAL",
    },
    profileArn: "arn:aws:codewhisperer:us-east-1:aws:profile/default",
  }

  const response = await fetch(CODE_WHISPERER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-amz-target":
        "AmazonQDeveloperStreamingService.GenerateAssistantResponse",
    },
    body: JSON.stringify(cwRequest),
  })

  return response
}
