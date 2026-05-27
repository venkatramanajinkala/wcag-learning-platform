export default function About() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">About</h1>
      <p className="text-sm font-medium leading-relaxed text-slate-600">
        A11yPlay is a learning platform for practicing WCAG success criteria through interactive examples, checklists,
        and repeatable audit workflows.
      </p>
      <p className="text-sm font-medium leading-relaxed text-slate-600">
        This instance is configured as a production-style app: protected routes, JWT-based sessions, password reset
        flows, and optional Google sign-in.
      </p>
    </div>
  );
}

