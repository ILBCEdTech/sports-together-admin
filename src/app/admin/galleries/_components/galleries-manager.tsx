"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { ImagePlus, Images, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api.client";
import { getGalleryImageUrl } from "@/lib/gallery-image-url";

type Sport = { id: number; name: string; code: string; is_active: boolean };
type GalleryImage = {
  id: number;
  gallery_id: number;
  image_url: string;
  presigned_url?: string | null;
  object_key: string | null;
  alt_text: string | null;
  sort_order: number;
};
type SportGallery = {
  id: number;
  sport_id: number | null;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  sport?: Sport | null;
  images: GalleryImage[];
};
type PendingImage = { id: string; file: File; preview: string; altText: string };

const maxGalleryImageSizeMb = 20;
const maxGalleryImageSizeBytes = maxGalleryImageSizeMb * 1024 * 1024;

const gallerySchema = z.object({
  sport_id: z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.number().int().positive("Choose a valid sport.").nullable(),
  ),
  title: z.string().trim().min(2, "Enter a gallery title.").max(120, "Use 120 characters or fewer."),
  description: z.string().trim().max(500, "Use 500 characters or fewer."),
});

const mosaicItemClasses = [
  "sm:col-span-4 lg:col-span-3",
  "sm:col-span-8 lg:col-span-5",
  "sm:col-span-6 lg:col-span-4",
  "sm:col-span-6 lg:col-span-5",
  "sm:col-span-7 lg:col-span-4",
  "sm:col-span-5 lg:col-span-3",
] as const;

export function GalleriesManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [galleries, setGalleries] = useState<SportGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<SportGallery | null>(null);
  const [galleryToDelete, setGalleryToDelete] = useState<SportGallery | null>(null);
  const [query, setQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [sportId, setSportId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [errors, setErrors] = useState<{ sport_id?: string; title?: string; description?: string; images?: string }>({});

  useEffect(() => {
    Promise.all([adminApi<Sport[]>("sports"), adminApi<SportGallery[]>("sport-galleries")])
      .then(([sportRecords, galleryRecords]) => {
        setSports(sportRecords);
        setGalleries(galleryRecords);
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return galleries.filter((gallery) => {
      if (gallery.images.length === 0) return false;
      if (selectedSport === "general" && gallery.sport_id !== null) return false;
      if (selectedSport !== "all" && selectedSport !== "general" && gallery.sport_id !== Number(selectedSport)) {
        return false;
      }
      if (!value) return true;
      const sportName = gallery.sport?.name ?? sports.find((sport) => sport.id === gallery.sport_id)?.name ?? "School Life";
      return gallery.title.toLowerCase().includes(value) || sportName.toLowerCase().includes(value);
    });
  }, [galleries, query, selectedSport, sports]);

  const sportsWithImages = useMemo(() => {
    const sportIds = new Set(galleries.filter((gallery) => gallery.images.length > 0).map((gallery) => gallery.sport_id));
    return sports.filter((sport) => sportIds.has(sport.id));
  }, [galleries, sports]);
  const hasGeneralGalleries = galleries.some((gallery) => gallery.images.length > 0 && gallery.sport_id === null);

  const galleryCount = galleries.filter((gallery) => gallery.images.length > 0).length;

  const visibleImages = filtered.flatMap((gallery) => {
    const sport = gallery.sport ?? sports.find((item) => item.id === gallery.sport_id);
    return gallery.images.map((image) => ({ gallery, image, sportName: sport?.name ?? "School Life" }));
  });

  function resetForm() {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });
    setSportId("");
    setTitle("");
    setDescription("");
    setImages([]);
    setErrors({});
  }

  function startCreate() {
    resetForm();
    setEditingGallery(null);
    setOpen(true);
  }

  function startEdit(gallery: SportGallery) {
    resetForm();
    setEditingGallery(gallery);
    setSportId(gallery.sport_id === null ? "" : String(gallery.sport_id));
    setTitle(gallery.title);
    setDescription(gallery.description ?? "");
    setOpen(true);
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter((file) => file.type.startsWith("image/") && file.size <= maxGalleryImageSizeBytes);
    if (valid.length !== selected.length) {
      toast.error(`Choose image files up to ${maxGalleryImageSizeMb} MB each.`);
    }
    setImages((current) => [
      ...current,
      ...valid.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
        altText: "",
      })),
    ]);
    setErrors((current) => ({ ...current, images: undefined }));
    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((image) => image.id !== id);
    });
  }

  async function uploadImages(galleryId: number, existingImageCount = 0) {
    const form = new FormData();
    images.forEach((image) => {
      form.append("images", image.file);
    });
    const response = await fetch(`/api/admin/sport-galleries/${galleryId}/images`, { method: "POST", body: form });
    const payload = (await response.json().catch(() => null)) as SportGallery | { message?: string } | null;
    if (!response.ok) {
      throw new Error(payload && "message" in payload ? payload.message : "The images could not be uploaded.");
    }

    const uploadedGallery = payload as SportGallery;
    const existingImages = uploadedGallery.images.slice(0, existingImageCount);
    const updatedNewImages = await Promise.all(
      uploadedGallery.images.slice(existingImageCount).map((uploadedImage, index) => {
        const altText = images[index]?.altText.trim();
        if (!altText) return uploadedImage;
        return adminApi<GalleryImage>(`gallery-images/${uploadedImage.id}`, {
          method: "PATCH",
          body: JSON.stringify({ alt_text: altText }),
        });
      }),
    );
    return { ...uploadedGallery, images: [...existingImages, ...updatedNewImages] };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = gallerySchema.safeParse({ sport_id: sportId, title, description });
    const fieldErrors = result.success ? {} : result.error.flatten().fieldErrors;
    if (!result.success || (!editingGallery && images.length === 0)) {
      setErrors({
        sport_id: fieldErrors.sport_id?.[0],
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        images: editingGallery || images.length ? undefined : "Add at least one image.",
      });
      return;
    }

    setSaving(true);
    try {
      const gallery = await adminApi<SportGallery>(
        editingGallery ? `sport-galleries/${editingGallery.id}` : "sport-galleries",
        {
          method: editingGallery ? "PATCH" : "POST",
          body: JSON.stringify({ ...result.data, description: result.data.description || null }),
        },
      );
      const uploadedGallery = images.length
        ? await uploadImages(gallery.id, editingGallery?.images.length ?? 0)
        : gallery;
      const sport = result.data.sport_id === null ? null : sports.find((item) => item.id === result.data.sport_id);
      setGalleries((current) =>
        editingGallery
          ? current.map((item) => (item.id === editingGallery.id ? { ...uploadedGallery, sport } : item))
          : [{ ...uploadedGallery, sport }, ...current],
      );
      toast.success(editingGallery ? `${gallery.title} updated` : `${gallery.title} created with ${images.length} image${images.length === 1 ? "" : "s"}`);
      resetForm();
      setEditingGallery(null);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The gallery could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGallery() {
    if (!galleryToDelete) return;
    setDeleting(true);
    try {
      await adminApi<SportGallery>(`sport-galleries/${galleryToDelete.id}`, { method: "DELETE" });
      setGalleries((current) => current.filter((gallery) => gallery.id !== galleryToDelete.id));
      toast.success(`${galleryToDelete.title} deleted`);
      setGalleryToDelete(null);
      setSelectedSport("all");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The gallery could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-medium text-3xl tracking-tight">Galleries</h1>
          <p className="mt-1 text-muted-foreground">Organize school-life and sports event photos into galleries.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus data-icon="inline-start" /> New gallery
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Gallery library</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {galleryCount} galleries with images · {sportsWithImages.length} sports
                {hasGeneralGalleries ? " · School Life collections" : ""}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search galleries" className="pl-8" aria-label="Search galleries" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!loading && (sportsWithImages.length > 0 || hasGeneralGalleries) && (
            <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-6 min-w-0">
              <div className="overflow-x-auto pb-1">
                <TabsList className="min-w-max" aria-label="Filter galleries by sport">
                  <TabsTrigger value="all">All galleries</TabsTrigger>
                  {hasGeneralGalleries && <TabsTrigger value="general">School Life</TabsTrigger>}
                  {sportsWithImages.map((sport) => (
                    <TabsTrigger key={sport.id} value={String(sport.id)}>
                      {sport.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          )}
          {loading ? <p className="text-sm text-muted-foreground">Loading galleries...</p> : visibleImages.length ? (
            <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-12">
              {visibleImages.map(({ gallery, image, sportName }, index) => (
                <figure
                  key={image.id}
                  className={`group relative h-64 overflow-hidden rounded-md bg-muted shadow-sm ${mosaicItemClasses[index % mosaicItemClasses.length]}`}
                >
                  <Image
                    src={getGalleryImageUrl(image)}
                    alt={image.alt_text ?? `${gallery.title} image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {gallery.images[0]?.id === image.id && (
                    <div className="absolute top-3 right-3 z-10 flex gap-1 rounded-md bg-background/90 p-1 shadow-sm backdrop-blur-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(gallery)}
                        aria-label={`Edit ${gallery.title}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setGalleryToDelete(gallery)}
                        aria-label={`Delete ${gallery.title}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pt-12 pb-4 text-white">
                    <figcaption className="font-medium">{sportName}</figcaption>
                  </div>
                </figure>
              ))}
            </div>
          ) : (
            <Empty className="min-h-64"><EmptyHeader><EmptyMedia variant="icon"><Images /></EmptyMedia><EmptyTitle>No galleries with images found</EmptyTitle><EmptyDescription>{query || selectedSport !== "all" ? "Try another gallery tab or search term." : "Create a gallery and upload the first set of school-life photos."}</EmptyDescription></EmptyHeader></Empty>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => { if (!saving) setOpen(next); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={submit} noValidate>
            <DialogHeader><DialogTitle>{editingGallery ? "Edit gallery" : "Create gallery"}</DialogTitle><DialogDescription>{editingGallery ? "Update the gallery details or add more images." : "Add gallery details, then choose images in their display order."}</DialogDescription></DialogHeader>
            <FieldGroup className="my-5">
              <Field data-invalid={Boolean(errors.sport_id)}><FieldLabel htmlFor="gallery-sport">Sport <span className="text-muted-foreground">(optional)</span></FieldLabel><NativeSelect id="gallery-sport" value={sportId} onChange={(event) => setSportId(event.target.value)} className="w-full" aria-invalid={Boolean(errors.sport_id)}><NativeSelectOption value="">Other</NativeSelectOption>{sports.map((sport) => <NativeSelectOption key={sport.id} value={sport.id}>{sport.name}{sport.is_active ? "" : " (inactive)"}</NativeSelectOption>)}</NativeSelect><FieldError>{errors.sport_id}</FieldError></Field>
              <Field data-invalid={Boolean(errors.title)}><FieldLabel htmlFor="gallery-title">Title</FieldLabel><Input id="gallery-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Inter-school football finals" aria-invalid={Boolean(errors.title)} /><FieldError>{errors.title}</FieldError></Field>
              <Field data-invalid={Boolean(errors.description)}><FieldLabel htmlFor="gallery-description">Description <span className="text-muted-foreground">(optional)</span></FieldLabel><Textarea id="gallery-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add context about this collection" rows={3} aria-invalid={Boolean(errors.description)} /><FieldError>{errors.description}</FieldError></Field>
              {editingGallery && editingGallery.images.length > 0 && (
                <Field>
                  <FieldLabel>Existing images ({editingGallery.images.length})</FieldLabel>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {editingGallery.images.map((image, index) => (
                      <figure key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                        <Image
                          src={getGalleryImageUrl(image)}
                          alt={image.alt_text ?? `${editingGallery.title} image ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 33vw, 160px"
                          className="object-cover"
                          unoptimized
                        />
                        <Badge className="absolute top-1 left-1" variant="secondary">
                          {index + 1}
                        </Badge>
                      </figure>
                    ))}
                  </div>
                </Field>
              )}
              <Field data-invalid={Boolean(errors.images)}><FieldLabel>{editingGallery ? "Add images (optional)" : "Images"}</FieldLabel><input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={chooseFiles} /><button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 text-center transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ImagePlus className="mb-3 size-7 text-muted-foreground" /><span className="font-medium text-sm">Choose images</span><span className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP or GIF · up to {maxGalleryImageSizeMb} MB each</span></button><FieldError>{errors.images}</FieldError></Field>
              {images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{images.map((image, index) => <div key={image.id} className="flex gap-3 rounded-lg border p-2"><div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted"><Image src={image.preview} alt="" fill sizes="80px" className="object-cover" unoptimized /><Badge className="absolute top-1 left-1" variant="secondary">{index + 1}</Badge></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-medium">{image.file.name}</p><Button type="button" variant="ghost" size="icon-xs" onClick={() => removeImage(image.id)} aria-label={`Remove ${image.file.name}`}><X /></Button></div><Input value={image.altText} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, altText: event.target.value } : item))} placeholder="Alt text (optional)" className="mt-2 h-7 text-xs" aria-label={`Alt text for ${image.file.name}`} /></div></div>)}</div>}
            </FieldGroup>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editingGallery ? "Save changes" : <><Upload data-icon="inline-start" />Create & upload</>}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(galleryToDelete)} onOpenChange={(next) => { if (!next && !deleting) setGalleryToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              {galleryToDelete ? `“${galleryToDelete.title}” and all of its uploaded images will be permanently deleted.` : "This gallery and its images will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                void deleteGallery();
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete gallery"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
