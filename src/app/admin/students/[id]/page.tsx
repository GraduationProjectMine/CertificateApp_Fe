"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { studentApi } from "@/features/students/services/student.api";

const emptyForm = { name: "", email: "", status: "ACTIVE", password: "" };

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    studentApi.get(id)
      .then((student) => setForm({
        name: student.student_fullName,
        email: student.email,
        status: student.status,
        password: "",
      }))
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải thông tin sinh viên"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...form, password: form.password || undefined };
      const response = await studentApi.update(id, payload);
      setForm((current) => ({ ...current, name: response.student.student_fullName, password: "" }));
      setSuccess("Đã cập nhật sinh viên.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật sinh viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-gray-400">Đang tải thông tin sinh viên...</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Chi tiết sinh viên</h1>
        <p className="mt-1 break-all text-xs text-gray-500">ID: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-gray-200/60 bg-white p-6 dark:border-gray-800/60 dark:bg-gray-900">
        <label className="block text-xs font-bold">Họ và tên
          <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">Email
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">Trạng thái
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
        <label className="block text-xs font-bold">Mật khẩu mới (không bắt buộc)
          <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/20">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600 dark:bg-green-950/20">{success}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          <button type="button" onClick={() => router.push("/admin/students")} className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-500 dark:bg-gray-800">Quay lại</button>
        </div>
      </form>
    </div>
  );
}
