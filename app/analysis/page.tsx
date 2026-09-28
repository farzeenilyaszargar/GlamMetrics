import Studio from "@/components/studio";
import { occasions } from "@/lib/catalog";
export default async function Analysis({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const { occasion } = await searchParams;
  return (
    <Studio
      initialOccasion={
        occasion && occasions.some((o) => o === occasion)
          ? occasion
          : "Everyday"
      }
    />
  );
}
