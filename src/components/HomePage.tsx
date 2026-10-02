import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const mockUserGrowth = [
  { year: "2024", users: 120 },
  { year: "2025", users: 1480 },
  { year: "2026", users: 6840 },
];

export function HomePage({
  progress,
  resumeTopic,
}: {
  progress: number;
  resumeTopic?: { id: string; number: string; title: string };
}) {
  const root = useRef<HTMLDivElement>(null);
  const maxUsers = Math.max(...mockUserGrowth.map((item) => item.users));
  const chartPoints = mockUserGrowth
    .map((item, index) => {
      const x = 46 + (index / (mockUserGrowth.length - 1)) * 628;
      const y = 220 - (item.users / maxUsers) * 176;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const chartAreaPoints = `46,220 ${chartPoints} 674,220`;
  const growthMultiple = Math.round((mockUserGrowth.at(-1)!.users / mockUserGrowth[0].users) * 10) / 10;

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
                opacity: 1,
                filter: eco ? "blur(0px)" : "blur(8px)",
              },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                stagger: profile === "full" ? 0.075 : 0.045,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 88%",
                  end: "top 42%",
                  scrub: profile === "full" ? 0.48 : 0.32,
                  invalidateOnRefresh: false,
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
          <div className="project-hero-copy" data-parallax>
            <div className="eyebrow" data-reveal>VISUALMATH / ИНТЕРАКТИВНАЯ МАТЕМАТИКА</div>
            <h1 data-reveal>
              Не страница.
              <br />
              <span>Целая среда.</span>
            </h1>
            <p data-reveal>
              VisualMath соединяет теорию, навигацию, интерактив, персонализацию,
              историю действий и визуальные инструменты в один живой интерфейс.
              Здесь хочется не просто открыть тему — хочется исследовать сам проект.
            </p>

            <div className="home-actions" data-reveal>
              <button
                className="home-primary"
                onClick={() => (window.location.hash = resumeTopic?.id ?? "matrices")}
                title={resumeTopic?.title}
              >
                {resumeTopic ? "Продолжить § " + resumeTopic.number : "Начать"}
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
            <span>VM</span>
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


      <section className="home-panel project-activity-panel">
        <div className="home-panel-inner project-activity-layout">
          <div className="project-activity-copy">
            <div className="eyebrow" data-reveal>VISUALMATH GROWTH / DEMO DATA</div>
            <h2 data-reveal>Проект растёт вместе с сообществом.</h2>
            <p data-reveal>
              Здесь будет публичная динамика аудитории VisualMath: сколько пользователей
              присоединялось к платформе с запуска и как менялся масштаб проекта.
            </p>

            <div className="project-activity-stats" data-reveal>
              <article>
                <span>{mockUserGrowth[0].year}</span>
                <small>точка отсчёта</small>
              </article>
              <article>
                <span>{mockUserGrowth.at(-1)!.users.toLocaleString("ru-RU")}</span>
                <small>пользователей сейчас</small>
              </article>
              <article>
                <span>×{growthMultiple}</span>
                <small>рост аудитории</small>
              </article>
              <article>
                <span>{mockUserGrowth.length}</span>
                <small>лет на графике</small>
              </article>
            </div>
          </div>

          <div className="project-activity-chart" data-parallax data-reveal>
            <div className="activity-chart-head">
              <div>
                <span>ПОЛЬЗОВАТЕЛИ</span>
                <strong>Рост VisualMath по годам</strong>
              </div>
              <b>DEMO DATA</b>
            </div>

            <div className="activity-chart-plot">
              <svg viewBox="0 0 720 260" role="img" aria-label="Мок-график роста пользователей VisualMath">
                <defs>
                  <linearGradient id="userGrowthArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                  <filter id="userGrowthGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g className="activity-chart-grid">
                  <line x1="46" y1="44" x2="674" y2="44" />
                  <line x1="46" y1="88" x2="674" y2="88" />
                  <line x1="46" y1="132" x2="674" y2="132" />
                  <line x1="46" y1="176" x2="674" y2="176" />
                  <line x1="46" y1="220" x2="674" y2="220" />
                </g>

                <polygon className="activity-chart-area" points={chartAreaPoints} fill="url(#userGrowthArea)" />
                <polyline
                  className="activity-chart-line"
                  points={chartPoints}
                  filter="url(#userGrowthGlow)"
                />

                {mockUserGrowth.map((item, index) => {
                  const x = 46 + (index / (mockUserGrowth.length - 1)) * 628;
                  const y = 220 - (item.users / maxUsers) * 176;
                  return (
                    <g key={item.year} className="activity-growth-point">
                      <circle className="activity-chart-point" cx={x} cy={y} r="5" />
                      <text x={x} y={Math.max(24, y - 15)} textAnchor="middle">
                        {item.users.toLocaleString("ru-RU")}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="activity-chart-axis">
              {mockUserGrowth.map((item) => <span key={item.year}>{item.year}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="home-panel project-feature-panel">
        <div className="home-panel-inner project-split">
          <div className="project-feature-copy">
            <div className="eyebrow" data-reveal>DESIGNED AS A SYSTEM</div>
            <h2 data-reveal data-parallax>Интерфейс не разваливается на отдельные страницы.</h2>
            <p data-reveal>
              Карта, история переходов, сохранённые элементы, настройки, прогресс,
              интерактивные лаборатории и контент работают как части одного продукта.
              Любое действие ощущается связанным с предыдущим.
            </p>
          </div>

          <div className="project-window-stack" data-parallax>
            <article className="project-window window-a" data-float-safe="a">
              <span>01</span>
              <strong>Контекст сохраняется</strong>
              <p>Можно уйти глубже, вернуться назад и продолжить с того же места.</p>
            </article>
            <article className="project-window window-b" data-float-safe="b">
              <span>02</span>
              <strong>Интерфейс отвечает</strong>
              <p>Наведение, переходы, прокрутка и трансформации имеют собственный визуальный отклик.</p>
            </article>
            <article className="project-window window-c" data-float-safe="c">
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
            <div className="motion-chip chip-a" data-loop="float">ALGEBRA</div>
            <div className="motion-chip chip-b" data-loop="float">ANALYSIS</div>
            <div className="motion-chip chip-c" data-loop="float">GEOMETRY</div>
            <div className="motion-center" data-loop="pulse">MATH</div>
          </div>

          <div className="project-feature-copy">
            <div className="eyebrow" data-reveal>МАТЕМАТИКА В ДВИЖЕНИИ</div>
            <h2 data-reveal>Формулы превращаются в объекты, которые можно исследовать.</h2>
            <p data-reveal>
              Векторы, матрицы, графики и геометрические преобразования показываются не как
              статичные иллюстрации, а как связанные математические структуры. Можно менять
              параметры и сразу видеть, что именно происходит с объектом.
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
            <article data-reveal data-float-safe="guide">
              <span>01</span>
              <strong>Навигация</strong>
              <p>Разделы и темы находятся в боковой панели и раскрываются плавно.</p>
            </article>
            <article data-reveal data-float-safe="guide">
              <span>02</span>
              <strong>Карта</strong>
              <p>Отдельная рабочая сцена с группами, связями, перемещением, вращением и масштабом.</p>
            </article>
            <article data-reveal data-float-safe="guide">
              <span>03</span>
              <strong>История</strong>
              <p>Назад и вперёд работают как полноценная навигационная история с восстановлением позиции.</p>
            </article>
            <article data-reveal data-float-safe="guide">
              <span>04</span>
              <strong>Настройки</strong>
              <p>Темы, курсоры, движение и сохранённые элементы собраны в одном месте.</p>
            </article>
            <article data-reveal data-float-safe="guide">
              <span>05</span>
              <strong>Интерактив</strong>
              <p>Сложные вещи можно не только читать — ими можно управлять прямо в интерфейсе.</p>
            </article>
            <article data-reveal data-float-safe="guide">
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
            VisualMath задуман как пространство, которое хочется открыть ещё до того,
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
