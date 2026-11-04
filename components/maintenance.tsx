import { Button } from "@/components/ui/button"
import { FooterSmall } from "./footer-small"

export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 via-[#05080d] to-[#05080d] text-white text-center px-6 py-16">
                <img fetchPriority="high" decoding="async"
                    src="/images/loghi/lungo-bianco.webp"
                    alt="Logo Volleyball San Martino"
                    className="mb-8 animate-pulse w-full max-w-md"
                />
                <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-primary" style={{ fontFamily: "Ethnocentric, sans-serif" }}>
                    SITO IN MANUTENZIONE
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-xl mb-8">
                    Stiamo lavorando per offrirti un’esperienza ancora migliore 🛠️
                    Torna a trovarci presto!
                </p>
                <Button
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary hover:text-white transition-all"
                    asChild
                >
                    <a href="mailto:vbsmcampionati@gmail.com">📩 Contattaci</a>
                </Button>

            </div>
            <FooterSmall />
        </div>
    )
}
