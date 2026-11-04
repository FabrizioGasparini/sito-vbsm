/** @type {import('next').NextConfig} */

// Header di sicurezza applicati a tutte le risposte.
// La CSP non è inclusa volutamente: Next.js inietta script inline e una CSP
// rigorosa richiede nonce via middleware; va valutata a parte (vedi report).
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
]

if (process.env.NODE_ENV === "production") {
    securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000" })
}

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "volleyballsanmartino.it",
                port: "",
                pathname: "/images/**",
            },
        ],
        qualities: [30, 40, 50, 60, 70, 80, 90, 100],
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            {
                // Le aree riservate non devono essere indicizzate né messe in cache condivise
                source: "/(admin|login)(.*)",
                headers: [
                    { key: "X-Robots-Tag", value: "noindex, nofollow" },
                    { key: "Cache-Control", value: "private, no-store" },
                ],
            },
        ]
    },
}

export default nextConfig
