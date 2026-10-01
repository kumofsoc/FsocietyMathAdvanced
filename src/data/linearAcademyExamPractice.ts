import type { PracticeTask } from "../types/course";

export const linearAcademyExamPracticeByTopic: Record<string, PracticeTask[]> = {
  "matrices": [
    {
      "id": "academy-exam-matrices-01",
      "title": "ACADEMY EXAM · Неcommutativity",
      "prompt": "Пусть A=[[1,1],[0,1]], B=[[1,0],[1,1]]. Чему равен элемент (1,1) матрицы AB−BA?",
      "type": "number",
      "answer": "1",
      "hint": "Отдельно вычисли AB и BA.",
      "difficulty": "hard"
    }
  ],
  "determinants": [
    {
      "id": "academy-exam-determinants-01",
      "title": "ACADEMY EXAM · Объём композиции",
      "prompt": "Линейное преобразование A имеет det A=−2, B имеет det B=3. Чему равен det(B A)?",
      "type": "number",
      "answer": "-6",
      "hint": "Используй мультипликативность определителя.",
      "difficulty": "hard"
    }
  ],
  "inverse-rank": [
    {
      "id": "academy-exam-inverse-rank-01",
      "title": "ACADEMY EXAM · Rank under composition",
      "prompt": "A:ℝ⁴→ℝ³ имеет rank 2. Каков максимально возможный rank(B∘A) для любого B:ℝ³→ℝ⁵?",
      "type": "number",
      "answer": "2",
      "hint": "Образ композиции лежит в образе B от Im A.",
      "difficulty": "hard"
    }
  ],
  "linear-systems": [
    {
      "id": "academy-exam-linear-systems-01",
      "title": "ACADEMY EXAM · Geometry of solutions",
      "prompt": "Совместная система из 6 неизвестных имеет rank A=4. Какова размерность направляющего подпространства множества решений?",
      "type": "number",
      "answer": "2",
      "hint": "Множество решений x₀+ker A.",
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-linear-01",
      "title": "CAPSTONE 01 · Матрица → rank → СЛАУ",
      "prompt": "Для квадратной A порядка 4 известно det A≠0. Какое описание Ax=b верно для любого b∈ℝ⁴?",
      "type": "choice",
      "answer": "Существует единственное решение",
      "options": [
        "Существует единственное решение",
        "Решений всегда бесконечно много",
        "Система всегда несовместна",
        "Число решений зависит только от b₁"
      ],
      "hint": "det A≠0 ⇔ rank A=4 ⇔ A обратима.",
      "difficulty": "hard"
    }
  ],
  "vectors": [
    {
      "id": "academy-exam-vectors-01",
      "title": "ACADEMY EXAM · Coordinates",
      "prompt": "В базисе e'₁=e₁+e₂, e'₂=e₂ вектор v=2e₁+3e₂. Какие координаты v в базисе e'?",
      "type": "choice",
      "answer": "(2,1)",
      "options": [
        "(2,1)",
        "(2,3)",
        "(-1,3)",
        "(5,3)"
      ],
      "hint": "Ищи v=α(e₁+e₂)+βe₂.",
      "difficulty": "hard"
    }
  ],
  "dot-product": [
    {
      "id": "academy-exam-dot-product-01",
      "title": "ACADEMY EXAM · Projection",
      "prompt": "Для x=(3,4), a=(1,0) чему равна длина ортогонального остатка x−projₐx?",
      "type": "number",
      "answer": "4",
      "difficulty": "hard"
    }
  ],
  "cross-product": [
    {
      "id": "academy-exam-cross-product-01",
      "title": "ACADEMY EXAM · Area",
      "prompt": "a=(1,0,0), b=(1,2,0). Чему равна площадь параллелограмма на a,b?",
      "type": "number",
      "answer": "2",
      "hint": "Найди ||a×b||.",
      "difficulty": "hard"
    }
  ],
  "mixed-product": [
    {
      "id": "academy-exam-mixed-product-01",
      "title": "ACADEMY EXAM · Oriented volume",
      "prompt": "a=(1,0,0), b=(0,2,0), c=(0,0,3). Чему равно [a,b,c]?",
      "type": "number",
      "answer": "6",
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-vectors-01",
      "title": "CAPSTONE 02 · Полная векторная геометрия",
      "prompt": "Что одновременно означает [a,b,c]=0 при a×b≠0?",
      "type": "choice",
      "answer": "c лежит в плоскости, натянутой на a и b",
      "options": [
        "c лежит в плоскости, натянутой на a и b",
        "a и b ортогональны",
        "Все три вектора нулевые",
        "||c||=1"
      ],
      "difficulty": "hard"
    }
  ],
  "plane-coordinates": [
    {
      "id": "academy-exam-plane-coordinates-01",
      "title": "ACADEMY EXAM · Tangent to level set",
      "prompt": "Для F=x²+4y², в точке (2,1) какой вектор является нормалью к уровню?",
      "type": "choice",
      "answer": "(4,8)",
      "options": [
        "(4,8)",
        "(2,1)",
        "(-8,4)",
        "(1,4)"
      ],
      "hint": "Нормаль задаёт ∇F.",
      "difficulty": "hard"
    }
  ],
  "plane-lines": [
    {
      "id": "academy-exam-plane-lines-01",
      "title": "ACADEMY EXAM · Distance",
      "prompt": "Расстояние от точки (1,2) до прямой 3x+4y−1=0 равно:",
      "type": "number",
      "answer": "2",
      "hint": "|3+8−1|/5.",
      "difficulty": "hard"
    }
  ],
  "conics": [
    {
      "id": "academy-exam-conics-01",
      "title": "ACADEMY EXAM · Ellipse geometry",
      "prompt": "Эллипс x²/25+y²/9=1. Чему равен эксцентриситет?",
      "type": "choice",
      "answer": "4/5",
      "options": [
        "4/5",
        "3/5",
        "5/4",
        "1"
      ],
      "hint": "c²=a²−b².",
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-plane-geometry-01",
      "title": "CAPSTONE 03 · Прямая + коника",
      "prompt": "Прямая касается невырожденной коники. Сколько общих вещественных точек считается с геометрической точки зрения?",
      "type": "number",
      "answer": "1",
      "difficulty": "hard"
    }
  ],
  "space-lines-planes": [
    {
      "id": "academy-exam-space-lines-planes-01",
      "title": "ACADEMY EXAM · Line-plane angle",
      "prompt": "Направление прямой s=(0,0,1), нормаль плоскости n=(0,0,1). Каков угол между прямой и плоскостью в градусах?",
      "type": "number",
      "answer": "90",
      "difficulty": "hard"
    }
  ],
  "quadrics": [
    {
      "id": "academy-exam-quadrics-01",
      "title": "ACADEMY EXAM · Signature",
      "prompt": "Квадратичная часть имеет собственные значения 3,2,−1. Какой характер у формы?",
      "type": "choice",
      "answer": "Неопределённый",
      "options": [
        "Неопределённый",
        "Положительно определённый",
        "Отрицательно определённый",
        "Нулевой"
      ],
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-space-geometry-01",
      "title": "CAPSTONE 04 · Сечение квадрики",
      "prompt": "Какой тип сечения даёт плоскость z=c для z=x²−y² при c=0?",
      "type": "choice",
      "answer": "Пара пересекающихся прямых",
      "options": [
        "Пара пересекающихся прямых",
        "Окружность",
        "Эллипс",
        "Пустое множество"
      ],
      "hint": "x²−y²=0 ⇒ (x−y)(x+y)=0.",
      "difficulty": "hard"
    }
  ],
  "mappings-transformations": [
    {
      "id": "academy-exam-mappings-transformations-01",
      "title": "ACADEMY EXAM · Inverse order",
      "prompt": "Если h=g∘f, то какой оператор нужно применить первым при вычислении h⁻¹(y)?",
      "type": "choice",
      "answer": "g⁻¹",
      "options": [
        "g⁻¹",
        "f⁻¹",
        "f",
        "g"
      ],
      "difficulty": "hard"
    }
  ],
  "linear-transformations": [
    {
      "id": "academy-exam-linear-transformations-01",
      "title": "ACADEMY EXAM · Images of basis",
      "prompt": "T(e₁)=(1,2), T(e₂)=(3,4). Чему равен T(2e₁−e₂)?",
      "type": "choice",
      "answer": "(-1,0)",
      "options": [
        "(-1,0)",
        "(5,8)",
        "(1,-2)",
        "(-5,-8)"
      ],
      "difficulty": "hard"
    }
  ],
  "affine-transformations": [
    {
      "id": "academy-exam-affine-transformations-01",
      "title": "ACADEMY EXAM · Barycentric invariance",
      "prompt": "M=(A+B)/2 — середина AB. Что верно после любого аффинного преобразования f?",
      "type": "choice",
      "answer": "f(M)=(f(A)+f(B))/2",
      "options": [
        "f(M)=(f(A)+f(B))/2",
        "|f(A)f(M)|=|AM| всегда",
        "Все углы сохраняются",
        "f(M)=0"
      ],
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-transformations-01",
      "title": "CAPSTONE 05 · Linear vs affine",
      "prompt": "Какое свойство отличает линейное преобразование от общего аффинного x↦Ax+b?",
      "type": "choice",
      "answer": "Линейное обязательно фиксирует начало координат",
      "options": [
        "Линейное обязательно фиксирует начало координат",
        "Линейное всегда сохраняет расстояния",
        "Аффинное всегда нелинейно",
        "Аффинное не сохраняет прямые"
      ],
      "difficulty": "hard"
    }
  ],
  "linear-spaces": [
    {
      "id": "academy-exam-linear-spaces-01",
      "title": "ACADEMY EXAM · Dimension",
      "prompt": "Какова размерность пространства всех вещественных матриц 2×3?",
      "type": "number",
      "answer": "6",
      "difficulty": "hard"
    }
  ],
  "subspaces": [
    {
      "id": "academy-exam-subspaces-01",
      "title": "ACADEMY EXAM · Grassmann",
      "prompt": "dim U=5, dim W=4, dim(U+W)=7. Чему равна dim(U∩W)?",
      "type": "number",
      "answer": "2",
      "difficulty": "hard"
    }
  ],
  "linear-maps": [
    {
      "id": "academy-exam-linear-maps-01",
      "title": "ACADEMY EXAM · Rank-nullity",
      "prompt": "T:ℝ⁷→ℝ⁵ имеет ker T размерности 3. Чему равен rank T?",
      "type": "number",
      "answer": "4",
      "difficulty": "hard"
    }
  ],
  "eigenproblem": [
    {
      "id": "academy-exam-eigenproblem-01",
      "title": "ACADEMY EXAM · Powers",
      "prompt": "A диагонализуема и имеет собственные значения 2 и 1/2. Какое направление доминирует в Aⁿx при n→∞ для общего x?",
      "type": "choice",
      "answer": "Собственное направление λ=2",
      "options": [
        "Собственное направление λ=2",
        "Собственное направление λ=1/2",
        "Оба всегда одинаково",
        "Ни одно"
      ],
      "difficulty": "hard"
    }
  ],
  "linear-functionals": [
    {
      "id": "academy-exam-linear-functionals-01",
      "title": "ACADEMY EXAM · Kernel dimension",
      "prompt": "Ненулевой функционал φ:ℝ⁶→ℝ. Какова dim ker φ?",
      "type": "number",
      "answer": "5",
      "difficulty": "hard"
    }
  ],
  "quadratic-forms": [
    {
      "id": "academy-exam-quadratic-forms-01",
      "title": "ACADEMY EXAM · Definiteness",
      "prompt": "Симметричная матрица формы имеет собственные значения 5,1,0. Как лучше классифицировать форму?",
      "type": "choice",
      "answer": "Положительно полуопределённая",
      "options": [
        "Положительно полуопределённая",
        "Положительно определённая",
        "Неопределённая",
        "Отрицательно определённая"
      ],
      "difficulty": "hard"
    }
  ],
  "jordan-form": [
    {
      "id": "academy-exam-jordan-form-01",
      "title": "ACADEMY EXAM · Nilpotent contribution",
      "prompt": "Для J=[[1,1],[0,1]] чему равен верхний правый элемент J^10?",
      "type": "number",
      "answer": "10",
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-abstract-linear-01",
      "title": "CAPSTONE 06 · Spectrum + Jordan",
      "prompt": "Матрица 3×3 имеет единственное собственное значение λ и только один линейно независимый собственный вектор. Что обязательно?",
      "type": "choice",
      "answer": "Она не диагонализуема",
      "options": [
        "Она не диагонализуема",
        "Она обязательно симметрична",
        "Она равна λI",
        "Её determinant равен 0"
      ],
      "difficulty": "hard"
    }
  ],
  "euclidean-spaces": [
    {
      "id": "academy-exam-euclidean-spaces-01",
      "title": "ACADEMY EXAM · Least squares",
      "prompt": "Какое ортогональное условие выполняет остаток r=b−Ax̂ в задаче наименьших квадратов?",
      "type": "choice",
      "answer": "Aᵀr=0",
      "options": [
        "Aᵀr=0",
        "Ar=0",
        "r=0 всегда",
        "AᵀA=0"
      ],
      "difficulty": "hard"
    }
  ],
  "euclidean-operators": [
    {
      "id": "academy-exam-euclidean-operators-01",
      "title": "ACADEMY EXAM · SVD rank",
      "prompt": "У матрицы сингулярные числа 5,2,0,0. Чему равен её rank?",
      "type": "number",
      "answer": "2",
      "difficulty": "hard"
    }
  ],
  "euclidean-functions": [
    {
      "id": "academy-exam-euclidean-functions-01",
      "title": "ACADEMY EXAM · Riesz vector",
      "prompt": "В стандартном ℝ³ функционал φ(x)=2x₁−x₂+4x₃. Каков представляющий вектор?",
      "type": "choice",
      "answer": "(2,-1,4)",
      "options": [
        "(2,-1,4)",
        "(1,2,4)",
        "(-2,1,-4)",
        "(2,1,4)"
      ],
      "difficulty": "hard"
    }
  ],
  "unitary-spaces": [
    {
      "id": "academy-exam-unitary-spaces-01",
      "title": "ACADEMY EXAM · Hermitian spectrum",
      "prompt": "Может ли эрмитова матрица иметь собственное значение 2+i?",
      "type": "choice",
      "answer": "Нет",
      "options": [
        "Нет",
        "Да, всегда",
        "Только если det=0",
        "Только в размерности 2"
      ],
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-euclidean-01",
      "title": "CAPSTONE 07 · Metric operators",
      "prompt": "Какой набор свойств наиболее характерен для ортогонального/унитарного оператора?",
      "type": "choice",
      "answer": "Сохраняет скалярное произведение и норму",
      "options": [
        "Сохраняет скалярное произведение и норму",
        "Всегда диагонален в исходном базисе",
        "Все собственные значения положительны",
        "Всегда имеет rank 1"
      ],
      "difficulty": "hard"
    }
  ],
  "affine-spaces": [
    {
      "id": "academy-exam-affine-spaces-01",
      "title": "ACADEMY EXAM · Solution plane",
      "prompt": "Совместная система Ax=b в ℝ⁵ имеет rank A=2. Какова размерность аффинного множества решений?",
      "type": "number",
      "answer": "3",
      "difficulty": "hard"
    }
  ],
  "quadric-invariants": [
    {
      "id": "academy-exam-quadric-invariants-01",
      "title": "ACADEMY EXAM · Congruence",
      "prompt": "A'=SᵀAS, S обратима. Какой инвариант точно сохраняется?",
      "type": "choice",
      "answer": "Ранг A",
      "options": [
        "Ранг A",
        "Каждый отдельный элемент A",
        "След A при любой S",
        "Евклидова длина каждого столбца"
      ],
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-affine-01",
      "title": "CAPSTONE 08 · Квадрика без координатной зависимости",
      "prompt": "Почему классификация через rank/signature сильнее распознавания по внешнему виду коэффициентов?",
      "type": "choice",
      "answer": "Эти характеристики сохраняются при допустимых заменах координат",
      "options": [
        "Эти характеристики сохраняются при допустимых заменах координат",
        "Коэффициенты никогда не меняются",
        "Все квадрики ортогональны",
        "Потому что determinant всегда 1"
      ],
      "difficulty": "hard"
    }
  ],
  "tensor-linear": [
    {
      "id": "academy-exam-tensor-linear-01",
      "title": "ACADEMY EXAM · Tensor dimension",
      "prompt": "В 3-мерном пространстве какова размерность пространства тензоров типа (1,2)?",
      "type": "number",
      "answer": "27",
      "hint": "n^(p+q).",
      "difficulty": "hard"
    }
  ],
  "tensor-euclidean": [
    {
      "id": "academy-exam-tensor-euclidean-01",
      "title": "ACADEMY EXAM · Metric inverse",
      "prompt": "Что выражает равенство g^{ik}g_{kj}=δ^i_j?",
      "type": "choice",
      "answer": "Контрвариантная метрика является обратной к ковариантной",
      "options": [
        "Контрвариантная метрика является обратной к ковариантной",
        "Метрика всегда нулевая",
        "Все базисы ортонормированы",
        "Тензор имеет rank 1"
      ],
      "difficulty": "hard"
    }
  ],
  "exterior-algebra": [
    {
      "id": "academy-exam-exterior-algebra-01",
      "title": "ACADEMY EXAM · Wedge dependence",
      "prompt": "u и v ненулевые. Если u∧v=0, что следует?",
      "type": "choice",
      "answer": "u и v линейно зависимы",
      "options": [
        "u и v линейно зависимы",
        "u и v ортогональны",
        "||u||=||v||",
        "u+v=0 обязательно"
      ],
      "difficulty": "hard"
    },
    {
      "id": "academy-capstone-tensor-01",
      "title": "CAPSTONE 09 · От determinant к exterior algebra",
      "prompt": "Что объединяет determinant и внешнее произведение в геометрическом смысле?",
      "type": "choice",
      "answer": "Ориентированный объём и антисимметрия",
      "options": [
        "Ориентированный объём и антисимметрия",
        "Только длина вектора",
        "Только trace оператора",
        "Коммутативность"
      ],
      "difficulty": "hard"
    }
  ]
};

export const linearAcademyExamTaskIdsByTopic: Record<string, string[]> = Object.fromEntries(
  Object.entries(linearAcademyExamPracticeByTopic).map(([topicId, items]) => [
    topicId,
    items.map((item) => item.id),
  ]),
);
