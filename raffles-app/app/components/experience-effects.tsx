"use client";

import { useEffect, useRef, useState } from "react";

type MachinePhase = "spinning" | "result" | "error";

function normalizeText(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function isLuckMachineButton(button: HTMLButtonElement) {
  let node: HTMLElement | null = button;
  for (let depth = 0; depth < 7 && node; depth += 1) {
    if (normalizeText(node.textContent).includes("máquina de la suerte")) return true;
    node = node.parentElement;
  }
  return false;
}

function readSelectedTickets() {
  const heading = Array.from(document.querySelectorAll("h2")).find(
    element => normalizeText(element.textContent) === "tus números",
  );
  const card = heading?.parentElement?.parentElement;
  if (!card) return [];

  return Array.from(card.querySelectorAll("button"))
    .map(button => button.textContent?.match(/\d+/)?.[0] || "")
    .filter(Boolean);
}

function findFirstRaffleImage() {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("main img"));
  return images.find(image => image.complete && image.naturalWidth > 400)?.src || images[0]?.src || "";
}

export default function ExperienceEffects() {
  const [machineOpen, setMachineOpen] = useState(false);
  const [phase, setPhase] = useState<MachinePhase>("spinning");
  const [tickets, setTickets] = useState<string[]>([]);
  const [requestedQty, setRequestedQty] = useState(0);
  const activeButton = useRef<HTMLButtonElement | null>(null);
  const machineTimer = useRef<number | null>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("main > section.relative.overflow-hidden");

    const applyHeroImage = () => {
      if (!hero) return;
      const src = findFirstRaffleImage();
      if (src) hero.style.setProperty("--sj-hero-image", `url(\"${src.replace(/\"/g, "%22")}\")`);
    };

    if (hero) {
      hero.classList.add("sj-parallax-hero");
      const onScroll = () => {
        const amount = Math.min(window.scrollY * 0.18, 120);
        hero.style.setProperty("--sj-parallax-y", `${amount}px`);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      const imageObserver = new MutationObserver(applyHeroImage);
      imageObserver.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(applyHeroImage, 150);
      window.setTimeout(applyHeroImage, 900);

      return () => {
        window.removeEventListener("scroll", onScroll);
        imageObserver.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main section > div, main [class*='rounded-2xl'], main [class*='rounded-3xl']",
      ),
    ).filter(element => !element.closest("[data-sj-machine-modal]"));

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("sj-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((element, index) => {
      element.classList.add("sj-reveal");
      element.style.setProperty("--sj-delay", `${Math.min(index % 5, 4) * 55}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!window.location.pathname.startsWith("/rifa/")) return;

    const installRegenerateButton = () => {
      const continueButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
        button => normalizeText(button.textContent) === "continuar con estos boletos",
      );
      if (!continueButton) return;

      const dialog = continueButton.closest<HTMLElement>('[role="dialog"]');
      if (!dialog || dialog.querySelector("[data-sj-regenerate-native]")) return;

      const match = dialog.textContent?.match(/(\d+)\s+boleto(?:\(s\)|s)?\s+encontrados/i);
      const quantity = Number(match?.[1] || 0);
      const regenerateButton = document.createElement("button");
      regenerateButton.type = "button";
      regenerateButton.dataset.sjRegenerateNative = "1";
      regenerateButton.textContent = quantity > 0 ? `Generar otros ${quantity} boletos` : "Generar otros boletos";
      regenerateButton.style.width = "100%";
      regenerateButton.style.marginTop = "12px";
      regenerateButton.style.padding = "14px 20px";
      regenerateButton.style.borderRadius = "12px";
      regenerateButton.style.border = "2px solid #d4af37";
      regenerateButton.style.background = "#fff8dc";
      regenerateButton.style.color = "#081b33";
      regenerateButton.style.fontWeight = "900";
      regenerateButton.style.textTransform = "uppercase";
      regenerateButton.style.cursor = "pointer";

      regenerateButton.addEventListener("click", () => {
        regenerateButton.disabled = true;
        regenerateButton.textContent = "Generando…";

        const closeButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find(
          button => normalizeText(button.textContent) === "×",
        );
        closeButton?.click();

        window.setTimeout(() => {
          const pageMachineButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
            button => !button.closest('[role="dialog"]') && normalizeText(button.textContent) === "máquina de la suerte",
          );
          pageMachineButton?.click();

          window.setTimeout(() => {
            const generateButton = Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
              button => button.closest('[role="dialog"]') && normalizeText(button.textContent) === "generar boletos",
            );
            generateButton?.click();
          }, 140);
        }, 90);
      });

      continueButton.parentElement?.insertBefore(regenerateButton, continueButton);
    };

    installRegenerateButton();
    const observer = new MutationObserver(installRegenerateButton);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (window.location.pathname.startsWith("/rifa/")) return;

      const target = event.target as HTMLElement | null;
      const button = target?.closest("button") as HTMLButtonElement | null;
      if (!button || button.disabled || !isLuckMachineButton(button)) return;
      if (!normalizeText(button.textContent).includes("generar")) return;

      const card = button.closest("div.rounded-3xl") || button.parentElement?.parentElement?.parentElement;
      const quantityInput = card?.querySelector<HTMLInputElement>('input[type="number"]');
      setRequestedQty(Math.max(1, Number(quantityInput?.value || 1)));
      activeButton.current = button;
      setTickets([]);
      setPhase("spinning");
      setMachineOpen(true);

      const minimumSpin = 1700 + Math.floor(Math.random() * 1100);
      const startedAt = performance.now();

      const checkResult = () => {
        const elapsed = performance.now() - startedAt;
        const stillBusy = normalizeText(activeButton.current?.textContent).includes("generando");
        const currentTickets = readSelectedTickets();

        if (elapsed >= minimumSpin && !stillBusy) {
          if (currentTickets.length) {
            setTickets(currentTickets);
            setPhase("result");
          } else {
            setPhase("error");
          }
          return;
        }

        if (elapsed > 7000) {
          if (currentTickets.length) {
            setTickets(currentTickets);
            setPhase("result");
          } else {
            setPhase("error");
          }
          return;
        }

        machineTimer.current = window.setTimeout(checkResult, 120);
      };

      machineTimer.current = window.setTimeout(checkResult, 250);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (machineTimer.current) window.clearTimeout(machineTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!machineOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase !== "spinning") setMachineOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [machineOpen, phase]);

  if (!machineOpen) return null;

  const visibleTickets = tickets.slice(0, 80);
  const extraTickets = Math.max(0, tickets.length - visibleTickets.length);

  return (
    <div
      data-sj-machine-modal
      className="sj-machine-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Máquina de la Suerte"
      onMouseDown={event => {
        if (event.target === event.currentTarget && phase !== "spinning") setMachineOpen(false);
      }}
    >
      <div className="sj-machine-shell">
        <div className="sj-machine-lights" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
        </div>

        <div className="sj-machine-topline">SORTEOS JUNIOR</div>
        <h2 className="sj-machine-title">Máquina de la Suerte</h2>
        <p className="sj-machine-copy">
          {phase === "spinning"
            ? `Buscando ${requestedQty.toLocaleString("es-MX")} boleto${requestedQty === 1 ? "" : "s"} disponible${requestedQty === 1 ? "" : "s"}…`
            : phase === "result"
              ? "¡Listo! Estos son tus números de la suerte."
              : "No pudimos mostrar números en este intento."}
        </p>

        {phase === "spinning" ? (
          <div className="sj-slot-stage">
            <div className="sj-reels" aria-hidden="true">
              {[0, 1, 2].map(reel => (
                <div className="sj-reel-window" key={reel}>
                  <div className={`sj-reel-strip sj-reel-strip-${reel + 1}`}>
                    {[7, 2, 9, 4, 1, 8, 3, 6, 0, 5, 7, 2, 9].map((digit, index) => <span key={`${reel}-${index}`}>{digit}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="sj-machine-lever" aria-hidden="true"><span /><b /></div>
            <div className="sj-machine-status"><span className="sj-pulse-dot" /> Girando…</div>
          </div>
        ) : phase === "result" ? (
          <div className="sj-result-screen">
            <div className="sj-result-label">Tus boletos</div>
            <div className="sj-ticket-grid">
              {visibleTickets.map((ticket, index) => <span key={`${ticket}-${index}`}>{ticket}</span>)}
            </div>
            {extraTickets > 0 && <div className="sj-more-tickets">+ {extraTickets.toLocaleString("es-MX")} boletos más seleccionados</div>}
          </div>
        ) : (
          <div className="sj-result-screen sj-result-error">
            Revisa el mensaje del sorteo e inténtalo de nuevo.
          </div>
        )}

        {phase !== "spinning" && (
          <button type="button" className="sj-machine-close" onClick={() => setMachineOpen(false)}>
            {phase === "result" ? "Usar estos boletos" : "Cerrar"}
          </button>
        )}
      </div>
    </div>
  );
}