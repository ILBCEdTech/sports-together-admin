export type GalleryImageSource = {
  image_url?: string | null;
  presigned_url?: string | null;
};

export function getGalleryImageUrl(image: GalleryImageSource): string {
  return image.image_url?.trim() || image.presigned_url?.trim() || "";
}
