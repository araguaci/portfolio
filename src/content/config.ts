import { defineCollection, z } from 'astro:content'
import { CATEGORIES } from '@/data/categories'

const dateSchema = z
	.string()
	.or(z.date())
	.transform((val) => new Date(val))

const blog = defineCollection({
	schema: ({ image }) =>
		z
			.object({
				title: z.string().max(80),
				description: z.string().default(''),
				// pubDate ou date (alias)
				pubDate: dateSchema.optional(),
				date: dateSchema.optional(),
				// heroImage: path local (image()), URL remota ou path público (/assets/img/...)
				heroImage: z.union([image(), z.string()]).optional(),
				image: z
					.object({
						path: z.string().optional()
					})
					.optional()
					.catch(undefined),
				category: z.enum(CATEGORIES),
				tags: z.array(z.string()).default([]),
				author: z.string().optional(),
				draft: z.boolean().default(false),
				// links: [{ title, url }] - links para versão online do projeto
				links: z
					.array(
						z.object({
							title: z.string(),
							url: z
								.string()
								.transform((val) => (val.startsWith('http') ? val : `https://${val}`))
						})
					)
					.optional()
					.default([])
			})
			.transform((data) => {
				const pubDate = data.pubDate ?? data.date
				if (!pubDate) throw new Error(`Missing pubDate/date: ${data.title}`)

				let heroImage = data.heroImage
				if (!heroImage && data.image?.path) {
					// URLs remotas: usa como está. Paths locais: /assets/img/xxx → public/assets/img/
					heroImage = data.image.path.startsWith('http')
						? data.image.path
						: data.image.path.startsWith('/')
							? data.image.path
							: `/assets/img/${data.image.path.replace(/^assets\/img\//, '')}`
				}

				const { date, image, ...rest } = data
				return { ...rest, pubDate, heroImage }
			})
})

export const collections = { blog }
