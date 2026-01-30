import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { parksApi, Park, ParkUpdate } from "@/lib/api/parks";

const parkTypeOptions = [
  { value: "camping", label: "Camping" },
  { value: "vakantiepark", label: "Vakantiepark" },
  { value: "bungalowpark", label: "Bungalowpark" },
  { value: "glamping", label: "Glamping" },
  { value: "resort", label: "Resort" },
];

interface ParkEditDialogProps {
  park: Park | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const ParkEditDialog = ({
  park,
  open,
  onOpenChange,
  onSave,
}: ParkEditDialogProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ParkUpdate>({});

  useEffect(() => {
    if (park) {
      setFormData({
        name: park.name,
        description: park.description || "",
        address: park.address || "",
        city: park.city || "",
        province: park.province || "",
        postal_code: park.postal_code || "",
        park_type: park.park_type,
        website: park.website || "",
        phone: park.phone || "",
        facilities: park.facilities || [],
      });
    }
  }, [park]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!park) return;

    setIsSaving(true);
    try {
      await parksApi.update(park.id, formData);
      toast({ title: "Park bijgewerkt" });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof ParkUpdate,
    value: string | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!park) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Park bewerken</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="park_type">Type</Label>
              <Select
                value={formData.park_type || ""}
                onValueChange={(value) => handleChange("park_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  {parkTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postcode</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={(e) => handleChange("postal_code", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="city">Plaats</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="province">Provincie</Label>
              <Input
                id="province"
                value={formData.province || ""}
                onChange={(e) => handleChange("province", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="facilities">
                Faciliteiten (komma gescheiden)
              </Label>
              <Input
                id="facilities"
                value={(formData.facilities || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "facilities",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="Zwembad, Restaurant, WiFi, Speeltuin..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
