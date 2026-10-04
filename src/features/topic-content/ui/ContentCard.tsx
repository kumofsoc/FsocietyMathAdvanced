import { AnimatePresence, motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { useEffect, useRef, useState } from "react";
import type { BlockKind, ContentBlock, Topic } from "@/entities/course/model/types";
import {
  loadSavedTheorems,
  saveTheorems,
} from "@/features/learning/model/learning";
import {
  BLOCK_NOTES_EVENT,
  BLOCK_NOTES_KEY,
  deleteBlockNote,
  loadBlockNote,
  saveBlockNote,
} from "@/features/block-notes/model/blockNotes";
import {
  IMPORTANT_BLOCKS_EVENT,
  IMPORTANT_BLOCKS_KEY,
  isBlockImportant,
  toggleImportantBlock,
} from "@/features/important-blocks/model/importantBlocks";
import { copyTextToClipboard } from "@/shared/lib/clipboard";
import { buildBlockDeepLink } from "@/shared/lib/blockDeepLink";
import { CollapsibleProof } from "@/features/proof-collapse/ui/CollapsibleProof";
import {
  MatrixExampleStrip,
  RichMatrixText,
} from "@/visualizations/linear/MatrixNotation";
import { MatrixOperationScene } from "@/visualizations/linear/MatrixOperationScene";
import { openDependency } from "../model/dependencyNavigation";

export const CONTENT_BLOCK_LABELS: Record<BlockKind, string> = {
  definition: "ОПРЕДЕЛЕНИЕ",
  concepts: "ОСНОВНЫЕ ПОНЯТИЯ",
  property: "СВОЙСТВО",
  theorem: "ТЕОРЕМА",
  proof: "ДОКАЗАТЕЛЬСТВО",
  corollary: "СЛЕДСТВИЕ",
  formula: "ФОРМУЛА",
  example: "ПРИМЕР",
  solution: "РЕШЕНИЕ",
  note: "ОБРАТИ ВНИМАНИЕ",
  algorithm: "АЛГОРИТМ",
  geometry: "ГЕОМЕТРИЧЕСКИЙ СМЫСЛ",
  summary: "ИТОГ",
};

export function displayBlockTitle(title: string) {
  return title
    .replace(/^ACADEMY\s+VISUAL\s*[·/]\s*/i, "Визуализация · ")
    .replace(/^ACADEMY\s+LAB\s*\/\s*/i, "Интерактивная лаборатория · ")
    .replace(/^ACADEMY\s+PRO\s*\/\s*/i, "Углублённое изучение · ")
    .replace(/^ACADEMY\s*\/\s*/i, "")
    .replace(/^ACADEMY\s+/i, "");
}

function CopyContentButton({
  value,
  label,
  className = "",
  title,
}: {
  value: string;
  label: string;
  className?: string;
  title: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const copy = async () => {
    const copied = await copyTextToClipboard(value);
    setState(copied ? "copied" : "failed");

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setState("idle");
      resetTimer.current = null;
    }, 1400);
  };

  return (
    <button
      type="button"
      className={"content-copy-button " + className + " " + state}
      onClick={() => void copy()}
      title={title}
      aria-live="polite"
    >
      <span aria-hidden="true">{state === "copied" ? "✓" : state === "failed" ? "!" : "⧉"}</span>
      <strong>{state === "copied" ? "Скопировано" : state === "failed" ? "Не удалось" : label}</strong>
    </button>
  );
}

function CopyableMath({
  math,
  className,
}: {
  math: string;
  className: string;
}) {
  return (
    <div className={className + " copyable-math"}>
      <CopyContentButton
        value={math}
        label="LaTeX"
        className="latex"
        title="Скопировать LaTeX"
      />
      <BlockMath math={math} />
    </div>
  );
}

function CopyBlockLinkButton({
  topicId,
  blockIndex,
}: {
  topicId: string;
  blockIndex: number;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const copyLink = async () => {
    const link = buildBlockDeepLink(window.location.href, topicId, blockIndex);
    const ok = await copyTextToClipboard(link);
    setCopied(ok);

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setCopied(false);
      resetTimer.current = null;
    }, 1400);
  };

  return (
    <button
      type="button"
      className={"block-deep-link-button " + (copied ? "copied" : "")}
      onClick={() => void copyLink()}
      title="Скопировать ссылку на этот блок"
      aria-label="Скопировать ссылку на этот блок"
    >
      <span aria-hidden="true">{copied ? "✓" : "↗"}</span>
      <strong>{copied ? "Ссылка скопирована" : "Ссылка"}</strong>
    </button>
  );
}


function isAdvancedLearningBlock(block: ContentBlock) {
  return block.source === "academy";
}

export function ContentCard({
  topic,
  block,
  index,
}: {
  topic: Topic;
  block: ContentBlock;
  index: number;
}) {
  const theoremId = topic.id + "::" + index;
  const academyBlock = isAdvancedLearningBlock(block);
  const [saved, setSaved] = useState(() => loadSavedTheorems().some((item) => item.id === theoremId));
  const [important, setImportant] = useState(() => isBlockImportant(topic.id, index));
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(() => loadBlockNote(topic.id, index)?.text ?? "");
  const [noteSaveState, setNoteSaveState] = useState<"idle" | "saved" | "failed">("idle");
  const [propertyPanel, setPropertyPanel] = useState<"proof" | "corollary" | null>(
    () => topic.id === "matrices" && block.proofs?.length ? "proof" : null,
  );
  const [openStatements, setOpenStatements] = useState<Set<string>>(
    () => new Set(topic.id === "matrices" ? (block.statements ?? []).map((statement) => statement.id) : []),
  );

  const toggleStatement = (statementId: string) => {
    if (topic.id === "matrices") return;
    setOpenStatements((current) => {
      const next = new Set(current);
      if (next.has(statementId)) next.delete(statementId);
      else next.add(statementId);
      return next;
    });
  };

  useEffect(() => {
    const syncNote = () => {
      setNoteText(loadBlockNote(topic.id, index)?.text ?? "");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === BLOCK_NOTES_KEY) syncNote();
    };

    window.addEventListener(BLOCK_NOTES_EVENT, syncNote);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(BLOCK_NOTES_EVENT, syncNote);
      window.removeEventListener("storage", onStorage);
    };
  }, [topic.id, index]);

  useEffect(() => {
    const syncImportant = () => {
      setImportant(isBlockImportant(topic.id, index));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === IMPORTANT_BLOCKS_KEY) syncImportant();
    };

    window.addEventListener(IMPORTANT_BLOCKS_EVENT, syncImportant);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(IMPORTANT_BLOCKS_EVENT, syncImportant);
      window.removeEventListener("storage", onStorage);
    };
  }, [topic.id, index]);

  const toggleImportant = () => {
    const next = toggleImportantBlock({
      topicId: topic.id,
      blockIndex: index,
      topicTitle: topic.title,
      blockTitle: displayBlockTitle(block.title),
      kind: block.kind,
    });
    if (next.saved) {
      setImportant(next.important);
    }
  };

  const updateNote = (value: string) => {
    setNoteText(value);
    const savedNote = saveBlockNote(topic.id, index, value);
    setNoteSaveState(savedNote ? "saved" : "failed");
  };

  const removeNote = () => {
    const deleted = deleteBlockNote(topic.id, index);
    if (!deleted) {
      setNoteSaveState("failed");
      return;
    }
    setNoteText("");
    setNoteSaveState("idle");
    setNoteOpen(false);
  };

  const toggleSaved = () => {
    const current = loadSavedTheorems();
    if (current.some((item) => item.id === theoremId)) {
      saveTheorems(current.filter((item) => item.id !== theoremId));
      setSaved(false);
      return;
    }

    saveTheorems([
      ...current,
      {
        id: theoremId,
        topicId: topic.id,
        topicTitle: topic.title,
        title: displayBlockTitle(block.title),
        body: block.body,
        formula: block.formula,
      },
    ]);
    setSaved(true);
  };

  return (
    <motion.article
      className={
        "content-block kind-" +
        block.kind +
        (academyBlock ? " academy-content-block" : "") +
        (important ? " important-content-block" : "") +
        ((block.kind === "example" || block.kind === "solution") ? " example-showcase-block" : "") +
        (topic.id === "matrices" && (block.kind === "example" || block.kind === "solution") ? " matrix-example-block" : "")
      }
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.44, delay: Math.min(index * 0.018, 0.16) }}
    >
      <div className="block-rail">
        <span>{academyBlock ? "УГЛУБЛЁННО / " + CONTENT_BLOCK_LABELS[block.kind] : CONTENT_BLOCK_LABELS[block.kind]}</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </div>

      <div className="block-body">
        <div className="block-title-row">
          <h3>{displayBlockTitle(block.title)}</h3>
          <div className="block-title-actions">
            <button
              type="button"
              className={"block-important-button " + (important ? "active" : "")}
              onClick={toggleImportant}
              aria-pressed={important}
              title={important ? "Убрать блок из важных" : "Отметить блок как важный"}
            >
              <span aria-hidden="true">{important ? "◆" : "◇"}</span>
              <strong>{important ? "Важно" : "Важно"}</strong>
            </button>
            <button
              type="button"
              className={"block-note-button " + (noteText.trim() ? "has-note " : "") + (noteOpen ? "active" : "")}
              onClick={() => setNoteOpen((value) => !value)}
              aria-expanded={noteOpen}
              title={noteText.trim() ? "Открыть заметку к этому блоку" : "Добавить заметку к этому блоку"}
            >
              <span aria-hidden="true">{noteText.trim() ? "●" : "✎"}</span>
              <strong>{noteText.trim() ? "Заметка" : "Заметка"}</strong>
            </button>
            <CopyBlockLinkButton topicId={topic.id} blockIndex={index} />
            {block.kind === "theorem" && (
              <>
                <CopyContentButton
                  value={
                    displayBlockTitle(block.title) +
                    "\n\n" +
                    block.body +
                    (block.formula ? "\n\n" + block.formula : "")
                  }
                  label="Текст"
                  className="theorem-text"
                  title="Скопировать текст теоремы"
                />
                <button
                  className={"save-theorem-button " + (saved ? "saved" : "")}
                  onClick={toggleSaved}
                  title={saved ? "Убрать из сохранённых" : "Сохранить теорему"}
                  aria-label={saved ? "Убрать теорему из сохранённых" : "Сохранить теорему"}
                >
                  {saved ? "★" : "☆"}
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {noteOpen && (
            <motion.section
              className={"block-note-panel " + (noteText.trim() ? "has-note" : "")}
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              aria-label={"Заметка к блоку «" + displayBlockTitle(block.title) + "»"}
            >
              <header>
                <div>
                  <span>МОЯ ЗАМЕТКА</span>
                  <strong>{CONTENT_BLOCK_LABELS[block.kind]} · блок {String(index + 1).padStart(2, "0")}</strong>
                </div>
                <small>
                  {noteSaveState === "failed"
                    ? "Не удалось сохранить"
                    : noteText.trim()
                      ? "Сохраняется автоматически"
                      : "Привязана к этому блоку"}
                </small>
              </header>

              <textarea
                value={noteText}
                onChange={(event) => updateNote(event.target.value)}
                placeholder="Запиши свою мысль, непонятный момент, вопрос или связь с другой темой…"
                rows={4}
                spellCheck
              />

              <footer>
                <span>
                  {noteText.length ? noteText.length + " симв." : "Пустая заметка не сохраняется"}
                </span>
                {noteText.trim() && (
                  <button type="button" onClick={removeNote}>
                    Удалить заметку
                  </button>
                )}
              </footer>
            </motion.section>
          )}
        </AnimatePresence>

        {!block.matrixOperation && block.kind === "proof" ? (
          <CollapsibleProof body={block.body} formula={block.formula}>
            <p><RichMatrixText text={block.body} /></p>
            {block.formula && (
              <CopyableMath math={block.formula} className="formula-box" />
            )}
          </CollapsibleProof>
        ) : !block.matrixOperation ? (
          <p><RichMatrixText text={block.body} /></p>
        ) : null}

        {topic.id === "matrices" &&
          !block.matrixOperation &&
          (block.kind === "example" || block.kind === "solution") && (
            <MatrixExampleStrip text={block.body} />
          )}

        {block.matrixOperation && <MatrixOperationScene visual={block.matrixOperation} />}

        {block.formula && block.kind !== "proof" && (
          <CopyableMath math={block.formula} className="formula-box" />
        )}

        {block.items && (
          <ul className="property-list">
            {block.items.map((item, itemIndex) => (
              <li key={item}>
                <span className="property-list-index">{String(itemIndex + 1).padStart(2, "0")}</span>
                <span><RichMatrixText text={item} /></span>
              </li>
            ))}
          </ul>
        )}

        {block.kind === "theorem" && block.workedExamples?.length ? (
          <div className="theorem-worked-examples">
            {block.workedExamples.map((example, exampleIndex) => (
              <article key={example.body + exampleIndex}>
                <div className="property-panel-label">ПРИМЕР К ТЕОРЕМЕ {exampleIndex + 1}</div>
                <p><RichMatrixText text={example.body} /></p>
                {example.formula && (
                  <CopyableMath math={example.formula} className="property-panel-formula" />
                )}
              </article>
            ))}
          </div>
        ) : null}

        {block.statements?.length ? (
          <div className={"rigorous-statements " + (topic.id === "matrices" ? "always-open" : "inline-accordion")}>
            {block.statements.map((statement, statementIndex) => {
              const expanded = topic.id === "matrices" || openStatements.has(statement.id);
              return (
                <article key={statement.id} className={"rigorous-statement " + (expanded ? "expanded" : "")}>
                  <button
                    type="button"
                    className="rigorous-statement-head"
                    onClick={() => toggleStatement(statement.id)}
                    aria-expanded={expanded}
                  >
                    <span>СВОЙСТВО {String(statementIndex + 1).padStart(2, "0")}</span>
                    <strong><RichMatrixText text={statement.claim} /></strong>
                    {topic.id !== "matrices" && <b aria-hidden="true">{expanded ? "−" : "+"}</b>}
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        className="rigorous-statement-details"
                        initial={topic.id === "matrices" ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {statement.conditions && (
                          <div className="rigorous-conditions">
                            <b>УСЛОВИЯ</b>
                            <p><RichMatrixText text={statement.conditions} /></p>
                          </div>
                        )}
                        <div className="rigorous-proof">
                          <b>ДОКАЗАТЕЛЬСТВО</b>
                          <h4>{statement.proof.label}</h4>
                          <CollapsibleProof
                            body={statement.proof.body}
                            formula={statement.proof.formula}
                          >
                            <p><RichMatrixText text={statement.proof.body} /></p>
                            {statement.proof.formula && (
                              <CopyableMath math={statement.proof.formula} className="property-panel-formula" />
                            )}
                          </CollapsibleProof>
                        </div>
                        <div className="rigorous-example">
                          <b>ПРИМЕР</b>
                          <p><RichMatrixText text={statement.example.body} /></p>
                          {statement.example.formula && (
                            <CopyableMath math={statement.example.formula} className="property-panel-formula" />
                          )}
                        </div>
                        {statement.withoutConditions && (
                          <div className="rigorous-boundary">
                            <b>БЕЗ УСЛОВИЙ</b>
                            <p><RichMatrixText text={statement.withoutConditions} /></p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        ) : null}

        {(block.kind === "property" || block.kind === "theorem") && !block.statements?.length && (block.proofs?.length || block.corollaries?.length) && (
          <div className="property-disclosures">
            <div className="property-disclosure-actions">
              {block.proofs?.length ? (
                <button
                  className={propertyPanel === "proof" ? "active" : ""}
                  onClick={() => setPropertyPanel((current) => current === "proof" ? null : "proof")}
                >
                  <span>∵</span>
                  {block.kind === "theorem" ? "Доказательство теоремы" : "Доказательство"}
                  <b>{propertyPanel === "proof" ? "−" : "+"}</b>
                </button>
              ) : null}
              {block.corollaries?.length ? (
                <button
                  className={propertyPanel === "corollary" ? "active" : ""}
                  onClick={() => setPropertyPanel((current) => current === "corollary" ? null : "corollary")}
                >
                  <span>⇒</span>
                  Следствие
                  <b>{propertyPanel === "corollary" ? "−" : "+"}</b>
                </button>
              ) : null}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {propertyPanel === "proof" && block.proofs?.length ? (
                <motion.div
                  key="proof"
                  className="property-proof-panel"
                  initial={{ height: 0, opacity: 0, y: -4 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {block.proofs.map((proof, proofIndex) => (
                    <article key={proof.label + proofIndex}>
                      <div className="property-panel-label">ДОКАЗАТЕЛЬСТВО</div>
                      <h4>{proof.label}</h4>
                      <CollapsibleProof body={proof.body} formula={proof.formula}>
                        <p><RichMatrixText text={proof.body} /></p>
                        {proof.formula && (
                          <CopyableMath math={proof.formula} className="property-panel-formula" />
                        )}
                      </CollapsibleProof>
                    </article>
                  ))}

                  {block.workedExamples?.length ? (
                    <div className="property-proof-examples">
                      <div className="property-panel-label">ПРИМЕРЫ</div>
                      <div className="property-proof-example-grid">
                        {block.workedExamples.map((example, exampleIndex) => (
                          <article className="property-proof-example" key={example.body + exampleIndex}>
                            <span>ПРИМЕР {String(exampleIndex + 1).padStart(2, "0")}</span>
                            {example.title ? <strong>{example.title}</strong> : null}
                            <p><RichMatrixText text={example.body} /></p>
                            {example.formula && (
                              <CopyableMath math={example.formula} className="property-panel-formula" />
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}

              {propertyPanel === "corollary" && block.corollaries?.length ? (
                <motion.div
                  key="corollary"
                  className="property-corollary-panel"
                  initial={{ height: 0, opacity: 0, y: -4 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -4 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {block.corollaries.map((corollary, corollaryIndex) => (
                    <article key={corollary.label + corollaryIndex}>
                      <div className="property-panel-label">СЛЕДСТВИЕ {corollaryIndex + 1}</div>
                      <h4>{corollary.label}</h4>
                      <p><RichMatrixText text={corollary.body} /></p>
                      {corollary.formula && (
                        <CopyableMath math={corollary.formula} className="property-panel-formula" />
                      )}
                    </article>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}

        {block.dependsOn && (
          <div className="depends-row">
            <span>Использует:</span>
            {block.dependsOn.map((dependency) => (
              <button
                key={dependency}
                className="dependency-link"
                onClick={() => void openDependency(dependency)}
                title={"Найти и перейти: " + dependency}
              >
                {dependency} ↗
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

