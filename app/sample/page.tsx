import Report from "@/components/style-report";
import { sampleReport } from "@/lib/report";
export default function Sample() {
  return (
    <main id="main" className="wrap page-space">
      <Report report={sampleReport} sample occasion="Wedding guest" />
    </main>
  );
}
