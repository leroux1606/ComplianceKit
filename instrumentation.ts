export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    // Validate env vars at server startup — throws with a clear message
    // if required vars are missing rather than failing later at request time
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
