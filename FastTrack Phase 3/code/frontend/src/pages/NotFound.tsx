import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold text-primary">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn-primary-light mt-6">Go home</Link>
    </div>
  );
}
