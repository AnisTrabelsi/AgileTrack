export default function ProjectCard({ name, repo, env }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-1">{name}</h3>
      <p className="text-sm text-gray-500">{repo}</p>
      <span className="mt-2 inline-block bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded">
        {env}
      </span>
    </div>
  );
}
