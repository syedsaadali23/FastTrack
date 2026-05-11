import { AnimatePresence, motion } from "framer-motion";
import { DualLogos } from "./DualLogos";

export function SplashScreen({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5"
          >
            <DualLogos nucesHeight={56} fssHeight={64} crossSize={28} />
            <h1 className="text-3xl font-bold text-primary-foreground">FastTrack</h1>
            <div className="splash-spinner" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
