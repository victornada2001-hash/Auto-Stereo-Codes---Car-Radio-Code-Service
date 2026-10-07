"use client";

import { useEffect } from "react";

function findFirstRaffleImage() {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("main img"));
  return images.find(image => image.complete && image.naturalWidth > 400)?.src || images[0]?.src || "";
}

export default function ExperienceEffects() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("main > section.relative.overflow-hidden");
    if (!hero) return;

    const applyHeroImage = () => {
      const src = findFirstRaffleImage();
      if (src) hero.style.setProperty("--sj-hero-image", `url(\"${src.replace(/\"/g, "%22")}\")`);
    };

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
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main section > div, main [class*='rounded-2xl'], main [class*='rounded-3xl']",
      ),
    ).filter(element => !element.closest('[role="dialog"]'));

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

  return null;
}
