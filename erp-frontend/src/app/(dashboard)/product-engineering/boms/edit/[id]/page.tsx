"use client";
import { useParams } from "next/navigation";
import BOMForm from "../../BOMForm";

export default function EditBOMPage() {
  const params = useParams();
  const id = Number(params.id);

  return <BOMForm mode="edit" bomId={id} />;
}
