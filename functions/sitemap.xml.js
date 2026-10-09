export async function onRequest(context) {
    const API_URL =
        "https://e-commerce-api-nux3.onrender.com/api/v1/products/sitemap"

    const SITE_URL =
        "https://e-commerce-fullstack-project.pages.dev"

    try {
        const response = await fetch(API_URL)

        if (!response.ok) {
            throw new Error("Failed to retrieve products for the sitemap")
        }

        const data = await response.json()

        const productUrls = data.products.map((product) => {
            return `
                <url>
                    <loc>${SITE_URL}/product.html?id=${product.id}</loc>
                </url>
            `
        })

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>${SITE_URL}/</loc>
                </url>
                ${productUrls.join("")}
            </urlset>
        `

        return new Response(sitemap, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600"
            }
        })
    } catch (error) {
        console.error("Sitemap generation failed:", error)

        return new Response("Unable to generate sitemap", {
            status: 500,
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        })
    }
}