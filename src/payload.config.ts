import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig } from 'payload'
import { runJobs } from './access/runJobs'
import { authenticated } from './access/authenticated'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Clients } from './collections/Clients'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Payload types transportOptions as connection options; authentication belongs
// to the SMTP transport and is passed through to Nodemailer's createTransport.
const smtpTransportOptions = {
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
}

// Local snapshot imports select an in-memory transport: no SMTP connection or delivery.
const localEmail = process.env.EMAIL_TRANSPORT === 'json'
const localTransportOptions = { host: '127.0.0.1', jsonTransport: true }

const mongoURL = process.env.MONGODB_URI
if (!mongoURL) {
	throw new Error(
		'MONGODB_URI is not defined. Please set it in your environment.'
	)
}

const payloadSecret = process.env.PAYLOAD_SECRET
if (!payloadSecret) {
	throw new Error(
		'PAYLOAD_SECRET is not defined. Please set it in your environment.'
	)
}

export default buildConfig({
	admin: {
		components: {
			// The `BeforeLogin` component renders a message that you see while logging into your admin panel.
			// Feel free to delete this at any time. Simply remove the line below.
			beforeLogin: ['@/components/BeforeLogin']
		},
		importMap: {
			baseDir: path.resolve(dirname)
		},
		user: Users.slug,
		livePreview: {
            openByDefault: true,
			breakpoints: [
				{
					label: 'Mobile',
					name: 'mobile',
					width: 375,
					height: 667
				},
				{
					label: 'Tablet',
					name: 'tablet',
					width: 768,
					height: 1024
				},
				{
					label: 'Desktop',
					name: 'desktop',
					width: 1440,
					height: 900
				}
			]
		}
	},
	// This config helps us configure global or default features that the other editors can inherit
	editor: defaultLexical,
	db: mongooseAdapter({
		url: process.env.MONGODB_URI || '',
		connectOptions: {
			// weniger lange „hängen“, wenn ein Node in der Replica-Set mal zickt
			serverSelectionTimeoutMS: 5000,
			// Limit connections per application instance.
			maxPoolSize: 10,
			minPoolSize: 0,
			maxIdleTimeMS: 60000,
			// falls es DNS/IPv6-Probleme gibt:
			family: 4
		}
	}),
	collections: [Pages, Posts, Media, Categories, Users, Clients, Projects],
	cors: [getServerSideURL()].filter(Boolean),
	csrf: [getServerSideURL()],
	maxDepth: 5,
	graphQL: { maxComplexity: 500, disablePlaygroundInProduction: true },
	globals: [Header, Footer],
	plugins: [...plugins],
	email: nodemailerAdapter({
		defaultFromAddress: 'no-reply@the-easycode.eu',
		defaultFromName: 'EasyCode',
		// Nodemailer transportOptions
		transportOptions: localEmail ? localTransportOptions : smtpTransportOptions,
		skipVerify: localEmail
	}),
	secret: process.env.PAYLOAD_SECRET,
	sharp,
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts')
	},
	jobs: {
		access: {
			run: runJobs,
			queue: authenticated,
			cancel: authenticated,
		},
		tasks: []
	}
})

