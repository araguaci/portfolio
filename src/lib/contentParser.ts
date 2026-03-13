import { getCollection } from 'astro:content'

export const getSinglePage = async (collection: string) => {
	const allPage = await getCollection(collection as any)
	const removeIndex = allPage.filter((data: any) => data.id.match(/^(?!-)/))
	const removeDrafts = removeIndex.filter((data: any) => !data.data.draft)
	return removeDrafts
}
