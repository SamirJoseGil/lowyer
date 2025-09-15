/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { init } from "./env.server";

// Initialize environment validation first
init();

const ABORT_DELAY = 5_000;

// Log server startup
console.log(`🚀 Lawyer server starting...`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(
  `🔧 Database URL configured: ${process.env.DATABASE_URL ? "✅" : "❌"
  }`
);
console.log(
  `🗄️ Supabase URL configured: ${process.env.SUPABASE_URL ? "✅" : "❌"}`
);

// More detailed Gemini API key logging
const geminiKey = process.env.GEMINI_API_KEY?.trim();
if (geminiKey) {
  console.log(`🤖 Gemini API configured: ✅`);
  console.log(`🔑 Gemini API key format: ${geminiKey.startsWith('AIza') ? '✅ Valid format' : '❌ Invalid format'}`);
  console.log(`🔑 Gemini API key length: ${geminiKey.length} characters`);
  console.log(`🔑 Gemini API key preview: ${geminiKey.substring(0, 8)}...${geminiKey.slice(-4)}`);

  // Check for common issues
  if (geminiKey.includes(' ')) {
    console.log(`⚠️ WARNING: API key contains spaces`);
  }
  if (geminiKey.includes('"')) {
    console.log(`⚠️ WARNING: API key contains quotes`);
  }
  if (geminiKey.includes('tu-api-key')) {
    console.log(`❌ ERROR: API key contains placeholder text`);
  }
} else {
  console.log(`🤖 Gemini API configured: ❌ KEY MISSING OR EMPTY`);
  console.log(`🔍 Raw env value: "${process.env.GEMINI_API_KEY}"`);
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    )
    : handleBrowserRequest(
      request,
      responseStatusCode,
      responseHeaders,
      remixContext
    );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error("💥 Server render error:", error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error("💥 Server render error:", error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
