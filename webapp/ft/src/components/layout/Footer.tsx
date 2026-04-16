import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { DualLogos } from "@/components/common/DualLogos";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-3">
        <div>
          <DualLogos nucesHeight={40} fssHeight={40} crossSize={20} />
          <h3 className="text-primary-foreground text-lg font-bold mt-3">FastTrack</h3>
          <p className="text-sm text-primary-foreground/70 mt-1">Official Sports Management System</p>
          <p className="text-xs text-primary-foreground/60 mt-2">FAST-NUCES Lahore × FSS</p>
        </div>
        <div>
          <h4 className="text-primary-foreground text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About</Link></li>
            <li><Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Login</Link></li>
            <li><Link to="/signup" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-primary-foreground text-sm font-semibold uppercase tracking-wider">Fast Lahore Sports Society</h4>
          <div className="flex gap-3 mt-3">
            <a href="https://www.instagram.com/fastsportssociety/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-fss-orange flex items-center justify-center text-white hover:opacity-90"><Instagram className="h-4 w-4" /></a>
            <a href="https://www.facebook.com/fastsportssociety/photos/?locale=ms_MY" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-fss-orange flex items-center justify-center text-white hover:opacity-90"><Facebook className="h-4 w-4" /></a>
            <a href="https://www.linkedin.com/company/fastsportssociety/posts/?feedView=all" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-fss-orange flex items-center justify-center text-white hover:opacity-90"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-primary-foreground/10 pt-4 text-center">
        <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} FastTrack — FAST-NUCES Lahore × Fast Lahore Sports Society. All rights reserved.</p>
      </div>
    </footer>
  );
}
