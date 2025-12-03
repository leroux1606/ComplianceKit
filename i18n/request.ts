import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { locales, defaultLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  
  if (localeCookie && locales.includes(localeCookie)) {
    return {
      locale: localeCookie,
      messages: (await import(`./messages/${localeCookie}.json`)).default,
    };
  }

  // Try to detect from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  
  if (acceptLanguage) {
    const browserLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2));
    
    for (const browserLocale of browserLocales) {
      if (locales.includes(browserLocale as Locale)) {
        return {
          locale: browserLocale,
          messages: (await import(`./messages/${browserLocale}.json`)).default,
        };
      }
    }
  }

  // Default to English
  return {
    locale: defaultLocale,
    messages: (await import(`./messages/${defaultLocale}.json`)).default,
  };
});

