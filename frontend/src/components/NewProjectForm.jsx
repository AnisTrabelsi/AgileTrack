/* src/components/NewProjectForm.jsx */
import { useState } from "react";

export default function NewProjectForm({ onCreate, onCancel }) {
  const [form, setForm] = useState({ name: "", repo: "", env: "dev" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 rounded-xl bg-neutral-800 space-y-2 w-full max-w-md"
    >
      <h3 className="font-semibold">Nouveau projet</h3>

      <input
        type="text"
        name="name"
        placeholder="Nom du projet"
        className="input w-full"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        type="url"
        name="repo"
        placeholder="URL du dépôt Git"
        className="input w-full"
        value={form.repo}
        onChange={handleChange}
      />

      <select
        name="env"
        className="input w-full"
        value={form.env}
        onChange={handleChange}
      >
        <option value="dev">dev</option>
        <option value="staging">staging</option>
        <option value="prod">prod</option>
      </select>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn-primary">
          Créer
        </button>
      </div>
    </form>
  );
}
