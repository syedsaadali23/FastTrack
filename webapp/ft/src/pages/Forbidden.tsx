import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <ShieldAlert className="h-12 w-12 text-destructive" />
      <p className="text-5xl font-extrabold text-primary mt-3">403</p>
      <h1 className="mt-1 text-2xl font-bold text-primary">Access denied</h1>
      <p className="mt-2 text-muted-foreground">You don't have permission to view this page.</p>
      <Link to="/dashboard" className="btn-primary-light mt-6">Go to dashboard</Link>
    </div>
  );
}
