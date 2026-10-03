import type { TopicPatches } from "../model";

const patches: TopicPatches = {
    "Теорема 6.1 · Формула в ортонормированном базисе": {
      proofs: [
        {
          label: "Раскрытие по линейности",
          body: "Пусть a=Σaᵢeᵢ и b=Σbⱼeⱼ. По билинейности (a,b)=ΣᵢΣⱼaᵢbⱼ(eᵢ,eⱼ). В ортонормированном базисе (eᵢ,eⱼ)=0 при i≠j и 1 при i=j, поэтому остаётся Σaᵢbᵢ."
        }
      ],
      workedExamples: [
        { body: "Для a=(1,2,−1), b=(3,0,4): a·b=1·3+2·0+(−1)·4=−1." }
      ]
    }
  };

export default patches;
