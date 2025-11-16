import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_: NextRequest) {
  const res = NextResponse.next();

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    
    // 允许 inline script（Next.js 必须），否则页面会白屏
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

    // 内联样式允许，否则部分组件会错位
    "style-src 'self' 'unsafe-inline'",

    // 允许本地和远程图片
    "img-src 'self' data: blob: https:",

    // 允许字体
    "font-src 'self' data:",

    // 允许你的 API / Prisma / 动态请求
    "connect-src 'self' https://*.vercel.app https://magicgiftstudio.com",

    // 其他安全策略
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);

  return res;
}
