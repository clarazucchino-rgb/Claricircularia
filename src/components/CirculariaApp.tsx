"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chart, type ChartData, Plugin } from "chart.js/auto";

const STAGES = [
  {
    id: "diseno",
    num: "01",
    lbl: "Diseño",
    color: "#e8734a",
    title: "Etapa de diseño",
    desc: "Elección de materias primas, suministros, forma y comunicación del producto.",
    sections: [
      {
        id: "A",
        name: "A. Función — Materia prima",
        subsections: [
          {
            name: "A.1 Vida útil",
            type: "ó",
            opts: [
              { text: "Vida útil prolongada (10–15 años)", soc: 2, eco: 1, env: 1 },
              { text: "Vida útil corta (0–5 años)", soc: 0, eco: 0, env: -2 },
            ],
          },
          {
            name: "A.2 Tipología según origen",
            type: "ó",
            opts: [
              { text: "Local", soc: 2, eco: 1, env: 1 },
              { text: "Importado", soc: -1, eco: 0, env: -1 },
            ],
          },
          {
            name: "A.3 Tipología según composición",
            type: "y/o",
            opts: [
              { text: "Natural", soc: 1, eco: 0, env: 0 },
              { text: "Artificial", soc: -1, eco: 0, env: -1 },
              { text: "Sintético", soc: -1, eco: -1, env: -2 },
              { text: "Biodegradable <1 año", soc: 0, eco: 0, env: 2 },
              { text: "Biobasado", soc: 1, eco: 1, env: 1 },
              { text: "Orgánico", soc: 1, eco: 0, env: 1 },
              { text: "Reciclado", soc: 0, eco: 0, env: 2 },
              { text: "Reciclable (única MP)", soc: 2, eco: 2, env: 1 },
              { text: "Compostable domiciliario", soc: 1, eco: 0, env: 1 },
              { text: "Compostable industrial", soc: 0, eco: -1, env: 1 },
            ],
          },
        ],
      },
      {
        id: "B",
        name: "B. Forma",
        subsections: [
          {
            name: "B.1 Manufactura",
            type: "ó",
            opts: [
              { text: "Extranjera", soc: -1, eco: -1, env: -2 },
              { text: "Local", soc: 2, eco: 1, env: 2 },
              { text: "Mixta ≥50% local", soc: 1, eco: 1, env: 1 },
            ],
          },
          {
            name: "B.2 Proceso productivo",
            type: "ó",
            opts: [
              { text: "Industrial", soc: -1, eco: 0, env: -2 },
              { text: "Semi-industrial", soc: 0, eco: 0, env: 1 },
              { text: "Manual", soc: 1, eco: 1, env: 0 },
            ],
          },
          {
            name: "B.3 Generación de residuos",
            type: "ó",
            opts: [
              { text: "Con residuos >51%", soc: -1, eco: -2, env: -2 },
              { text: "Con residuos ≤50%", soc: -1, eco: -1, env: -1 },
              { text: "Sin residuos", soc: 0, eco: 1, env: 0 },
            ],
          },
        ],
      },
      {
        id: "C",
        name: "C. Comunicación — Certificaciones",
        subsections: [
          {
            name: "C.1 Certificaciones",
            type: "y/o",
            opts: [
              { text: "Animal Friendly", soc: 1, eco: 0, env: 0 },
              { text: "Denominación de origen", soc: 1, eco: 1, env: 1 },
              { text: "Comercio Justo", soc: 2, eco: 0, env: 0 },
              { text: "Fibras Naturales/Orgánicas", soc: 1, eco: 0, env: 1 },
              { text: "Economía Circular", soc: 1, eco: 1, env: 1 },
              { text: "Carbono neutral", soc: 0, eco: 0, env: 0 },
              { text: "Empresa B", soc: 2, eco: 0, env: 0 },
              { text: "Sin certificación", soc: -1, eco: -1, env: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "produccion",
    num: "02",
    lbl: "Producción",
    color: "#6b6ef5",
    title: "Etapa de producción",
    desc: "Procesos de fabricación, acabados y certificaciones del proceso productivo.",
    sections: [
      {
        id: "A",
        name: "A. Función",
        subsections: [
          {
            name: "A.1 Destino",
            type: "ó",
            opts: [
              { text: "Médico/quirúrgico", soc: 0, eco: 0, env: 0 },
              { text: "Deportivo", soc: 0, eco: 0, env: 0 },
              { text: "Street wear", soc: 0, eco: 0, env: 0 },
              { text: "Accesorios/complementos", soc: 0, eco: 0, env: 0 },
              { text: "Indumentaria técnica", soc: 0, eco: 0, env: 0 },
              { text: "Indumentaria infantil", soc: 0, eco: 0, env: 0 },
            ],
          },
          {
            name: "A.2 Tiempo de uso",
            type: "ó",
            opts: [
              { text: "Menos de 1 año", soc: -1, eco: -1, env: -3 },
              { text: "Entre 1 y 5 años", soc: -1, eco: -1, env: -2 },
              { text: "Entre 5 y 10 años", soc: -1, eco: -1, env: -1 },
              { text: "Más de 10 años", soc: 0, eco: 0, env: 0 },
            ],
          },
        ],
      },
      {
        id: "B",
        name: "B. Forma",
        subsections: [
          {
            name: "B.1 Técnica de producción",
            type: "ó",
            opts: [
              { text: "Artesanal", soc: 2, eco: 1, env: 1 },
              { text: "Manual", soc: 2, eco: 1, env: 1 },
              { text: "Semi-industrial", soc: 1, eco: 0, env: -1 },
              { text: "Industrial", soc: -1, eco: 0, env: -2 },
              { text: "Mixta", soc: 1, eco: 0, env: -1 },
            ],
          },
          {
            name: "B.2 Procedencia técnica",
            type: "ó",
            opts: [
              { text: "Local", soc: 1, eco: 1, env: 1 },
              { text: "Extranjera", soc: -1, eco: -1, env: -1 },
              { text: "Mixta", soc: 0, eco: 0, env: 0 },
            ],
          },
          {
            name: "B.3 Acabados",
            type: "y/o",
            opts: [
              { text: "Estampado", soc: -1, eco: -1, env: -1 },
              { text: "Teñido", soc: -1, eco: -1, env: -1 },
              { text: "Gofrado", soc: 0, eco: 0, env: -1 },
              { text: "Serigrafiado", soc: 0, eco: 0, env: -1 },
              { text: "Grabado láser", soc: 0, eco: -1, env: -1 },
              { text: "Sublimado", soc: 0, eco: 0, env: -1 },
              { text: "Impermeabilizado", soc: 0, eco: 0, env: -2 },
              { text: "Blanqueado", soc: -1, eco: 0, env: -2 },
              { text: "Lavado", soc: -1, eco: -2, env: -1 },
              { text: "Planchado", soc: 0, eco: 0, env: -1 },
              { text: "Foliado", soc: 0, eco: 0, env: -1 },
              { text: "Puffing", soc: -1, eco: 0, env: -1 },
              { text: "Glitter", soc: 0, eco: 0, env: -1 },
              { text: "Print al agua", soc: -1, eco: 0, env: -1 },
              { text: "Sin acabados", soc: 0, eco: 0, env: 0 },
            ],
          },
        ],
      },
      {
        id: "C",
        name: "C. Comunicación",
        subsections: [
          {
            name: "C.1 Certificaciones proceso",
            type: "y/o",
            opts: [
              { text: "Animal Friendly", soc: 1, eco: 0, env: 1 },
              { text: "Denominación origen", soc: 2, eco: 1, env: 0 },
              { text: "Comercio Justo", soc: 2, eco: 2, env: 0 },
              { text: "Fibras Orgánicas", soc: 1, eco: 0, env: 2 },
              { text: "Economía Circular", soc: 1, eco: 1, env: 2 },
              { text: "Carbono neutral", soc: 0, eco: 0, env: 2 },
              { text: "Empresa B", soc: 2, eco: 0, env: 0 },
              { text: "Otro", soc: 1, eco: 1, env: 1 },
              { text: "Sin certificación", soc: -1, eco: -1, env: -1 },
            ],
          },
          {
            name: "C.2 Patronaje",
            type: "y/o",
            opts: [
              { text: "Multitalla", soc: 2, eco: 0, env: 0 },
              { text: "No gender", soc: 2, eco: 0, env: 0 },
              { text: "Zero Waste", soc: 0, eco: 1, env: 2 },
              { text: "Patrón adaptativo", soc: 1, eco: 0, env: 0 },
              { text: "Patronaje tradicional", soc: 0, eco: 0, env: 0 },
              { text: "Para mascotas", soc: 1, eco: 0, env: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "consumo",
    num: "03",
    lbl: "Consumo",
    color: "#2de8a8",
    title: "Etapa de consumo",
    desc: "Canales de comercialización, distribución, packaging y etiquetado.",
    sections: [
      {
        id: "A",
        name: "A. Función — Canales",
        subsections: [
          {
            name: "Canal de venta",
            type: "ó",
            opts: [
              { text: "Online", soc: 0, eco: 0, env: 1 },
              { text: "Offline", soc: 0, eco: 0, env: -1 },
              { text: "Mixto", soc: 0, eco: 0, env: 0 },
            ],
          },
          {
            name: "Canal de distribución",
            type: "y/o",
            opts: [
              { text: "Aéreo", soc: 0, eco: -1, env: -3 },
              { text: "Marítimo", soc: 0, eco: 0, env: -2 },
              { text: "Terrestre automóvi", soc: 0, eco: 0, env: -1 },
              { text: "Bicicleta", soc: 0, eco: 0, env: 0 },
              { text: "Transporte público", soc: 0, eco: 0, env: -1 },
              { text: "Transporte eléctrico", soc: 0, eco: 0, env: -2 },
              { text: "Vehículo eléctrico", soc: 0, eco: 0, env: -1 },
              { text: "A pie", soc: 0, eco: 0, env: 0 },
            ],
          },
        ],
      },
      {
        id: "B",
        name: "B. Forma — Packaging",
        subsections: [
          {
            name: "Tipología",
            type: "ó",
            opts: [
              { text: "Plano", soc: 0, eco: 0, env: -1 },
              { text: "Apilable", soc: 0, eco: 0, env: -1 },
              { text: "Colgado", soc: 0, eco: 0, env: -1 },
              { text: "Ensamblable", soc: 0, eco: 0, env: 0 },
            ],
          },
          {
            name: "Composición",
            type: "y/o",
            opts: [
              { text: "Reutilizable", soc: 1, eco: 0, env: 1 },
              { text: "Reciclable", soc: 1, eco: 1, env: 1 },
              { text: "Biodegradable", soc: 0, eco: 0, env: 0 },
              { text: "Compostable industrial", soc: 0, eco: 1, env: 1 },
              { text: "Compostable domiciliario", soc: 1, eco: 0, env: 1 },
            ],
          },
        ],
      },
      {
        id: "C",
        name: "C. Comunicación",
        subsections: [
          {
            name: "Soportes",
            type: "y/o",
            opts: [
              { text: "Hang tag", soc: 0, eco: -1, env: -2 },
              { text: "Etiqueta marca", soc: 0, eco: -1, env: -1 },
              { text: "Etiqueta talla", soc: 0, eco: -1, env: -1 },
              { text: "Etiqueta cuidados", soc: 0, eco: -1, env: -2 },
              { text: "Fasco", soc: 0, eco: -1, env: -1 },
              { text: "Código QR", soc: 0, eco: 0, env: 0 },
              { text: "Código abierto", soc: 1, eco: 0, env: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "postconsumo",
    num: "04",
    lbl: "Postconsumo",
    color: "#e8c23a",
    title: "Etapa de postconsumo",
    desc: "Destino final del producto: biodegradabilidad, reciclaje, reutilización y garantías.",
    sections: [
      {
        id: "A",
        name: "A. Función — Fin de vida",
        subsections: [
          {
            name: "Destino al fin de vida",
            type: "y/o",
            opts: [
              { text: "Biodegradable", soc: 0, eco: 0, env: 2 },
              { text: "Reciclable", soc: 1, eco: 1, env: 1 },
              { text: "Reutilizable", soc: 1, eco: 0, env: 1 },
              { text: "Heredable", soc: 1, eco: 1, env: 1 },
              { text: "Garantía de por vida", soc: 1, eco: 1, env: 0 },
              { text: "Compostable industrial", soc: 0, eco: 1, env: 0 },
              { text: "Compostable domiciliario", soc: 1, eco: 0, env: 0 },
              { text: "Ninguno", soc: -1, eco: -1, env: -1 },
            ],
          },
        ],
      },
    ],
  },
];

type AnswersState = Record<string, Record<string, Record<number, Record<number, boolean>>>>;

const initialAnswers: AnswersState = {};
STAGES.forEach((stage) => {
  initialAnswers[stage.id] = {};
  stage.sections.forEach((section) => {
    initialAnswers[stage.id][section.id] = {};
    section.subsections.forEach((_, subIndex) => {
      initialAnswers[stage.id][section.id][subIndex] = {};
    });
  });
});

const initialPreloaded: AnswersState = {
  diseno: { A: { 0: { 0: true }, 1: { 0: true }, 2: { 0: true } }, B: { 0: { 1: true }, 1: { 2: true }, 2: { 2: true } }, C: { 0: { 1: true } } },
  produccion: { A: { 0: { 2: true }, 1: { 3: true } }, B: { 0: { 0: true }, 1: { 0: true }, 2: { 14: true } }, C: { 0: { 0: true } } },
  consumo: { A: { 0: { 1: true }, 1: { 0: true } }, B: { 0: { 0: true } }, C: { 0: { 0: true, 1: true, 2: true } } },
  postconsumo: { A: { 0: { 0: true, 1: true, 3: true } } },
};

const defaultFichaState = {
  cat: "Indumentaria",
  mer: "Femenino",
  seg: "Intermedio",
  orig: "Chile",
  etproy: "Ideación",
  esc: "Pequeña serie",
  tags: ["#lana-merino", "#artesanal", "#local", "#slow-fashion"],
};

const BASE = 5;
const RANGE = 8;

const glosario = [
  {
    word: "Economía circular",
    tag: "circular",
    category: "circular",
    definition: "Modelo económico que busca reducir residuos y maximizar el valor de los materiales durante el mayor tiempo posible.",
    related: ["reciclaje", "reutilización"],
  },
  {
    word: "Carbono neutral",
    tag: "ambiental",
    category: "ambiental",
    definition: "Estado en el que las emisiones generadas por una actividad son compensadas o eliminadas.",
    related: ["compensación"],
  },
  {
    word: "Comercio Justo",
    tag: "social",
    category: "social",
    definition: "Práctica comercial que busca condiciones de trabajo dignas y precios justos para productores y trabajadoras.",
    related: ["certificación"],
  },
];

function normalize(v: number) {
  return Math.max(0.2, Math.min(BASE * 2, BASE - (v / RANGE) * BASE));
}

export default function CirculariaApp() {
  const [page, setPage] = useState("home");
  const [ficha, setFicha] = useState(defaultFichaState);
  const [answers, setAnswers] = useState<AnswersState>(() => ({ ...initialAnswers, ...initialPreloaded }));
  const [curStage, setCurStage] = useState(0);
  const [showFicha, setShowFicha] = useState(true);
  const [zoomStage, setZoomStage] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [glosFilter, setGlosFilter] = useState("");
  const [glosCategory, setGlosCategory] = useState("todos");
  const radarRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef<HTMLCanvasElement | null>(null);
  const rChartRef = useRef<Chart | null>(null);
  const zoomChartRef = useRef<Chart | null>(null);

  const pageClasses = (target: string) => (page === target ? "page active" : "page");

  const glosList = glosario.filter((item) => {
    const matchCat = glosCategory === "todos" || item.category === glosCategory;
    const query = glosFilter.trim().toLowerCase();
    const matchText = !query || item.word.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query) || item.related.some((rel) => rel.includes(query));
    return matchCat && matchText;
  });

  const stageSummary = useMemo(() => STAGES.map((stage) => {
    const stageScore = stage.sections.reduce(
      (acc, section) => {
        section.subsections.forEach((sub, subIndex) => {
          sub.opts.forEach((opt, optIndex) => {
            if (answers[stage.id][section.id][subIndex]?.[optIndex]) {
              acc.soc += opt.soc;
              acc.eco += opt.eco;
              acc.env += opt.env;
            }
          });
        });
        return acc;
      },
      { soc: 0, eco: 0, env: 0 }
    );
    return { ...stageScore, total: stageScore.soc + stageScore.eco + stageScore.env, lbl: stage.lbl, color: stage.color, num: stage.num };
  }), [answers]);

  useEffect(() => {
    if (!radarRef.current) return;

    const plugin: Plugin = {
      id: "tri",
      beforeDraw(chart) {
        const rScale = chart.scales.r as unknown as
          | { xCenter: number; yCenter: number; drawingArea: number }
          | undefined;
        if (!rScale) return;
        const ctx = chart.ctx;
        const { xCenter: cx, yCenter: cy, drawingArea: R } = rScale;
        ctx.save();
        for (let i = 1; i <= 4; i += 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(20,18,14,0.15)";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
        ctx.restore();
      },
    };

    const data: ChartData = {
      labels: ["Diseño", "Producción", "Consumo", "Postconsumo"],
      datasets: [
        {
          label: "Ambiental",
          data: stageSummary.map((stage) => normalize(stage.env)),
          borderColor: "rgba(168,230,61,.9)",
          backgroundColor: "rgba(168,230,61,.15)",
          borderWidth: 1.8,
          pointRadius: 4,
          pointBackgroundColor: "#a8e63d",
          tension: 0.3,
        },
        {
          label: "Económico",
          data: stageSummary.map((stage) => normalize(stage.eco)),
          borderColor: "rgba(107,110,245,.9)",
          backgroundColor: "rgba(107,110,245,.13)",
          borderWidth: 1.8,
          pointRadius: 4,
          pointBackgroundColor: "#6b6ef5",
          tension: 0.3,
        },
        {
          label: "Social",
          data: stageSummary.map((stage) => normalize(stage.soc)),
          borderColor: "rgba(45,232,168,.9)",
          backgroundColor: "rgba(45,232,168,.12)",
          borderWidth: 1.8,
          pointRadius: 4,
          pointBackgroundColor: "#2de8a8",
          tension: 0.3,
        },
      ],
    };

    const chart = new Chart(radarRef.current, {
      type: "radar",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 380, easing: "easeInOutQuart" },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          r: {
            min: 0,
            max: BASE * 2,
            ticks: { display: false },
            grid: { color: "rgba(0,0,0,0)" },
            angleLines: { color: "rgba(20,18,14,.18)", lineWidth: 0.6 },
            pointLabels: {
              font: { size: 10, family: "Bai Jamjuree", weight: 500 },
              color: "#1a1f2e",
              padding: 10,
            },
          },
        },
      },
      plugins: [plugin],
    });

    rChartRef.current = chart;

    return () => chart.destroy();
  }, [stageSummary]);

  const renderZoom = useCallback((stageId: string) => {
    if (!zoomRef.current) return;
    const stage = STAGES.find((stage) => stage.id === stageId)!;

    const labels: string[] = [];
    const envData: number[] = [];
    const ecoData: number[] = [];
    const socData: number[] = [];

    stage.sections.forEach((section) => {
      section.subsections.forEach((sub, subIndex) => {
        const score = sub.opts.reduce(
          (acc, opt, optIndex) => {
            if (answers[stageId][section.id][subIndex]?.[optIndex]) {
              acc.soc += opt.soc;
              acc.eco += opt.eco;
              acc.env += opt.env;
            }
            return acc;
          },
          { soc: 0, eco: 0, env: 0 }
        );
        labels.push(sub.name.replace(/^[A-C]\.\d+\s/, "").substring(0, 24));
        socData.push(score.soc);
        ecoData.push(score.eco);
        envData.push(score.env);
      });
    });

    const data: ChartData = {
      labels,
      datasets: [
        { label: "Ambiental", data: envData, backgroundColor: "rgba(168,230,61,.6)", borderColor: "rgba(168,230,61,.9)", borderWidth: 1.5 },
        { label: "Económico", data: ecoData, backgroundColor: "rgba(107,110,245,.6)", borderColor: "rgba(107,110,245,.9)", borderWidth: 1.5 },
        { label: "Social", data: socData, backgroundColor: "rgba(45,232,168,.6)", borderColor: "rgba(45,232,168,.9)", borderWidth: 1.5 },
      ],
    };

    zoomChartRef.current?.destroy();
    zoomChartRef.current = new Chart(zoomRef.current, {
      type: "bar",
      data,
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 280 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255,255,255,.98)",
            titleColor: "#1a1f2e",
            bodyColor: "#6a6458",
            borderColor: "rgba(20,18,14,.2)",
            borderWidth: 1,
            titleFont: { family: "Bai Jamjuree", size: 10 },
            bodyFont: { family: "Bai Jamjuree", size: 11 },
            padding: 10,
            callbacks: {
              label(context) {
                const value = context.raw as number;
                return `${context.dataset.label}  ${value > 0 ? "+" : ""}${value}`;
              },
            },
          },
        },
        scales: {
          x: { min: -4, max: 4, grid: { color: "rgba(20,18,14,.12)" }, ticks: { color: "#6a6458", font: { size: 10, family: "Bai Jamjuree" } }, border: { color: "rgba(20,18,14,.15)" } },
          y: { grid: { color: "transparent" }, ticks: { color: "#1a1f2e", font: { size: 10, family: "Bai Jamjuree" } }, border: { color: "transparent" } },
        },
      },
    });
  }, [answers]);

  useEffect(() => {
    if (!rChartRef.current) return;
    rChartRef.current.data.datasets![0].data = stageSummary.map((stage) => normalize(stage.env));
    rChartRef.current.data.datasets![1].data = stageSummary.map((stage) => normalize(stage.eco));
    rChartRef.current.data.datasets![2].data = stageSummary.map((stage) => normalize(stage.soc));
    rChartRef.current.update();

    if (zoomStage) renderZoom(zoomStage);
  }, [renderZoom, stageSummary, zoomStage]);

  const handleToggleOption = (stageId: string, sectionId: string, subIndex: number, optIndex: number, isRadio: boolean) => {
    setAnswers((current) => {
      const next = structuredClone(current);
      if (isRadio) {
        Object.keys(next[stageId][sectionId][subIndex]).forEach((key) => {
          next[stageId][sectionId][subIndex][Number(key)] = false;
        });
      }
      next[stageId][sectionId][subIndex][optIndex] = !next[stageId][sectionId][subIndex][optIndex];
      return next;
    });
  };

  const renderStageTabs = () => {
    return (
      <>
        {STAGES.map((stage, index) => {
          const isActive = index === curStage;
          const isZoom = zoomStage === stage.id;
          const style = isZoom
            ? { borderColor: stage.color, backgroundColor: `${stage.color}18` }
            : isActive
            ? { borderColor: stage.color, backgroundColor: `${stage.color}0a` }
            : undefined;
          return (
            <div key={stage.id} className="stab" style={style} onClick={() => {
              setCurStage(index);
              setZoomStage((prev) => (prev === stage.id ? null : stage.id));
            }}>
              <div className="st-num" style={{ color: stage.color }}>{stage.num}</div>
              <div className="st-lbl" style={{ color: isActive || isZoom ? stage.color : undefined }}>{stage.lbl}</div>
            </div>
          );
        })}
      </>
    );
  };

  const renderStageContent = () => {
    const stage = STAGES[curStage];
    return (
      <>
        <div className="etag">{stage.num} — {stage.lbl}</div>
        <div className="etitle">{stage.title}</div>
        <div className="edesc">{stage.desc}</div>
        {stage.sections.map((section) => (
          <div key={section.id}>
            <div className="sec-head">{section.name}</div>
            {section.subsections.map((sub, subIndex) => (
              <div key={subIndex}>
                <div className="sub-head">{sub.name}</div>
                {sub.opts.map((opt, optIndex) => {
                  const selected = !!answers[stage.id][section.id][subIndex]?.[optIndex];
                  return (
                    <div
                      key={optIndex}
                      className={`qblock${selected ? " sel" : ""}`}
                      onClick={() => handleToggleOption(stage.id, section.id, subIndex, optIndex, sub.type === "ó")}
                    >
                      <div className="qtop">
                        <div className="qtext">{opt.text}</div>
                        <span className={`qtype ${sub.type === "y/o" ? "yo" : "o"}`}>{sub.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
        <div className="nav-btns">
          {curStage > 0 ? (
            <button className="btn" onClick={() => setCurStage((prev) => Math.max(prev - 1, 0))}>&larr; Anterior</button>
          ) : (
            <button className="btn" onClick={() => setShowFicha(true)}>&larr; Ficha</button>
          )}
          {curStage < STAGES.length - 1 ? (
            <button className="btn btn-p" onClick={() => setCurStage((prev) => Math.min(prev + 1, STAGES.length - 1))}>Siguiente &rarr;</button>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="page-shell">
      <nav className="nav">
        <div className="logo" onClick={() => setPage("home")}><span style={{ cursor: "pointer" }}>circularia</span><em>.</em></div>
        <div className="nav-links">
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Inicio</button>
          <button className={`nav-btn ${page === "eval" ? "active" : ""}`} onClick={() => setPage("eval")}>Evaluación</button>
          <button className={`nav-btn ${page === "port" ? "active" : ""}`} onClick={() => setPage("port")}>Portafolio</button>
          <button className={`nav-btn ${page === "glos" ? "active" : ""}`} onClick={() => setPage("glos")}>Glosario</button>
          <div className="nav-badge">prototipo</div>
        </div>
      </nav>

      <div className={pageClasses("home")} id="page-home">
        <div className="home-hero">
          <div className="home-logo-big">circularia<em>.</em></div>
          <p className="home-tagline">Plataforma de evaluación de impacto sostenible para equipos de diseño latinoamericanos. Mide, visualiza y mejora el perfil circular de tus productos — desde la primera decisión creativa.</p>
          <div className="home-what">
            <h2>¿Qué es Circularia?</h2>
            <p>Circularia es una plataforma tecnológica que acompaña al equipo de diseño en cada etapa del ciclo de vida del producto, midiendo su impacto real en tres dimensiones simultáneas: <strong>ambiental, económica y social</strong>.</p>
            <p>A diferencia de las herramientas globales de sostenibilidad — diseñadas para grandes corporaciones con equipos de ESG y presupuestos de consultora — Circularia fue construida desde y para la realidad productiva latinoamericana. Sin datos técnicos complejos, sin intermediarios, sin formación especializada previa.</p>
            <p>Cada evaluación genera un mapa de impacto visual interactivo y un reporte técnico exportable que funciona como instrumento de gestión interna, evidencia ante compradores y base para certificación.</p>
          </div>
          <div className="home-steps">
            <div className="step-card"><div className="step-num">01</div><div className="step-title">Ficha de proyecto</div><div className="step-desc">Registra el contexto del producto: categoría, mercado, origen y escala de producción.</div></div>
            <div className="step-card"><div className="step-num">02</div><div className="step-title">Evaluación guiada</div><div className="step-desc">Responde preguntas cualitativas por cada etapa del ciclo de vida. Sin datos técnicos.</div></div>
            <div className="step-card"><div className="step-num">03</div><div className="step-title">Mapa de impacto</div><div className="step-desc">El gráfico se actualiza en tiempo real identificando puntos críticos por dimensión.</div></div>
            <div className="step-card"><div className="step-num">04</div><div className="step-title">Reporte exportable</div><div className="step-desc">Descarga una ficha técnica con diagnóstico y recomendaciones priorizadas.</div></div>
          </div>
          <div className="home-dims">
            <div className="dim-card" style={{ borderColor: "#a8e63d", background: "#ffffff" }}>
              <h3 style={{ color: "#5a8a20" }}>Dimensión Ambiental</h3>
              <p style={{ color: "#4a6a18", fontSize: "11px", fontWeight: 300, lineHeight: 1.6 }}>Evalúa el origen de materiales, huella de carbono, generación de residuos y biodegradabilidad a lo largo del ciclo productivo.</p>
            </div>
            <div className="dim-card" style={{ borderColor: "#6b6ef5", background: "#ffffff" }}>
              <h3 style={{ color: "#4a4cca" }}>Dimensión Económica</h3>
              <p style={{ color: "#3a3a9a", fontSize: "11px", fontWeight: 300, lineHeight: 1.6 }}>Mide el impacto en cadenas de valor locales, costos reales de producción y riesgos económicos derivados de decisiones de diseño.</p>
            </div>
            <div className="dim-card" style={{ borderColor: "#2de8a8", background: "#ffffff" }}>
              <h3 style={{ color: "#0a7a52" }}>Dimensión Social</h3>
              <p style={{ color: "#0a5a3a", fontSize: "11px", fontWeight: 300, lineHeight: 1.6 }}>Considera condiciones laborales, preservación de saberes culturales y el impacto del producto en las comunidades productoras.</p>
            </div>
          </div>
          <div className="home-cta">
            <button className="cta-btn" onClick={() => { setPage("eval"); setShowFicha(true); }}>Iniciar evaluación →</button>
            <p className="home-legal">Prototipo funcional · Diseñado para la industria de la moda y diseño latinoamericano · Evaluación cualitativa</p>
          </div>
        </div>
      </div>

      <div className={pageClasses("eval")} id="page-eval">
        <div className="eval-layout">
          <div className="fp">
            {showFicha ? (
              <div id="ficha-block">
                <div className="slbl">Nuevo proyecto</div>
                <div className="stitle">Ficha de proyecto</div>
                <div className="sdesc">Categoriza el producto antes de iniciar la evaluación. El mapa de impacto se activa al comenzar.</div>
                <div className="field"><label>Categoría del producto</label><div className="chips">{["Indumentaria", "Calzado", "Complementos", "Joyería", "Accesorios"].map((option) => (
                  <div key={option} className={`chip ${ficha.cat === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, cat: option }))}>{option}</div>
                ))}</div></div>
                <div className="field"><label>Mercado destino</label><div className="chips">{["Femenino", "Masculino", "Unisex", "Infantil", "Mascotas"].map((option) => (
                  <div key={option} className={`chip ${ficha.mer === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, mer: option }))}>{option}</div>
                ))}</div></div>
                <div className="field"><label>Segmento de precio</label><div className="chips">{["Masivo", "Intermedio", "Premium", "Lujo"].map((option) => (
                  <div key={option} className={`chip ${ficha.seg === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, seg: option }))}>{option}</div>
                ))}</div></div>
                <div className="field"><label>País / región de origen</label><div className="chips">{["Chile", "Argentina", "Colombia", "México", "Perú", "Brasil", "Otro Latam"].map((option) => (
                  <div key={option} className={`chip ${ficha.orig === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, orig: option }))}>{option}</div>
                ))}</div></div>
                <div className="field"><label>Etapa del proyecto</label><div className="chips">{["Ideación", "Prototipo", "Producción", "En mercado", "Relanzamiento"].map((option) => (
                  <div key={option} className={`chip ${ficha.etproy === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, etproy: option }))}>{option}</div>
                ))}</div></div>
                <div className="field"><label>Escala de producción</label><div className="chips">{["Única pieza", "Pequeña serie", "Colección", "Producción continua"].map((option) => (
                  <div key={option} className={`chip ${ficha.esc === option ? "sel" : ""}`} onClick={() => setFicha((prev) => ({ ...prev, esc: option }))}>{option}</div>
                ))}</div></div>
                <div className="field">
                  <label># Palabras clave</label>
                  <div className="hash-wrap" id="hash-wrap">
                    {ficha.tags.map((tag) => (
                      <div key={tag} className="hashtag">{tag}<span className="rm" onClick={() => setFicha((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}>&#215;</span></div>
                    ))}
                    <input
                      id="hash-inp"
                      className="hash-input"
                      placeholder="+ agregar..."
                      maxLength={30}
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === ",") && tagInput.trim()) {
                          event.preventDefault();
                          const value = tagInput.trim().startsWith("#") ? tagInput.trim() : `#${tagInput.trim()}`;
                          if (!ficha.tags.includes(value)) {
                            setFicha((prev) => ({ ...prev, tags: [...prev.tags, value] }));
                          }
                          setTagInput("");
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="nav-btns">
                  <button className="btn btn-p" onClick={() => { setShowFicha(false); setPage("eval"); }}>Iniciar evaluación →</button>
                </div>
              </div>
            ) : (
              <div id="stages-block">
                <div className="enav" id="enav">{renderStageTabs()}</div>
                <div id="stage-content">{renderStageContent()}</div>
              </div>
            )}
          </div>
          <div className="cp" id="cp">
            <div className="cm-name" style={{ color: "#1a1f2e" }}>{`${ficha.cat} · ${ficha.mer}`}</div>
            <div className="cm-sub" style={{ color: "#6a6458" }}>Mapa de impacto — tiempo real</div>
            <div className="stage-tabs" id="stage-tabs">{renderStageTabs()}</div>
            <div className="radar-wrap" id="radar-view" style={{ display: zoomStage ? "none" : "flex" }}>
              <canvas id="rc" ref={radarRef} width={280} height={280} />
            </div>
            <div className="zoom-wrap" id="zoom-view" style={{ display: zoomStage ? "flex" : "none" }}>
              <div className="zoom-header">
                <div className="zoom-back" onClick={() => setZoomStage(null)}>&larr; Mapa completo</div>
                <div className="zoom-title" id="zoom-title" style={{ color: STAGES.find((s) => s.id === zoomStage)?.color || "#000" }}>{`Detalle — ${STAGES.find((s) => s.id === zoomStage)?.lbl ?? ""}`}</div>
              </div>
              <div className="zoom-arc"><canvas id="zc" ref={zoomRef} style={{ width: "100%", minHeight: "280px" }} /></div>
            </div>
            <div className="dim-legend">
              <div className="leg"><div className="leg-d" style={{ background: "#a8e63d" }}></div><span style={{ color: "#5a8a20" }}>Ambiental</span></div>
              <div className="leg"><div className="leg-d" style={{ background: "#6b6ef5" }}></div><span style={{ color: "#6b6ef5" }}>Económico</span></div>
              <div className="leg"><div className="leg-d" style={{ background: "#2de8a8" }}></div><span style={{ color: "#1a9a72" }}>Social</span></div>
            </div>
            <div className="reading-key">
              <div className="rk-side">
                <div className="rk-row">
                  <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="none" stroke="#1a1f2e" strokeWidth=".8"/><circle cx="14" cy="14" r="6" fill="none" stroke="#1a1f2e" strokeWidth=".5" strokeDasharray="2 2"/><line x1="14" y1="2" x2="14" y2="26" stroke="#1a1f2e" strokeWidth=".5"/><line x1="2" y1="14" x2="26" y2="14" stroke="#1a1f2e" strokeWidth=".5"/><polygon points="14,7 18,17 10,17" fill="rgba(45,232,168,.2)" stroke="#2de8a8" strokeWidth=".9"/></svg>
                  <div className="rk-text" style={{ color: "#1a9a72" }}><strong>Contenido</strong> = sostenible</div>
                </div>
                <div className="rk-row">
                  <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="none" stroke="#1a1f2e" strokeWidth=".8"/><circle cx="14" cy="14" r="6" fill="none" stroke="#1a1f2e" strokeWidth=".5" strokeDasharray="2 2"/><line x1="14" y1="2" x2="14" y2="26" stroke="#1a1f2e" strokeWidth=".5"/><line x1="2" y1="14" x2="26" y2="14" stroke="#1a1f2e" strokeWidth=".5"/><polygon points="14,3 25,20 5,22" fill="rgba(232,115,74,.18)" stroke="#e8734a" strokeWidth=".9"/></svg>
                  <div className="rk-text" style={{ color: "#c05a30" }}><strong>Expandido</strong> = revisar</div>
                </div>
              </div>
              <div className="rk-div"></div>
              <div className="rk-info">
                <div className="rk-info-row" style={{ fontSize: "8px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#a8a49c", marginBottom: 3 }}>Cómo leer</div>
                <div className="rk-info-row"><div className="rk-dot" style={{ background: "#a8e63d" }}></div>Buenas decisiones contraen el gráfico</div>
                <div className="rk-info-row"><div className="rk-dot" style={{ background: "#e8734a" }}></div>Decisiones negativas lo expanden</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={pageClasses("port")} id="page-port">
        <div className="port-wrap">
          <div className="port-header">
            <div className="slbl">Repositorio</div>
            <h1>Portafolio de proyectos</h1>
            <p>Historial de evaluaciones realizadas. Cada tarjeta muestra el perfil de circularidad del producto y su estado de avance.</p>
          </div>
          <div className="port-grid" id="port-grid">
            <div className="port-card"><div className="port-card-top"><span className="port-cat">Indumentaria · Femenino</span><div className="port-score"><div className="port-dot" style={{ background: "#a8e63d" }}></div><div className="port-dot" style={{ background: "#a8e63d" }}></div><div className="port-dot" style={{ background: "#e8c23a" }}></div><div className="port-dot" style={{ background: "#e8c23a" }}></div></div></div><div className="port-name">Colección Raíces</div><div className="port-prod">Chaqueta lana merino</div><div className="port-dims"><span className="port-dim" style={{ background: "#eef8e0", color: "#4a7a10" }}>Ambiental +6</span><span className="port-dim" style={{ background: "#eeeffe", color: "#4a4cca" }}>Económico +4</span><span className="port-dim" style={{ background: "#fef3ea", color: "#c05a30" }}>Social −2</span></div><div className="port-footer"><span className="port-date">Mar 2025 · Chile</span><span className="port-status" style={{ borderColor: "#a8e63d", color: "#5a8a20" }}>Completado</span></div></div>
            <div className="port-card"><div className="port-card-top"><span className="port-cat">Calzado · Unisex</span><div className="port-score"><div className="port-dot" style={{ background: "#e8c23a" }}></div><div className="port-dot" style={{ background: "#e8c23a" }}></div><div className="port-dot" style={{ background: "#e8734a" }}></div></div></div><div className="port-name">Proyecto Pampa</div><div className="port-prod">Zapatilla cuero vegetal</div><div className="port-dims"><span className="port-dim" style={{ background: "#eef8e0", color: "#4a7a10" }}>Ambiental +2</span><span className="port-dim" style={{ background: "#fef5e0", color: "#8a6a10" }}>Económico 0</span><span className="port-dim" style={{ background: "#fef3ea", color: "#c05a30" }}>Social −3</span></div><div className="port-footer"><span className="port-date">Ene 2025 · Argentina</span><span className="port-status" style={{ borderColor: "#e8c23a", color: "#8a6a10" }}>En revisión</span></div></div>
            <div className="port-card"><div className="port-card-top"><span className="port-cat">Accesorios · Unisex</span><div className="port-score"><div className="port-dot" style={{ background: "#a8e63d" }}></div><div className="port-dot" style={{ background: "#a8e63d" }}></div><div className="port-dot" style={{ background: "#a8e63d" }}></div></div></div><div className="port-name">Série Wayuu</div><div className="port-prod">Bolso tejido artesanal</div><div className="port-dims"><span className="port-dim" style={{ background: "#eef8e0", color: "#4a7a10" }}>Ambiental +8</span><span className="port-dim" style={{ background: "#eef8e0", color: "#4a7a10" }}>Económico +6</span><span className="port-dim" style={{ background: "#eef8e0", color: "#4a7a10" }}>Social +7</span></div><div className="port-footer"><span className="port-date">Feb 2025 · Colombia</span><span className="port-status" style={{ borderColor: "#a8e63d", color: "#5a8a20" }}>Completado</span></div></div>
          </div>
          <div className="port-add"><button className="btn btn-p" onClick={() => { setPage("eval"); setShowFicha(true); }} style={{ marginTop: 24 }}>+ Nueva evaluación</button></div>
        </div>
      </div>

      <div className={pageClasses("glos")} id="page-glos">
        <div className="glos-wrap">
          <div className="glos-header">
            <div className="slbl">Referencia</div>
            <h1>Glosario de sostenibilidad</h1>
            <p>Términos clave de economía circular, sostenibilidad y regulación aplicados al diseño y la producción en América Latina.</p>
          </div>
          <div className="glos-search">
            <input
              type="text"
              id="glos-input"
              placeholder="Buscar término..."
              value={glosFilter}
              onChange={(event) => setGlosFilter(event.target.value)}
            />
          </div>
          <div className="glos-cats">
            {[
              { id: "todos", label: "Todos" },
              { id: "circular", label: "Economía circular" },
              { id: "ambiental", label: "Ambiental" },
              { id: "regulacion", label: "Regulación" },
              { id: "social", label: "Social" },
              { id: "diseno", label: "Diseño" },
            ].map((cat) => (
              <button
                key={cat.id}
                className={`glos-cat ${glosCategory === cat.id ? "active" : ""}`}
                onClick={() => setGlosCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="glos-list" id="glos-list">
            {glosList.length ? glosList.map((item) => (
              <div key={item.word} className="glos-item">
                <div className="glos-term">
                  <div className="glos-word">{item.word}</div>
                  <div className="glos-tag">{item.category}</div>
                </div>
                <div className="glos-def">{item.definition}</div>
                <div className="glos-rel">Ver también <span>{item.related.join(", ")}</span></div>
              </div>
            )) : (
              <div className="no-results">No se encontraron términos para esa búsqueda.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
