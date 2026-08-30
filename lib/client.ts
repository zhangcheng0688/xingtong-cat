// 客户端 API 助手：自动携带登录令牌，统一识别积分不足（402）
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("xt_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export interface CreditError {
  code: string;
  balance: number;
  need: number;
  message: string;
}

export async function readApiError(res: Response): Promise<CreditError | Error> {
  try {
    const d = await res.json();
    if (d.code === "INSUFFICIENT_CREDITS") {
      return { code: d.code, balance: d.balance ?? 0, need: d.need ?? 0, message: d.error ?? "积分不足" };
    }
    return new Error(d.error || `请求失败（${res.status}）`);
  } catch {
    return new Error(`请求失败（${res.status}）`);
  }
}

export function isCreditError(e: unknown): e is CreditError {
  return typeof e === "object" && e !== null && (e as CreditError).code === "INSUFFICIENT_CREDITS";
}
