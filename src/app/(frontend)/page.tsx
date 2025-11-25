import { generateMetadata } from './[slug]/page'

export default function Page() {
	return (
		<div className="w-full h-full min-h-screen">
			{/* <HeroTextAnimation
                phrases={[
                    "Ihr Freelancer",
                    "Ihr Fullstackler",
                    "Ihr Designer",
                    "Ihr DevOpsler",
                ]}
                title='für Web&shy;ent&shy;wicklung aus Dresden'
                description='Als freiberuflicher Webentwickler aus Dresden
                            realisiere ich Online-Projekte von der Strategie bis
                            zur Live-Schaltung, entwickle maßgeschneiderte
                            Websites & E-Commerce-Lösungen für KMUs und
                            Agenturen unterstütze ich bei der Umsetzung ihrer
                            Digitalprojekte mit technischem Know-how und agilen
                            Workflows.'
                tags={["Freelancer", "KMUs", "Agenturen"]}
                icons={["Laptop", "SquareCode", "Handshake", "Paintbrush"]}
                image={{
                    src: "/Logo/Niklas_Logo.png",
                    alt: "EasyCode Logo",
                    width: 1920,
                    height: 1920,
                }}
            />
            <ClientsCarousel />
            <Services />
            <Projects /> */}
		</div>
	)
}

export { generateMetadata }
