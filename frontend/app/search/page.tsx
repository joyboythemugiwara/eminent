import Navbar from "@/components/Navbar";
import { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Study Materials",
  description: "Quickly find the specific study notes, subjects, or chapters you need using our advanced library search.",
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Navbar />
      <SearchClient />
    </main>
  );
}
