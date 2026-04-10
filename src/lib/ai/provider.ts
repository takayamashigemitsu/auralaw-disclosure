/**
 * AI Provider abstraction layer
 *
 * 設計原則:
 *  - 「AIで判断するな、AIで圧縮しろ」
 *  - 全プロバイダはこのinterface経由で呼ぶ
 *  - 直接 fetch("https://api.anthropic.com/...") する箇所を禁止
 *  - プロバイダ切替（Anthropic → OpenAI → Stub）を可能にし、ベンダーロックインを避ける
 *
 * 用途:
 *  - 相談内容の整理・要約（compress/organize）
 *  - 法的判断は行わない（出力は弁護士レビュー前提）
 */

export type AIMessage = {
  role: "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image"; mimeType: string; data: string }
      >;
};

export type AIRequest = {
  /** 1回の呼び出しの用途識別子。監査ログと日次コスト集計に使う。 */
  purpose:
    | "organize_consultation"     // 相談内容の整理・要約
    | "extract_keypoints"          // 論点の抽出
    | "draft_document"             // 書類ドラフト補助
    | "classify_consultation"      // 分類
    | "stub_test";                 // テスト用
  /** システムプロンプト（このプロンプトは利用者入力を含んではならない） */
  system: string;
  messages: AIMessage[];
  /** 最大出力トークン */
  maxTokens?: number;
  /** 呼び出し元ユーザーID（監査用） */
  userId: string;
};

export type AIResponse = {
  text: string;
  /** 使用した入力トークン数（概算可） */
  inputTokens: number;
  /** 使用した出力トークン数（概算可） */
  outputTokens: number;
  /** コスト（USD、概算） */
  estimatedCostUsd: number;
  /** プロバイダ名 */
  provider: string;
  /** モデル名 */
  model: string;
  /** スタブ応答かどうか */
  isStub: boolean;
};

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  chat(req: AIRequest): Promise<AIResponse>;
}
