"use client";

import { DragEvent, FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, Upload } from "lucide-react";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Progress,
  Textarea
} from "@fontbox/ui";

import { useCreateCategory, useUploadFont, useCreateTag } from "../../shared/api/hooks";
import type { Category, Font, Tag } from "../../shared/api/schema";
import { useToast } from "../../shared/ui/toast";

interface UploadDialogProps {
  existingFonts: Font[];
  tags: Tag[];
  categories: Category[];
  onTagCreated?: () => void;
  onCategoryCreated?: () => void;
}

type DragState = "idle" | "active";

export function UploadDialog({ existingFonts, tags, categories, onTagCreated, onCategoryCreated }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState>("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formState, setFormState] = useState({
    name: "",
    family: "",
    style: "Regular",
    weight: 400,
    foundry: "",
    license: "",
    description: ""
  });
  const [tagName, setTagName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [progress, setProgress] = useState(0);

  const notify = useToast();
  const { trigger: uploadFont, isMutating } = useUploadFont();
  const { trigger: createTag } = useCreateTag();
  const { trigger: createCategory } = useCreateCategory();

  const duplicates = useMemo(() => {
    return existingFonts.filter(
      (font) =>
        font.name.toLowerCase() === formState.name.toLowerCase() ||
        font.family.toLowerCase() === formState.family.toLowerCase()
    );
  }, [existingFonts, formState.family, formState.name]);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragState("idle");
    const files = Array.from(event.dataTransfer.files ?? []);
    setSelectedFiles(files);
  };

  const handleBrowse = (event: FormEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    setSelectedFiles(files);
  };

  const toggleSelection = (value: string, list: string[], setter: (value: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const quickCreateTag = async () => {
    if (!tagName.trim()) return;
    const result = await createTag({ name: tagName.trim() });
    notify({ title: "Tag created", description: `${result.name} added to library` });
    onTagCreated?.();
    setSelectedTags((prev) => [...new Set([...prev, result.slug])]);
    setTagName("");
  };

  const quickCreateCategory = async () => {
    if (!categoryName.trim()) return;
    const result = await createCategory({ name: categoryName.trim() });
    notify({ title: "Category created", description: `${result.name} added to library` });
    onCategoryCreated?.();
    setSelectedCategories((prev) => [...new Set([...prev, result.slug])]);
    setCategoryName("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      notify({ title: "No file selected", description: "Please select a font file to upload", variant: "destructive" });
      return;
    }
    if (!formState.name) {
      notify({ title: "Missing details", description: "Provide a name for the font", variant: "destructive" });
      return;
    }
    if (duplicates.length > 0) {
      notify({
        title: "Duplicate detected",
        description: "A font with this name or family already exists.",
        variant: "destructive"
      });
      return;
    }
    try {
      setProgress(10);
      await uploadFont({
        file: selectedFiles[0],
        metadata: {
          name: formState.name,
          description: formState.description || undefined,
          categoryId: selectedCategories[0] || undefined,
          tags: selectedTags
        }
      });
      setProgress(100);
      notify({ title: "Font uploaded", description: `${formState.name} is ready for use.` });
      setOpen(false);
      setSelectedFiles([]);
      setSelectedTags([]);
      setSelectedCategories([]);
      setFormState({
        name: "",
        family: "",
        style: "Regular",
        weight: 400,
        foundry: "",
        license: "",
        description: ""
      });
      setTimeout(() => setProgress(0), 400);
    } catch (error) {
      notify({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload font
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload font</DialogTitle>
          <DialogDescription>
            Drag and drop font files or browse from your computer. Metadata helps your team discover fonts quickly.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragState("active");
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragState("idle");
            }}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center ${
              dragState === "active" ? "border-brand bg-brand-subtle" : "border-neutral-200"
            }`}
          >
            <Upload className="mb-4 h-8 w-8 text-brand" />
            <p className="text-sm text-neutral-500">
              Drop files here or click to browse. Supported formats: OTF, TTF, WOFF, WOFF2.
            </p>
            <Input type="file" multiple className="mt-4" onInput={handleBrowse} />
            {selectedFiles.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">{selectedFiles.length} file(s) selected.</p>
            )}
          </label>

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>Uploading</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="font-name">Name</Label>
              <Input
                id="font-name"
                value={formState.name}
                onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family">Family</Label>
              <Input
                id="font-family"
                value={formState.family}
                onChange={(event) => setFormState((state) => ({ ...state, family: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-style">Style</Label>
              <Input
                id="font-style"
                value={formState.style}
                onChange={(event) => setFormState((state) => ({ ...state, style: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-weight">Weight</Label>
              <Input
                id="font-weight"
                type="number"
                value={formState.weight}
                onChange={(event) => setFormState((state) => ({ ...state, weight: Number(event.target.value) }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="font-foundry">Foundry</Label>
              <Input
                id="font-foundry"
                value={formState.foundry}
                onChange={(event) => setFormState((state) => ({ ...state, foundry: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-license">License</Label>
              <Input
                id="font-license"
                value={formState.license}
                onChange={(event) => setFormState((state) => ({ ...state, license: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-description">Description</Label>
            <Textarea
              id="font-description"
              value={formState.description}
              onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagName}
                    onChange={(event) => setTagName(event.target.value)}
                    placeholder="New tag"
                  />
                  <Button type="button" size="sm" onClick={quickCreateTag}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = selectedTags.includes(tag.slug);
                  return (
                    <Badge
                      key={tag.id}
                      variant={selected ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleSelection(tag.slug, selectedTags, setSelectedTags)}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Categories</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="New category"
                  />
                  <Button type="button" size="sm" onClick={quickCreateCategory}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const selected = selectedCategories.includes(category.slug);
                  return (
                    <Badge
                      key={category.id}
                      variant={selected ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleSelection(category.slug, selectedCategories, setSelectedCategories)}
                    >
                      {category.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              Possible duplicates detected: {duplicates.map((font) => font.name).join(", ")}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Save font
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
