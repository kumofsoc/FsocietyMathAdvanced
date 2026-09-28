import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { chapters, topicList } from "../data/course";

export function HomePage({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [1, 1.25, 0.82]);

  return (
    <div className="home-page" ref={ref}>
      <section className="home-hero home-section">
        <div className="home-orbit-field" aria-hidden="true">
          <motion.div className="home-glyph glyph-a" style={{ rotate, scale }}>∫</motion.div>
          <motion.div className="home-glyph glyph-b" style={{ y }}>Σ</motion.div>
          <motion.div className="home-glyph glyph-c" style={{ rotate }}>∇</motion.div>
        </div>

        <div className="home-hero-copy">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            FSOCIETYMATH / ADVANCED KNOWLEDGE SYSTEM
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Не список тем.
            <br />
            <span>Карта математики.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
          >
            Теоремы связаны с тем, из чего они следуют. Формулы не висят в воздухе.
            Практика проверяет, действительно ли ты понял материал. 3D и графики появляются
            там, где геометрию полезнее увидеть, чем перечитать ещё один абзац.
          </motion.p>

          <motion.div
            className="home-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
              Начать курс
            </button>
            <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
              Открыть карту знаний
            </button>
          </motion.div>
        </div>

        <div className="home-stats">
          <div><strong>{chapters.length}</strong><span>глав</span></div>
          <div><strong>{topicList.length}</strong><span>тем</span></div>
          <div><strong>{progress}%</strong><span>реального прогресса</span></div>
        </div>

        <div className="home-scroll-cue">
          <span>SCROLL TO DESCEND</span>
          <i />
        </div>
      </section>

      <section className="home-section home-manifesto">
        <motion.div
          className="manifesto-number"
          initial={{ opacity: 0, scale: 0.82 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ amount: 0.4 }}
        >
          01
        </motion.div>
        <motion.div
          className="manifesto-copy"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.35 }}
          transition={{ duration: 0.75 }}
        >
          <div className="eyebrow">THEORY IS A GRAPH, NOT A PDF</div>
          <h2>Каждое новое утверждение должно знать, откуда оно взялось.</h2>
          <p>
            Определение → свойства → доказательство → следствие → пример → задача. Если теорема
            использует предыдущие свойства, это видно прямо в структуре урока. Если тема зависит
            от другой — это видно на карте курса.
          </p>
        </motion.div>
      </section>

      <section className="home-section home-layers">
        <motion.div
          className="layer-stack"
          initial={{ opacity: 0, rotateX: 18, y: 80 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ amount: 0.35 }}
          transition={{ duration: 0.8 }}
        >
          <div><span>THEORY</span><strong>50%</strong><p>Прочитал тему до конца — теория отмечается как изученная.</p></div>
          <div><span>PRACTICE</span><strong>+50%</strong><p>Полное освоение появляется только после решения задач.</p></div>
          <div><span>MEMORY</span><strong>∞</strong><p>Сохраняй теоремы, возвращайся к ним и строй личную библиотеку.</p></div>
        </motion.div>
      </section>

      <section className="home-section home-final">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.45 }}
          transition={{ duration: 0.8 }}
        >
          <div className="eyebrow">ENTER THE SYSTEM</div>
          <h2>Начни с матриц — и смотри, как из них вырастает остальная линейная алгебра.</h2>
          <div className="home-actions">
            <button className="home-primary" onClick={() => (window.location.hash = "matrices")}>
              § 1 · Матрицы
            </button>
            <button className="home-secondary" onClick={() => (window.location.hash = "map")}>
              Вся карта
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
