import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { chapters, topicList } from "../data/course";

gsap.registerPlugin(ScrollTrigger);

export function HomePage({ progress }: { progress: number }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".home-panel", element);
      if (!panels.length) return;

      const motionProfile = document.documentElement.dataset.motionProfile || "balanced";
      const mm = gsap.matchMedia();

      mm.add("(min-width: 821px)", () => {
        panels.forEach((panel, index) => {
          const content = panel.querySelectorAll<HTMLElement>("[data-reveal]");
          if (content.length) {
            gsap.fromTo(
              content,
              { y: motionProfile === "eco" ? 24 : 70, opacity: 0, filter: "blur(12px)" },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                stagger: motionProfile === "full" ? 0.08 : 0.045,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 68%",
                  end: "center 46%",
                  scrub: motionProfile === "full" ? 0.65 : 0.35,
                },
              },
            );
          }

          const floaters = panel.querySelectorAll<HTMLElement>("[data-float]");
          if (floaters.length) {
            gsap.to(floaters, {
              yPercent: index % 2 ? -18 : 18,
              rotate: index % 2 ? 12 : -12,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            });
          }
        });

        ScrollTrigger.create({
          trigger: element,
          start: "top top",
          end: "bottom bottom",
          snap: {
            snapTo: 1 / Math.max(1, panels.length - 1),
            duration: { min: 0.22, max: 0.7 },
            delay: 0.07,
            ease: "power2.inOut",
          },
        });
      });

      mm.add("(max-width: 820px)", () => {
        panels.forEach((panel) => {
          const content = panel.querySelectorAll<HTMLElement>("[data-reveal]");
          if (!content.length) return;
          gsap.fromTo(
            content,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.035,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 84%",
                once: true,
              },
            },
          );
        });
      });

      return () => mm.revert();
    }, element);

    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page home-scrollytelling" ref={root}>
      <section className="home-panel home-panel-hero">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="hero-floating-equations" aria-hidden="true">
          <span data-float>det A</span>
          <span data-float>Ax=b</span>
          <span data-float>rank A</span>
          <span data-float>ℝ³</span>
        </div>

        <div className="home-panel-inner">
          <div className="home-hero-copy">
            <div className="eyebrow" data-reveal>FSOCIETYMATH / ADVANCED KNOWLEDGE SYSTEM</div>
            <h1 data-reveal>
              Математика,
              <br />
              <span>которая связана.</span>
            </h1>
            <p data-reveal>
              Не бесконечный список параграфов. Определения ведут к свойствам, свойства —
              к доказательствам, доказательства — к теоремам, а практика проверяет, понял ли
              ты это на самом деле.
            </p>
            <div className="home-actions" data-reveal>
              <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
                Войти в линейную алгебру
              </button>
              <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
                Открыть карту
              </button>
            </div>
          </div>

          <div className="hero-object" data-float aria-hidden="true">
            <div className="hero-matrix-shell">
              <span>[</span>
              <div>
                <b>1</b><b>0</b><b>0</b>
                <b>0</b><b>1</b><b>0</b>
                <b>0</b><b>0</b><b>1</b>
              </div>
              <span>]</span>
            </div>
            <div className="hero-axis axis-x" />
            <div className="hero-axis axis-y" />
            <div className="hero-axis axis-z" />
          </div>

          <div className="home-stats" data-reveal>
            <div><strong>{chapters.length}</strong><span>глав в архитектуре</span></div>
            <div><strong>{topicList.length}</strong><span>узлов знаний</span></div>
            <div><strong>{progress}%</strong><span>линейной алгебры</span></div>
          </div>
        </div>

        <div className="home-snap-cue">
          <span>SCROLL</span>
          <i />
          <small>страница притягивается к следующей сцене</small>
        </div>
      </section>

      <section className="home-panel home-panel-graph">
        <div className="home-panel-inner split-layout">
          <div className="home-scene-number" data-float>01</div>
          <div className="home-story-copy">
            <div className="eyebrow" data-reveal>KNOWLEDGE GRAPH</div>
            <h2 data-reveal>Тема знает, от каких тем она зависит.</h2>
            <p data-reveal>
              Матрицы ведут к определителям. Определители — к обратимости. Ранг — к структуре
              решений систем. Карта сохраняет эти связи даже когда ты двигаешь и вращаешь узлы.
            </p>
            <button data-reveal className="home-text-link" onClick={() => (window.location.hash = "map")}>
              Исследовать граф →
            </button>
          </div>

          <div className="home-fake-graph" data-float aria-hidden="true">
            <div className="fake-node n1">Матрицы</div>
            <div className="fake-node n2">det</div>
            <div className="fake-node n3">rank</div>
            <div className="fake-node n4">Ax=b</div>
            <svg viewBox="0 0 600 440">
              <path d="M118 116 C210 116 232 198 305 198" />
              <path d="M305 198 C380 198 392 114 490 114" />
              <path d="M305 198 C360 250 395 330 490 330" />
            </svg>
          </div>
        </div>
      </section>

      <section className="home-panel home-panel-proof">
        <div className="home-panel-inner proof-layout">
          <div className="proof-stack" data-float>
            <article>
              <span>СВОЙСТВО 2</span>
              <strong>Rᵢ ↔ Rⱼ ⇒ det A меняет знак</strong>
            </article>
            <article>
              <span>СВОЙСТВО 3</span>
              <strong>Два одинаковых ряда ⇒ det A = 0</strong>
              <small>следует из свойства 2</small>
            </article>
            <article>
              <span>ТЕОРЕМА 3.1</span>
              <strong>A⁻¹ = adj(A) / det A</strong>
              <small>использует свойства 7 и 8</small>
            </article>
          </div>

          <div className="home-story-copy">
            <div className="eyebrow" data-reveal>PROOFS, NOT FLASHCARDS</div>
            <h2 data-reveal>Не запоминай утверждение отдельно от причины.</h2>
            <p data-reveal>
              У каждого доказательства есть контекст. На странице видно, какие определения,
              свойства и предыдущие теоремы реально используются дальше.
            </p>
          </div>
        </div>
      </section>

      <section className="home-panel home-panel-visual">
        <div className="home-panel-inner visual-layout">
          <div className="home-story-copy">
            <div className="eyebrow" data-reveal>SEE THE TRANSFORMATION</div>
            <h2 data-reveal>Если объект геометрический — его надо увидеть.</h2>
            <p data-reveal>
              Матрица 3×3 действует на всё ℝ³. Меняй масштаб, shear, поворот, отражение и
              схлопывание одновременно; следи за det(A), rank(A) и образами базисных векторов.
            </p>
            <button data-reveal className="home-text-link" onClick={() => (window.location.hash = "matrices")}>
              Открыть 3D-лабораторию →
            </button>
          </div>

          <div className="visual-cube" data-float aria-hidden="true">
            <i className="cube-face face-a" />
            <i className="cube-face face-b" />
            <i className="cube-face face-c" />
            <span className="cube-label">A : ℝ³ → ℝ³</span>
          </div>
        </div>
      </section>

      <section className="home-panel home-panel-progress">
        <div className="home-panel-inner progress-layout">
          <div className="home-progress-orbit" data-float>
            <div>
              <strong>{progress}%</strong>
              <span>LINEAR ALGEBRA</span>
            </div>
          </div>

          <div className="home-story-copy">
            <div className="eyebrow" data-reveal>READ ≠ MASTERED</div>
            <h2 data-reveal>Теория даёт 50%. Практика закрывает тему.</h2>
            <p data-reveal>
              Дочитал теорию — система это видит. Но 100% появляется только после решения
              задач. Никакой кнопки «я всё понял» больше нет.
            </p>
            <div className="home-progress-legend" data-reveal>
              <span><i /> теория · 50%</span>
              <span><i /> практика · 50%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-panel home-panel-final">
        <div className="home-panel-inner final-inner">
          <div className="eyebrow" data-reveal>START WITH THE FIRST STRUCTURE</div>
          <h2 data-reveal>
            Начни с таблицы чисел.
            <br />
            Дойди до пространства.
          </h2>
          <p data-reveal>
            Матрицы → определители → обратимость → ранг → системы линейных уравнений.
          </p>
          <div className="home-actions" data-reveal>
            <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
              § 1 · Матрицы
            </button>
            <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
              Карта курса
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
