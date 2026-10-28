declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string
			PAYLOAD_SECRET: string
			NEXT_PUBLIC_SERVER_URL: string
			UMAMI_SCRIPT_URL?: string
			UMAMI_WEBSITE_ID?: string
			CRON_SECRET: string
			PREVIEW_SECRET: string
			SMTP_HOST: string
			SMTP_PORT: number
			SMTP_USER: string
			SMTP_PASS: string
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
