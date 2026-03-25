"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import FormModal from "./FormModal";

const FormCtx = createContext<{ openForm: () => void }>({ openForm: () => {} });

export function useFormModal() {
  return useContext(FormCtx);
}

export function FormProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // Auto-open if ?form=true on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("form") === "true") {
      setOpen(true);
    }
  }, []);

  return (
    <FormCtx.Provider value={{ openForm: () => setOpen(true) }}>
      {children}
      <FormModal open={open} onClose={() => setOpen(false)} />
    </FormCtx.Provider>
  );
}
