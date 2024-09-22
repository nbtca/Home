import { getImage } from "astro:assets"

export async function fixImage(image: string, href: string) {
  try {
    const sliceHref = href.slice(0, href.lastIndexOf("/") + 1)// get the dir of the current page(remove filename)
    const imageLocation = await import(
      /* @vite-ignore */ `/src/pages${sliceHref}${image.slice(1)}`
    )// static import of the image
    image = imageLocation.default
    return (
      await getImage({ // resolve the images
        src: image,
        inferSize: true,
      })
    ).src
  }
  catch (error) {
    console.log(error)
  }
}
