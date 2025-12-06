"use client";
import { useParams } from "next/navigation";
import BOMForm from "../../BOMForm";

export default function ViewBOMPage() {
  const params = useParams();
  const id = Number(params.id);

  return <BOMForm mode="view" bomId={id} />;
}
