import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function HomePage({ progress }: { progress: number }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const profile = document.documentElement.dataset.motionProfile || "balanced";
      if (profile === "off") return;

      const panels = gsap.utils.toArray<HTMLElement>(".home-panel", element);
      const mobile = window.matchMedia("(max-width: 820px)").matches;
      const eco = profile === "eco";

      const mm = gsap.matchMedia();

      if (!mobile) {
        panels.forEach((panel, index) => {
          const reveal = panel.querySelectorAll<HTMLElement>("[data-reveal]");
          if (reveal.length) {
            gsap.fromTo(
              reveal,
              {
                y: eco ? 24 : 64,
                opacity: 0,
                filter: eco ? "blur(0px)" : "blur(10px)",
              },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                stagger: profile === "full" ? 0.075 : 0.045,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 72%",
                  end: "center 48%",
                  scrub: profile === "full" ? 0.58 : 0.34,
                },
              },
            );
          }

          const parallax = panel.querySelectorAll<HTMLElement>("[data-parallax]");
          if (parallax.length) {
            gsap.to(parallax, {
              yPercent: index % 2 ? -14 : 14,
              rotate: index % 2 ? 5 : -5,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.75,
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
            duration: { min: 0.22, max: 0.68 },
            delay: 0.08,
            ease: "power2.inOut",
          },
        });
      } else {
        panels.forEach((panel) => {
          const reveal = panel.querySelectorAll<HTMLElement>("[data-reveal]");
          if (!reveal.length) return;
          gsap.fromTo(
            reveal,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.03,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 86%",
                once: true,
              },
            },
          );
        });
      }

      if (!eco) {
        gsap.utils.toArray<HTMLElement>("[data-loop='float']", element).forEach((node, index) => {
          gsap.to(node, {
            y: index % 2 ? -10 : 10,
            x: index % 3 === 0 ? 5 : -4,
            rotate: index % 2 ? 1.2 : -1.2,
            duration: 2.8 + (index % 4) * 0.55,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-loop='pulse']", element).forEach((node, index) => {
          gsap.to(node, {
            scale: 1.035,
            opacity: 0.82,
            duration: 2.2 + index * 0.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-loop='drift']", element).forEach((node, index) => {
          gsap.to(node, {
            rotate: index % 2 ? 360 : -360,
            duration: 26 + index * 5,
            ease: "none",
            repeat: -1,
          });
        });
      }

      return () => mm.revert();
    }, element);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="home-page home-scrollytelling home-project-showcase" ref={root}>
      <section className="home-panel project-hero">
        <div className="project-grid" aria-hidden="true" />
        <div className="project-ambient ambient-a" data-loop="drift" aria-hidden="true" />
        <div className="project-ambient ambient-b" data-loop="drift" aria-hidden="true" />
        <div className="project-ambient ambient-c" data-loop="pulse" aria-hidden="true" />

        <div className="home-panel-inner project-hero-inner">
          <div className="project-hero-copy">
            <div className="eyebrow" data-reveal>FSOCIETYMATH / INTERACTIVE LEARNING ENVIRONMENT</div>
            <h1 data-reveal>
              Не страница.
              <br />
              <span>Целая среда.</span>
            </h1>
            <p data-reveal>
              FsocietyMath соединяет контент, навигацию, интерактив, персонализацию,
              историю действий и визуальные инструменты в один живой интерфейс.
              Здесь хочется не просто открыть тему — хочется исследовать сам проект.
            </p>

            <div className="home-actions" data-reveal>
              <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
                Начать
              </button>
              <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
                Исследовать интерфейс
              </button>
            </div>
          </div>

          <div className="project-core" data-parallax data-loop="float" aria-hidden="true">
            <div className="project-core-ring ring-1" />
            <div className="project-core-ring ring-2" />
            <div className="project-core-ring ring-3" />
            <div className="project-core-grid">
              <i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
            <span>FS</span>
          </div>

          <div className="project-pulse" data-reveal>
            <span>{progress}%</span>
            <small>COURSE MASTERY</small>
            <i><b /></i>
          </div>
        </div>

        <div className="home-snap-cue">
          <span>SCROLL</span>
          <i />
          <small>каждый экран — отдельная сцена</small>
        </div>
      </section>

      <section className="home-panel project-feature-panel">
        <div className="home-panel-inner project-split">
          <div className="project-feature-copy">
            <div className="eyebrow" data-reveal>DESIGNED AS A SYSTEM</div>
            <h2 data-reveal>Интерфейс не разваливается на отдельные страницы.</h2>
            <p data-reveal>
              Карта, история переходов, сохранённые элементы, настройки, прогресс,
              интерактивные лаборатории и контент работают как части одного продукта.
              Любое действие ощущается связанным с предыдущим.
            </p>
          </div>

          <div className="project-window-stack" data-parallax>
            <article className="project-window window-a" data-loop="float">
              <span>01</span>
              <strong>Контекст сохраняется</strong>
              <p>Можно уйти глубже, вернуться назад и продолжить с того же места.</p>
            </article>
            <article className="project-window window-b" data-loop="float">
              <span>02</span>
              <strong>Интерфейс отвечает</strong>
              <p>Наведение, переходы, прокрутка и трансформации имеют собственный визуальный отклик.</p>
            </article>
            <article className="project-window window-c" data-loop="float">
              <span>03</span>
              <strong>Всё персонализируется</strong>
              <p>Тема, курсор и интенсивность движения настраиваются под пользователя.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-panel project-motion-panel">
        <div className="home-panel-inner project-motion-layout">
          <div className="project-motion-object" data-parallax aria-hidden="true">
            <div className="motion-orbit orbit-a" data-loop="drift" />
            <div className="motion-orbit orbit-b" data-loop="drift" />
            <div className="motion-orbit orbit-c" data-loop="drift" />
            <div className="motion-chip chip-a" data-loop="float">GSAP</div>
            <div className="motion-chip chip-b" data-loop="float">MOTION</div>
            <div className="motion-chip chip-c" data-loop="float">THREE</div>
            <div className="motion-center" data-loop="pulse">LIVE</div>
          </div>

          <div className="project-feature-copy">
            <div className="eyebrow" data-reveal>MOTION WITH A PURPOSE</div>
            <h2 data-reveal>Движение встроено в характер проекта.</h2>
            <p data-reveal>
              Большая часть сцены живёт постоянно: панели слегка плавают, слои вращаются,
              акценты пульсируют, а прокрутка захватывается в последовательность сцен.
              На телефоне тяжёлые эффекты упрощаются, но визуальный язык сохраняется.
            </p>
          </div>
        </div>
      </section>

      <section className="home-panel project-guide-panel">
        <div className="home-panel-inner project-guide-layout">
          <header className="project-guide-head">
            <div className="eyebrow" data-reveal>WHERE EVERYTHING LIVES</div>
            <h2 data-reveal>Один экран — одна роль. Никакой охоты за функциями.</h2>
            <p data-reveal>
              Основные возможности разнесены по понятным зонам, поэтому даже насыщенный
              интерфейс остаётся предсказуемым.
            </p>
          </header>

          <div className="project-guide-grid">
            <article data-reveal data-loop="float">
              <span>01</span>
              <strong>Навигация</strong>
              <p>Разделы и темы находятся в боковой панели и раскрываются плавно.</p>
            </article>
            <article data-reveal data-loop="float">
              <span>02</span>
              <strong>Карта</strong>
              <p>Отдельная рабочая сцена с группами, связями, перемещением, вращением и масштабом.</p>
            </article>
            <article data-reveal data-loop="float">
              <span>03</span>
              <strong>История</strong>
              <p>Назад и вперёд работают как полноценная навигационная история с восстановлением позиции.</p>
            </article>
            <article data-reveal data-loop="float">
              <span>04</span>
              <strong>Настройки</strong>
              <p>Темы, курсоры, движение и сохранённые элементы собраны в одном месте.</p>
            </article>
            <article data-reveal data-loop="float">
              <span>05</span>
              <strong>Интерактив</strong>
              <p>Сложные вещи можно не только читать — ими можно управлять прямо в интерфейсе.</p>
            </article>
            <article data-reveal data-loop="float">
              <span>06</span>
              <strong>Адаптив</strong>
              <p>Desktop получает максимум пространства и движения, mobile — тот же характер без развала layout.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-panel project-personal-panel">
        <div className="home-panel-inner project-personal-layout">
          <div className="project-feature-copy">
            <div className="eyebrow" data-reveal>YOUR VERSION OF THE PROJECT</div>
            <h2 data-reveal>Один продукт может выглядеть совершенно по-разному.</h2>
            <p data-reveal>
              Система тем меняет весь визуальный язык. Система курсоров меняет само ощущение
              управления. Профили движения позволяют оставить максимум эффектов или получить
              полностью статичный интерфейс.
            </p>
          </div>

          <div className="project-theme-showcase" data-parallax>
            <div className="theme-orb orb-black" data-loop="float"><span>BLACK</span></div>
            <div className="theme-orb orb-latte" data-loop="float"><span>LATTE</span></div>
            <div className="theme-orb orb-night" data-loop="float"><span>NIGHT</span></div>
            <div className="theme-orb orb-custom" data-loop="float"><span>CUSTOM</span></div>
          </div>
        </div>
      </section>

      <section className="home-panel project-final-panel">
        <div className="home-panel-inner project-final-inner">
          <div className="project-final-halo" data-loop="pulse" aria-hidden="true" />
          <div className="eyebrow" data-reveal>OPEN THE SYSTEM</div>
          <h2 data-reveal>
            Смотри.
            <br />
            Крути.
            <br />
            Исследуй.
          </h2>
          <p data-reveal>
            FsocietyMath задуман как продукт, который хочется открыть ещё до того,
            как ты решил, что именно собираешься изучать.
          </p>
          <div className="home-actions" data-reveal>
            <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
              Начать
            </button>
            <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
              Открыть карту
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
