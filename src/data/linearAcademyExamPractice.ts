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
      "prompt": "Проведи полный анализ оператора A:ℝ³→ℝ³ с матрицей A=[[1,2,3],[2,4,6],[1,1,1]]. Найди rank, объясни обратимость через determinant/rank, опиши ker A и сформулируй условия совместности Ax=b. Не ограничивайся Гауссом: дай операторную интерпретацию.",
      "type": "proof",
      "answer": "self-check",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "difficulty": "hard",
      "solution": "Строка 2=2·строка 1, но строка 3 не пропорциональна строке 1, поэтому rank A=2 и det A=0: оператор необратим. Решая Ax=0, из x+y+z=0 и x+2y+3z=0 получаем y+2z=0, x=z; ker A=span(1,-2,1), nullity=1. Система Ax=b совместна ровно при b∈Im A, эквивалентно rank A=rank[A|b]. Образ двумерен: оператор схлопывает ℝ³ на плоскость.",
      "rubric": [
        "Найден rank=2 и объяснён det=0/необратимость.",
        "Найден одномерный kernel с корректным базисным вектором.",
        "Совместность сформулирована через Im A или Кронекер–Капелли.",
        "Дана геометрия: ℝ³ → двумерный image, одно направление уничтожается."
      ]
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
      "prompt": "Пусть a=(1,0,1), b=(0,2,1), c=(2,1,3). Исследуй геометрию тройки: вычисли a·b, a×b, смешанное произведение [a,b,c], реши вопрос о компланарности и найди площадь основания на a,b. Объясни каждое число геометрически.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "a·b=1. a×b=(-2,-1,2), поэтому площадь параллелограмма ||a×b||=3. Смешанное произведение [a,b,c]=(a×b)·c=-4-1+6=1, значит векторы некомпланарны; ориентированный объём параллелепипеда равен 1. Знак задаёт ориентацию.",
      "rubric": [
        "Корректно вычислены dot и cross.",
        "Площадь связана с нормой cross product.",
        "Mixed product вычислен и интерпретирован как oriented volume.",
        "Сделан вывод о некомпланарности."
      ]
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
      "prompt": "Классифицируй кривую 5x²+4xy+5y²−18=0. Найди главные направления квадратичной части, выполни поворот координат концептуально, получи канонический вид и определи полуоси.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "Квадратичная матрица A=[[5,2],[2,5]] имеет eigenvalues 7 и 3 с собственными направлениями (1,1) и (1,-1). В ортонормированных главных координатах u,v уравнение становится 7u²+3v²=18, то есть u²/(18/7)+v²/6=1. Это эллипс с полуосями sqrt(18/7) и sqrt(6), повернутый на 45°.",
      "rubric": [
        "Составлена симметричная матрица квадратичной части.",
        "Найдены λ=7,3 и собственные направления.",
        "Получено 7u²+3v²=18.",
        "Кривая классифицирована как повёрнутый эллипс и найдены полуоси."
      ]
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
      "prompt": "Исследуй поверхность x²+y²−z²=1: классифицируй квадрику по знакам квадратичной формы и опиши сечения z=c, x=0 и y=0. Объясни, как сечения восстанавливают 3D-геометрию.",
      "type": "proof",
      "answer": "self-check",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "difficulty": "hard",
      "solution": "Сигнатура квадратичной части (+,+,-) неопределённая, правая часть положительна: это однополостный гиперболоид. При z=c: x²+y²=1+c² — окружности растущего радиуса. При x=0: y²−z²=1 — гипербола; при y=0: x²−z²=1 — гипербола. Горизонтальные окружности и вертикальные гиперболы описывают связанную одно-полостную поверхность.",
      "rubric": [
        "Классификация выполнена через signature.",
        "Верно описаны горизонтальные сечения.",
        "Верно описаны два вертикальных сечения.",
        "Сечения связаны с глобальной формой поверхности."
      ]
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
      "prompt": "Рассмотри аффинное f(x)=Ax+b, A=[[1,1],[0,1]], b=(2,-1). Найди неподвижные точки или докажи их отсутствие, опиши действие на параллельные прямые и докажи, что центр масс любого треугольника переходит в центр масс образного треугольника.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "Fixed point должен решать (I-A)x=b. Здесь I-A=[[0,-1],[0,0]], поэтому уравнения -y=2 и 0=-1 несовместны: неподвижных точек нет. Поскольку разность образов f(P)-f(Q)=A(P-Q), параллельные направления переходят в параллельные. Для G=(P+Q+R)/3 коэффициенты суммируются в 1, поэтому f(G)=(f(P)+f(Q)+f(R))/3.",
      "rubric": [
        "Корректно решена fixed-point система и обнаружена несовместность.",
        "Параллельность объяснена через линейную часть A.",
        "Центроид доказан барицентрической формулой."
      ]
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
      "prompt": "Для J=[[1,1],[0,1]] исследуй оператор полностью: spectrum, eigenspace, diagonalizability, Jordan chain и формулу J^n. Сравни динамику с I, хотя spectrum у обеих матриц одинаков.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "Характеристический многочлен (λ-1)², spectrum={1}. ker(J-I)=span(e1), геометрическая кратность 1<2, поэтому J не диагонализуема. e1 — eigenvector, e2 — generalized eigenvector: (J-I)e2=e1. N=J-I, N²=0, поэтому J^n=(I+N)^n=I+nN=[[1,n],[0,1]]. У I все векторы собственные и I^n=I, значит одинаковый spectrum не определяет динамику без Jordan structure.",
      "rubric": [
        "Найдены spectrum и eigenspace.",
        "Корректно доказана недиагонализуемость.",
        "Построена Jordan chain.",
        "Получено J^n и сравнено с I."
      ]
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
      "prompt": "Пусть A=[[1,0],[0,3]]. Опиши SVD, образ единичной окружности, condition number и решение least-squares задачи Ax≈b при b=(2,4). Затем объясни, почему здесь least squares совпадает с точным решением.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "A уже диагональна с положительными entries, поэтому U=V=I, Σ=diag(1,3), singular values 3 и 1 (по убыванию можно переставить базис). Единичная окружность переходит в эллипс с полуосями 1 и 3; condition number=3. A обратима, поэтому b∈Im A=ℝ² и least squares имеет нулевой residual: x=A^{-1}b=(2,4/3). Normal equations дают тот же ответ.",
      "rubric": [
        "Корректно описан SVD/singular values.",
        "Образ окружности связан с эллипсом.",
        "Найден condition number.",
        "Least squares решён и объяснён нулевой residual."
      ]
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
      "prompt": "Для коники 4x²+4xy+y²−6x−3y=0 исследуй квадратичную часть как форму: найди rank/signature, объясни, что сохраняется при аффинной смене координат, и предскажи вырожденность/тип до полного приведения.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "Квадратичная матрица [[4,2],[2,1]] имеет determinant 0 и rank 1; eigenvalues 5 и 0, то есть signature по ненулевой части положительная. Rank квадратичной части сохраняется при congruence SᵀAS. Rank 1 означает параболический/параллельный вырожденный тип, а линейные члены решают, получится ли настоящая парабола или вырожденная пара параллельных линий. Для полной классификации нужно также исследовать rank/signature расширенной формы.",
      "rubric": [
        "Правильно построена квадратичная матрица.",
        "Найдены rank=1 и знаковый характер.",
        "Объяснена инвариантность при congruence.",
        "Отмечена необходимость большой формы для окончательного класса."
      ]
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
      "prompt": "Свяжи determinant, wedge product и тензорный закон преобразования. Для базиса e₁,e₂ и новых e'₁,e'₂=eS объясни, как меняется e₁∧e₂, почему коэффициент равен det S и почему vanishing wedge является критерием линейной зависимости.",
      "type": "proof",
      "answer": "self-check",
      "difficulty": "hard",
      "hint": "Реши задачу полностью на бумаге/в заметках, затем сверяй не текст, а структуру аргумента.",
      "solution": "По билинейности и антисимметрии e'₁∧e'₂=(s¹₁e₁+s²₁e₂)∧(s¹₂e₁+s²₂e₂)=(s¹₁s²₂-s²₁s¹₂)e₁∧e₂=(det S)e₁∧e₂. Поэтому top-degree exterior component преобразуется determinant-множителем и кодирует oriented volume. Если u,v зависимы, v=cu и u∧v=c(u∧u)=0; если независимы, они образуют базис своей 2-плоскости и wedge ненулевой.",
      "rubric": [
        "Wedge раскрыт билинейностью.",
        "Антисимметрия дала determinant коэффициент.",
        "Связь с oriented volume сформулирована.",
        "Доказан критерий зависимости через wedge=0."
      ]
    }
  ]
};

export const linearAcademyExamTaskIdsByTopic: Record<string, string[]> = Object.fromEntries(
  Object.entries(linearAcademyExamPracticeByTopic).map(([topicId, items]) => [
    topicId,
    items.map((item) => item.id),
  ]),
);
