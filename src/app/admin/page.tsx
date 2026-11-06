import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Gamepad2, LogOut, Plus, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { hasSupabasePublicConfig } from "@/lib/config";
import { createActivity, createCategory, createVocabulary, deleteActivity, deleteVocabulary, logoutAdmin, updateCategory, updateVocabulary } from "@/app/admin/actions";

export const metadata = { title: "Dashboard Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!hasSupabasePublicConfig()) redirect("/admin/login");
  const { supabase, profile } = await requireAdmin();
  const [categoryResult, vocabularyResult, activityResult, attemptResult] = await Promise.all([
    supabase.from("categories").select("id, slug, title, description, emoji, color, sort_order, is_published").order("sort_order"),
    supabase.from("vocabulary").select("id, arabic, transliteration, meaning, image_emoji, sort_order, categories(title)").order("created_at", { ascending: false }).limit(100),
    supabase.from("activities").select("id, slug, title, is_published, categories(title)").order("created_at", { ascending: false }),
    supabase.from("attempts").select("id, score, max_score, correct_count, total_items, created_at, guest_sessions(display_name), activities(title)", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
  ]);

  const categories = categoryResult.data ?? [];
  const vocabulary = vocabularyResult.data ?? [];
  const activities = activityResult.data ?? [];
  const attempts = attemptResult.data ?? [];

  return (
    <section className="container admin-page">
      <div className="admin-heading">
        <div><div className="eyebrow"><ShieldCheck size={15} /> DASHBOARD PENGELOLA</div><h1>Halo, {profile.display_name}!</h1><p>Kelola konten Mufrodat Kids dari satu tempat.</p></div>
        <form action={logoutAdmin}><button className="button button-secondary" type="submit"><LogOut size={16} /> Keluar</button></form>
      </div>

      <div className="admin-stats">
        <div className="admin-stat"><span className="stat-icon stat-yellow"><BookOpen size={20} /></span><div><strong>{categories.length}</strong><small>Kategori materi</small></div></div>
        <div className="admin-stat"><span className="stat-icon stat-blue"><BookOpen size={20} /></span><div><strong>{vocabulary.length}</strong><small>Kosakata</small></div></div>
        <div className="admin-stat"><span className="stat-icon stat-pink"><Gamepad2 size={20} /></span><div><strong>{activities.length}</strong><small>Permainan</small></div></div>
        <div className="admin-stat"><span className="stat-icon stat-green"><Users size={20} /></span><div><strong>{attemptResult.count ?? attempts.length}</strong><small>Aktivitas belajar</small></div></div>
      </div>

      <div className="admin-content-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-step">01</span><h2>Tambah kategori</h2></div><Plus size={19} /></div>
          <form action={createCategory} className="admin-form">
            <label>Nama kategori<input name="title" placeholder="Contoh: Anggota Tubuh" required /></label>
            <label>Deskripsi<textarea name="description" rows={2} placeholder="Deskripsi singkat kategori" /></label>
            <div className="form-row"><label>Emoji<input name="emoji" defaultValue="📚" maxLength={8} /></label><label>Warna<select name="color" defaultValue="yellow"><option value="yellow">Kuning</option><option value="green">Hijau</option><option value="pink">Merah muda</option><option value="blue">Biru</option><option value="purple">Ungu</option></select></label></div>
            <button className="button button-primary" type="submit">Simpan kategori</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-step">02</span><h2>Tambah kosakata</h2></div><Plus size={19} /></div>
          {categories.length === 0 ? <p className="empty-inline">Buat kategori terlebih dahulu.</p> : (
            <form action={createVocabulary} className="admin-form">
              <label>Kategori<select name="category_id" required defaultValue=""><option value="" disabled>Pilih kategori</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.title}</option>)}</select></label>
              <label>Kosakata Arab<input name="arabic" dir="rtl" lang="ar" placeholder="كِتَابٌ" required /></label>
              <div className="form-row"><label>Transliterasi<input name="transliteration" placeholder="kitābun" required /></label><label>Arti Indonesia<input name="meaning" placeholder="Buku" required /></label></div>
              <label>Emoji gambar (jika belum upload)<input name="image_emoji" defaultValue="🧩" maxLength={8} /></label>
              <div className="form-row"><label>Gambar<input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label><label>Audio<input name="audio_file" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" /></label></div>
              <p className="field-help">Maksimal 10 MB per file. Gambar dan audio bersifat opsional.</p>
              <button className="button button-primary" type="submit">Simpan kosakata</button>
            </form>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-step">03</span><h2>Buat permainan</h2></div><Gamepad2 size={19} /></div>
          <form action={createActivity} className="admin-form">
            <label>Kategori permainan<select name="category_id" required defaultValue=""><option value="" disabled>Pilih kategori</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.title}</option>)}</select></label>
            <label>Judul permainan (opsional)<input name="title" placeholder="Pasangkan Peralatan Sekolah" /></label>
            <label>Deskripsi (opsional)<textarea name="description" rows={2} placeholder="Cocokkan gambar dengan kata Arab." /></label>
            <p className="field-help">Sistem otomatis memasukkan seluruh kosakata aktif dari kategori yang dipilih. Membuat ulang permainan akan memperbarui daftar soalnya.</p>
            <button className="button button-primary" type="submit">Buat / perbarui permainan</button>
          </form>
        </section>

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-heading"><div><span className="panel-step">04</span><h2>Kelola kategori</h2></div><BookOpen size={19} /></div>
          {categories.length === 0 ? <p className="empty-inline">Belum ada kategori.</p> : <div className="admin-edit-grid">{categories.map((category) => <details className="admin-edit-card" key={category.id}><summary><span>{category.emoji} {category.title}</span><small>Edit kategori</small></summary><form action={updateCategory} className="admin-form"><input type="hidden" name="id" value={category.id} /><label>Nama kategori<input name="title" defaultValue={category.title} required /></label><label>Deskripsi<textarea name="description" rows={2} defaultValue={category.description ?? ""} /></label><div className="form-row"><label>Emoji<input name="emoji" defaultValue={category.emoji} maxLength={8} /></label><label>Warna<select name="color" defaultValue={category.color}><option value="yellow">Kuning</option><option value="green">Hijau</option><option value="pink">Merah muda</option><option value="blue">Biru</option><option value="purple">Ungu</option></select></label></div><label>Urutan<input type="number" name="sort_order" defaultValue={category.sort_order} /></label><button className="button button-secondary" type="submit">Perbarui kategori</button></form></details>)}</div>}
        </section>

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-heading"><div><span className="panel-step">05</span><h2>Daftar materi</h2></div><BookOpen size={19} /></div>
          {vocabulary.length === 0 ? <p className="empty-inline">Belum ada kosakata.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Kosakata</th><th>Arti</th><th>Kategori</th><th>Aksi</th></tr></thead><tbody>{vocabulary.map((item) => <tr key={item.id}><td><strong className="admin-arabic" dir="rtl">{item.arabic}</strong></td><td>{item.meaning}</td><td>{(item.categories as { title?: string } | null)?.title ?? "-"}</td><td><div className="table-actions"><details className="inline-edit"><summary>Edit</summary><form action={updateVocabulary} className="admin-form"><input type="hidden" name="id" value={item.id} /><label>Arab<input name="arabic" dir="rtl" lang="ar" defaultValue={item.arabic} required /></label><label>Transliterasi<input name="transliteration" defaultValue={item.transliteration} required /></label><label>Arti<input name="meaning" defaultValue={item.meaning} required /></label><label>Emoji<input name="image_emoji" defaultValue={item.image_emoji} /></label><label>Ganti gambar<input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label><label>Ganti audio<input name="audio_file" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" /></label><label>Urutan<input name="sort_order" type="number" defaultValue={item.sort_order} /></label><button className="button button-secondary" type="submit">Simpan perubahan</button></form></details><form action={deleteVocabulary}><input type="hidden" name="id" value={item.id} /><button className="delete-button" type="submit">Hapus</button></form></div></td></tr>)}</tbody></table></div>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-step">06</span><h2>Permainan aktif</h2></div><Gamepad2 size={19} /></div>
          {activities.length === 0 ? <p className="empty-inline">Belum ada permainan.</p> : <div className="admin-list">{activities.map((activity) => <div className="admin-list-item" key={activity.id}><div><strong>{activity.title}</strong><small>{(activity.categories as { title?: string } | null)?.title ?? "Tanpa kategori"}</small><Link href={`/permainan/${activity.slug}`} target="_blank">Lihat permainan ↗</Link></div><form action={deleteActivity}><input type="hidden" name="id" value={activity.id} /><button className="delete-button" type="submit">Hapus</button></form></div>)}</div>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="panel-step">07</span><h2>Aktivitas terbaru</h2></div><Users size={19} /></div>
          {attempts.length === 0 ? <p className="empty-inline">Belum ada hasil permainan yang tersimpan.</p> : <div className="admin-list">{attempts.map((attempt) => <div className="admin-list-item" key={attempt.id}><div><strong>{(attempt.guest_sessions as { display_name?: string } | null)?.display_name ?? "Siswa"}</strong><small>{(attempt.activities as { title?: string } | null)?.title ?? "Permainan"}</small></div><span className="attempt-score">{attempt.score}/{attempt.max_score}</span></div>)}</div>}
        </section>
      </div>
      <p className="admin-footnote">Data siswa guest disimpan tanpa email. Gunakan nama panggilan dan hindari memasukkan informasi pribadi anak.</p>
    </section>
  );
}
