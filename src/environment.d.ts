declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string
			PAYLOAD_SECRET: string
			NEXT_PUBLIC_SERVER_URL: string
			CRON_SECRET: string
			PREVIEW_SECRET: string
			BLOB_READ_WRITE_TOKEN: string
			SMTP_HOST: string
			SMTP_PORT: number
			SMTP_USER: string
			SMTP_PASS: string
			VERCEL_PROJECT_PRODUCTION_URL: string
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
