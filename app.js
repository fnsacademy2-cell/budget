/**
 * MARIE ADELAIDE LEPROSY CENTRE
 * FORECAST 2026 & BUDGET 2027
 * Financial Engine & Interactive Executive Dashboard
 */

// Master Financial Model Data (Values in PKR Million, exactly matching PPT)
const FINANCIAL_DATA = {
  metadata: {
    title: "MARIE ADELAIDE LEPROSY CENTRE",
    presentationTitle: "FORECAST 2026 & BUDGET 2027",
    subtitle: "Financial overview, budget assumptions and key variances",
    period: "1 January – 31 December 2027",
    currency: "PKR",
    unit: "million"
  },
  macro: {
    revenue: { forecast2026: 1126.48, budget2027: 1253.83, change: 127.35, growth: 11.31 },
    expenditure: { forecast2026: 1114.97, budget2027: 1252.44, change: 137.47, growth: 12.33 },
    surplus: { forecast2026: 11.51, budget2027: 1.39, change: -10.12, growth: -87.92 }
  },
  revenueStreams: [
    {
      id: "govt",
      name: "Government of Sindh / DEPD",
      forecast2026: 491.20,
      budget2027: 572.30,
      change: 81.10,
      growth: 17,
      share2027: 45.64,
      subItems: [
        { name: "Government of Sindh Grant", amount: 250.00, share: 43.68 },
        { name: "DEPD Grant", amount: 321.80, share: 56.32 }
      ],
      color: "#3b82f6"
    },
    {
      id: "foreign",
      name: "Foreign donations",
      forecast2026: 428.81,
      budget2027: 465.34,
      change: 36.53,
      growth: 9,
      share2027: 37.11,
      subItems: [
        { name: "CBM", note: "Anticipated project activities" },
        { name: "Fred Hollows Foundation", note: "Avoidable blindness" },
        { name: "WHO", note: "Donor funding & health" }
      ],
      color: "#06b6d4"
    },
    {
      id: "local",
      name: "Local donations",
      forecast2026: 122.63,
      budget2027: 125.59,
      change: 2.96,
      growth: 2,
      share2027: 10.02,
      subItems: [
        { name: "Local giving base", amount: 125.59 }
      ],
      color: "#14b8a6"
    },
    {
      id: "zakat",
      name: "Zakat",
      forecast2026: 41.23,
      budget2027: 50.00,
      change: 8.77,
      growth: 21,
      share2027: 3.99,
      subItems: [
        { name: "Zakat target", note: "Requires focused fundraising and donor engagement" }
      ],
      color: "#f59e0b"
    },
    {
      id: "other_income",
      name: "Other income",
      forecast2026: 42.61,
      budget2027: 40.60,
      change: -2.01,
      growth: -5,
      share2027: 3.24,
      subItems: [
        { name: "Bank interest" },
        { name: "Patient contributions" },
        { name: "Asset disposals" },
        { name: "Miscellaneous receipts" }
      ],
      color: "#8b5cf6"
    }
  ],
  expenditureCategories: [
    {
      id: "salaries",
      name: "Salaries",
      forecast2026: 445.29,
      budget2027: 528.09,
      change: 82.80,
      growth: 19,
      share2027: 42.16,
      drivers: [
        "Proposed 12% salary adjustment",
        "Additional recruitment for new projects"
      ],
      color: "#ef4444"
    },
    {
      id: "operations",
      name: "Operational expenses",
      forecast2026: 551.95,
      budget2027: 603.55,
      change: 51.60,
      growth: 9,
      share2027: 48.19,
      drivers: [
        "Expanded CBM and DEPD activities",
        "Medical supplies",
        "Anticipated inflation"
      ],
      color: "#f97316"
    },
    {
      id: "capex",
      name: "Capital expenditure",
      forecast2026: 56.39,
      budget2027: 59.09,
      change: 2.69,
      growth: 5,
      share2027: 4.72,
      drivers: [
        "Medical equipment and office equipment",
        "Partly offset by lower vehicle allocation"
      ],
      color: "#6366f1"
    },
    {
      id: "admin",
      name: "Administration",
      forecast2026: 61.34,
      budget2027: 61.71,
      change: 0.38,
      growth: 1,
      share2027: 4.93,
      drivers: [
        "Higher audit fees and depreciation",
        "Partly offset by lower office expenses"
      ],
      color: "#94a3b8"
    }
  ]
};

// Global App State
const state = {
  unit: "million", // 'million', 'thousand', 'raw'
  charts: {},
  resolvedAuditChecks: JSON.parse(localStorage.getItem('malc_resolved_audits_v2') || '[]'),
  simParams: {
    govtPct: 100,
    foreignPct: 100,
    zakatPct: 100,
    salaryIncPct: 12,
    opsInflationPct: 0
  }
};

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initLandingPage();
  initTheme();
  initTabs();
  initUnitSelector();
  initCharts();
  initSimulator();
  initAuditChecklist();
  initActionButtons();
  renderKPIs();
});

// ==========================================================================
// Slide 1 Landing Page & Navigation Transitions
// ==========================================================================

function initLandingPage() {
  const enterBtn = document.getElementById("enterDashboardBtn");
  const returnBtn = document.getElementById("returnToLandingBtn");
  const landingWhatIfBtn = document.getElementById("landingWhatIfBtn");
  const landingSlideDeckBtn = document.getElementById("landingSlideDeckBtn");

  const enterDashboard = (targetTab = null) => {
    document.body.classList.remove("landing-active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (targetTab) {
      switchTab(targetTab);
    }

    // Trigger chart resize once revealed
    setTimeout(() => {
      resizeAllCharts();
    }, 150);
  };

  if (enterBtn) {
    enterBtn.addEventListener("click", () => enterDashboard());
  }

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      document.body.classList.add("landing-active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (landingWhatIfBtn) {
    landingWhatIfBtn.addEventListener("click", () => enterDashboard("tab-simulator"));
  }

  if (landingSlideDeckBtn) {
    landingSlideDeckBtn.addEventListener("click", () => enterDashboard("tab-glance"));
  }
}

function resizeAllCharts() {
  Object.values(state.charts).forEach((chart) => {
    if (chart && chart.resize) {
      chart.resize();
    }
  });
}

// ==========================================================================
// Number Formatting & Currency Units
// ==========================================================================

function formatCurrency(valInMillions, includeCurrency = true, decimals = 2) {
  let val = valInMillions;
  let suffix = "m";

  if (state.unit === "thousand") {
    val = valInMillions * 1000;
    suffix = "k";
  } else if (state.unit === "raw") {
    val = valInMillions * 1000000;
    suffix = "";
  }

  const formattedNum = val.toLocaleString("en-US", {
    minimumFractionDigits: state.unit === "raw" ? 0 : decimals,
    maximumFractionDigits: state.unit === "raw" ? 0 : decimals
  });

  const prefix = includeCurrency ? "PKR " : "";
  return `${prefix}${formattedNum}${suffix ? suffix : ''}`;
}

function initUnitSelector() {
  const select = document.getElementById("currencyUnit");
  if (!select) return;

  select.addEventListener("change", (e) => {
    state.unit = e.target.value;
    renderKPIs();
    updateMasterTable();
    recalculateSimulator();
    updateChartsUnit();
  });
}

function renderKPIs() {
  const kpiRev = document.getElementById("kpiRevenue");
  const kpiExp = document.getElementById("kpiExpenditure");
  const kpiSurp = document.getElementById("kpiSurplus");
  const kpiPrior = document.getElementById("kpiPriorSurplus");

  if (kpiRev) kpiRev.textContent = formatCurrency(FINANCIAL_DATA.macro.revenue.budget2027);
  if (kpiExp) kpiExp.textContent = formatCurrency(FINANCIAL_DATA.macro.expenditure.budget2027);
  if (kpiSurp) kpiSurp.textContent = formatCurrency(FINANCIAL_DATA.macro.surplus.budget2027);
  if (kpiPrior) kpiPrior.textContent = formatCurrency(FINANCIAL_DATA.macro.surplus.forecast2026);
}

function updateMasterTable() {
  const table = document.getElementById("masterSummaryTable");
  if (!table) return;

  // Format table rows
  const formatCell = (rowIdx, colIdx, val, withSign = false) => {
    const row = table.querySelectorAll("tbody tr")[rowIdx];
    if (!row) return;
    const cell = row.querySelectorAll("td")[colIdx];
    if (!cell) return;
    const sign = withSign && val > 0 ? "+" : "";
    cell.textContent = `${sign}${formatCurrency(val, false)}`;
  };

  // Revenues
  formatCell(1, 1, FINANCIAL_DATA.revenueStreams[0].forecast2026);
  formatCell(1, 2, FINANCIAL_DATA.revenueStreams[0].budget2027);
  formatCell(1, 3, FINANCIAL_DATA.revenueStreams[0].change, true);

  formatCell(2, 1, FINANCIAL_DATA.revenueStreams[1].forecast2026);
  formatCell(2, 2, FINANCIAL_DATA.revenueStreams[1].budget2027);
  formatCell(2, 3, FINANCIAL_DATA.revenueStreams[1].change, true);

  formatCell(3, 1, FINANCIAL_DATA.revenueStreams[2].forecast2026);
  formatCell(3, 2, FINANCIAL_DATA.revenueStreams[2].budget2027);
  formatCell(3, 3, FINANCIAL_DATA.revenueStreams[2].change, true);

  formatCell(4, 1, FINANCIAL_DATA.revenueStreams[3].forecast2026);
  formatCell(4, 2, FINANCIAL_DATA.revenueStreams[3].budget2027);
  formatCell(4, 3, FINANCIAL_DATA.revenueStreams[3].change, true);

  formatCell(5, 1, FINANCIAL_DATA.revenueStreams[4].forecast2026);
  formatCell(5, 2, FINANCIAL_DATA.revenueStreams[4].budget2027);
  formatCell(5, 3, FINANCIAL_DATA.revenueStreams[4].change);

  formatCell(6, 1, FINANCIAL_DATA.macro.revenue.forecast2026);
  formatCell(6, 2, FINANCIAL_DATA.macro.revenue.budget2027);
  formatCell(6, 3, FINANCIAL_DATA.macro.revenue.change, true);

  // Expenditures
  formatCell(8, 1, FINANCIAL_DATA.expenditureCategories[0].forecast2026);
  formatCell(8, 2, FINANCIAL_DATA.expenditureCategories[0].budget2027);
  formatCell(8, 3, FINANCIAL_DATA.expenditureCategories[0].change, true);

  formatCell(9, 1, FINANCIAL_DATA.expenditureCategories[1].forecast2026);
  formatCell(9, 2, FINANCIAL_DATA.expenditureCategories[1].budget2027);
  formatCell(9, 3, FINANCIAL_DATA.expenditureCategories[1].change, true);

  formatCell(10, 1, FINANCIAL_DATA.expenditureCategories[2].forecast2026);
  formatCell(10, 2, FINANCIAL_DATA.expenditureCategories[2].budget2027);
  formatCell(10, 3, FINANCIAL_DATA.expenditureCategories[2].change, true);

  formatCell(11, 1, FINANCIAL_DATA.expenditureCategories[3].forecast2026);
  formatCell(11, 2, FINANCIAL_DATA.expenditureCategories[3].budget2027);
  formatCell(11, 3, FINANCIAL_DATA.expenditureCategories[3].change, true);

  formatCell(12, 1, FINANCIAL_DATA.macro.expenditure.forecast2026);
  formatCell(12, 2, FINANCIAL_DATA.macro.expenditure.budget2027);
  formatCell(12, 3, FINANCIAL_DATA.macro.expenditure.change, true);

  // Surplus
  formatCell(13, 1, FINANCIAL_DATA.macro.surplus.forecast2026);
  formatCell(13, 2, FINANCIAL_DATA.macro.surplus.budget2027);
  formatCell(13, 3, FINANCIAL_DATA.macro.surplus.change);
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const savedTheme = localStorage.getItem("malc_theme") || "theme-dark";
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(savedTheme);

  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("theme-dark");
    const newTheme = isDark ? "theme-light" : "theme-dark";
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(newTheme);
    localStorage.setItem("malc_theme", newTheme);

    updateChartsTheme();
  });
}

// ==========================================================================
// Tab Switching (Exact Slide Sequence)
// ==========================================================================

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach((b) => {
    const isTarget = b.getAttribute("data-tab") === tabId;
    b.classList.toggle("active", isTarget);
    b.setAttribute("aria-selected", isTarget ? "true" : "false");
  });

  tabPanes.forEach((p) => {
    p.classList.toggle("active", p.id === tabId);
  });

  setTimeout(() => {
    resizeAllCharts();
  }, 100);
}

// ==========================================================================
// Chart.js Visualizations
// ==========================================================================

function getChartTextColor() {
  return document.body.classList.contains("theme-light") ? "#475569" : "#94a3b8";
}

function getChartGridColor() {
  return document.body.classList.contains("theme-light") ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
}

function initCharts() {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded. Skipping canvas charts.");
    return;
  }

  // Register DataLabels plugin if loaded
  if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
  }

  // Register Doughnut Center Total Plugin
  Chart.register({
    id: "centerTotalPlugin",
    beforeDraw: (chart) => {
      if (chart.config.type !== "doughnut") return;
      const centerConfig = chart.config.options?.plugins?.centerTotal;
      if (!centerConfig) return;

      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      const isLight = document.body.classList.contains("theme-light");

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Sub-label (e.g. TOTAL REVENUE)
      ctx.font = "700 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = isLight ? "#64748b" : "#94a3b8";
      ctx.fillText(centerConfig.title || "TOTAL", centerX, centerY - 9);

      // Main Total Value (e.g. PKR 1,253.83m)
      ctx.font = "800 14px 'JetBrains Mono', monospace";
      ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
      const valText = typeof centerConfig.text === "function" ? centerConfig.text() : centerConfig.text;
      ctx.fillText(valText, centerX, centerY + 11);

      ctx.restore();
    }
  });

  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = getChartTextColor();

  buildOverviewMacroChart();
  buildWaterfallChart();
  buildRevenueCharts();
  buildExpenditureCharts();
  buildSimulationChart();
}

let isSurplusZoomView = false;

function buildOverviewMacroChart() {
  const ctx = document.getElementById("overviewMacroChart");
  if (!ctx) return;

  state.charts.macro = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Revenue", "Expenditure", "Surplus"],
      datasets: [
        {
          label: "2026 forecast",
          data: [
            FINANCIAL_DATA.macro.revenue.forecast2026,
            FINANCIAL_DATA.macro.expenditure.forecast2026,
            FINANCIAL_DATA.macro.surplus.forecast2026
          ],
          backgroundColor: ["rgba(148, 163, 184, 0.45)", "rgba(148, 163, 184, 0.45)", "rgba(16, 185, 129, 0.55)"],
          borderColor: ["rgba(148, 163, 184, 0.8)", "rgba(148, 163, 184, 0.8)", "#10b981"],
          borderWidth: 1.5,
          borderRadius: 6,
          minBarLength: 18
        },
        {
          label: "2027 budget",
          data: [
            FINANCIAL_DATA.macro.revenue.budget2027,
            FINANCIAL_DATA.macro.expenditure.budget2027,
            FINANCIAL_DATA.macro.surplus.budget2027
          ],
          backgroundColor: ["#3b82f6", "#ef4444", "#f59e0b"],
          borderColor: ["#2563eb", "#dc2626", "#d97706"],
          borderWidth: 1.5,
          borderRadius: 6,
          minBarLength: 18
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { boxWidth: 14 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
          }
        },
        datalabels: {
          anchor: "end",
          align: "top",
          offset: 3,
          font: { family: "'JetBrains Mono', monospace", weight: "700", size: 10 },
          color: () => getChartTextColor(),
          formatter: (val) => formatCurrency(val, false)
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grace: "15%",
          grid: { color: getChartGridColor() },
          ticks: { callback: (val) => `${val}m` }
        }
      }
    }
  });
}

function toggleMacroSurplusView() {
  const chart = state.charts.macro;
  const btn = document.getElementById("toggleSurplusViewBtn");
  if (!chart || !btn) return;

  isSurplusZoomView = !isSurplusZoomView;

  if (isSurplusZoomView) {
    btn.innerHTML = "<span>📊 Full Macro View</span>";
    btn.classList.add("active");
    btn.title = "Return to full Revenue, Expenditure & Surplus view";

    chart.data.labels = ["Operating Surplus (PKR m)"];
    chart.data.datasets[0].label = "2026 forecast surplus";
    chart.data.datasets[0].data = [FINANCIAL_DATA.macro.surplus.forecast2026];
    chart.data.datasets[0].backgroundColor = "rgba(16, 185, 129, 0.65)";
    chart.data.datasets[0].borderColor = "#10b981";
    chart.data.datasets[0].minBarLength = 0;

    chart.data.datasets[1].label = "2027 budget surplus";
    chart.data.datasets[1].data = [FINANCIAL_DATA.macro.surplus.budget2027];
    chart.data.datasets[1].backgroundColor = "rgba(245, 158, 11, 0.75)";
    chart.data.datasets[1].borderColor = "#f59e0b";
    chart.data.datasets[1].minBarLength = 0;

    chart.options.scales.y.max = 14;
    chart.options.scales.y.grace = "10%";
  } else {
    btn.innerHTML = "<span>🔍 Surplus Zoom View</span>";
    btn.classList.remove("active");
    btn.title = "Zoom into Operating Surplus comparison";

    chart.data.labels = ["Revenue", "Expenditure", "Surplus"];
    chart.data.datasets[0].label = "2026 forecast";
    chart.data.datasets[0].data = [
      FINANCIAL_DATA.macro.revenue.forecast2026,
      FINANCIAL_DATA.macro.expenditure.forecast2026,
      FINANCIAL_DATA.macro.surplus.forecast2026
    ];
    chart.data.datasets[0].backgroundColor = [
      "rgba(148, 163, 184, 0.45)",
      "rgba(148, 163, 184, 0.45)",
      "rgba(16, 185, 129, 0.55)"
    ];
    chart.data.datasets[0].borderColor = [
      "rgba(148, 163, 184, 0.8)",
      "rgba(148, 163, 184, 0.8)",
      "#10b981"
    ];
    chart.data.datasets[0].minBarLength = 18;

    chart.data.datasets[1].label = "2027 budget";
    chart.data.datasets[1].data = [
      FINANCIAL_DATA.macro.revenue.budget2027,
      FINANCIAL_DATA.macro.expenditure.budget2027,
      FINANCIAL_DATA.macro.surplus.budget2027
    ];
    chart.data.datasets[1].backgroundColor = ["#3b82f6", "#ef4444", "#f59e0b"];
    chart.data.datasets[1].borderColor = ["#2563eb", "#dc2626", "#d97706"];
    chart.data.datasets[1].minBarLength = 18;

    delete chart.options.scales.y.max;
    chart.options.scales.y.grace = "15%";
  }

  chart.update();
}

function buildWaterfallChart() {
  const ctx = document.getElementById("waterfallChart");
  if (!ctx) return;

  state.charts.waterfall = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["2027 Inflows", "Salaries", "Operations", "CapEx", "Admin", "Surplus"],
      datasets: [
        {
          label: "Base Spacer",
          data: [0, 725.74, 122.19, 63.10, 1.39, 0],
          backgroundColor: "transparent",
          hoverBackgroundColor: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
          datalabels: { display: false }
        },
        {
          label: "Flow Amount",
          data: [1253.83, 528.09, 603.55, 59.09, 61.71, 1.39],
          backgroundColor: [
            "#10b981", // Revenue Inflows
            "#ef4444", // Salaries
            "#f97316", // Operations
            "#6366f1", // CapEx
            "#94a3b8", // Admin
            "#f59e0b"  // Net Surplus
          ],
          borderRadius: 6,
          datalabels: {
            anchor: "end",
            align: "top",
            offset: 3,
            font: { family: "'JetBrains Mono', monospace", weight: "700", size: 10 },
            color: () => getChartTextColor(),
            formatter: (val, ctx) => {
              if (ctx.dataIndex === 0) return formatCurrency(val, false);
              if (ctx.dataIndex === 5) return `+${formatCurrency(val, false)}`;
              return `-${formatCurrency(val, false)}`;
            }
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          filter: (item) => item.datasetIndex === 1,
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed.y;
              if (ctx.dataIndex === 0) return `Total 2027 Revenue: ${formatCurrency(val)}`;
              if (ctx.dataIndex === 5) return `Projected Surplus: ${formatCurrency(val)}`;
              return `${ctx.label}: -${formatCurrency(val)}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false }
        },
        y: {
          stacked: true,
          grace: "15%",
          grid: { color: getChartGridColor() },
          ticks: { callback: (val) => `${val}m` }
        }
      }
    }
  });
}

function buildRevenueCharts() {
  const pieCtx = document.getElementById("revenuePieChart");
  if (pieCtx) {
    state.charts.revPie = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: FINANCIAL_DATA.revenueStreams.map((s) => s.name),
        datasets: [
          {
            data: FINANCIAL_DATA.revenueStreams.map((s) => s.budget2027),
            backgroundColor: FINANCIAL_DATA.revenueStreams.map((s) => s.color),
            borderWidth: 2,
            borderColor: "rgba(0,0,0,0.2)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } },
          centerTotal: {
            title: "TOTAL REVENUE",
            text: () => formatCurrency(FINANCIAL_DATA.macro.revenue.budget2027)
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const stream = FINANCIAL_DATA.revenueStreams[ctx.dataIndex];
                return `${stream.name}: PKR ${stream.budget2027}m (${stream.share2027}%)`;
              }
            }
          },
          datalabels: {
            color: "#ffffff",
            font: { family: "'JetBrains Mono', monospace", weight: "800", size: 10 },
            formatter: (val, ctx) => {
              const stream = FINANCIAL_DATA.revenueStreams[ctx.dataIndex];
              // Show percentage and value for legible slices
              if (stream.share2027 < 3.5) return `${stream.share2027}%`;
              return `${stream.share2027}%\n${formatCurrency(val, false)}`;
            },
            textAlign: "center"
          }
        },
        cutout: "60%"
      }
    });
  }

  const barCtx = document.getElementById("revenueBarChart");
  if (barCtx) {
    state.charts.revBar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Govt / DEPD", "Foreign", "Local", "Zakat", "Other"],
        datasets: [
          {
            label: "2026 forecast",
            data: FINANCIAL_DATA.revenueStreams.map((s) => s.forecast2026),
            backgroundColor: "rgba(148, 163, 184, 0.4)",
            borderRadius: 4
          },
          {
            label: "2027 budget",
            data: FINANCIAL_DATA.revenueStreams.map((s) => s.budget2027),
            backgroundColor: FINANCIAL_DATA.revenueStreams.map((s) => s.color),
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
            }
          },
          datalabels: {
            anchor: "end",
            align: "top",
            offset: 2,
            font: { family: "'JetBrains Mono', monospace", weight: "700", size: 9 },
            color: () => getChartTextColor(),
            formatter: (val) => formatCurrency(val, false)
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grace: "15%",
            grid: { color: getChartGridColor() },
            ticks: { callback: (val) => `${val}m` }
          }
        }
      }
    });
  }
}

function buildExpenditureCharts() {
  const pieCtx = document.getElementById("expenditurePieChart");
  if (pieCtx) {
    state.charts.expPie = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: FINANCIAL_DATA.expenditureCategories.map((c) => c.name),
        datasets: [
          {
            data: FINANCIAL_DATA.expenditureCategories.map((c) => c.budget2027),
            backgroundColor: FINANCIAL_DATA.expenditureCategories.map((c) => c.color),
            borderWidth: 2,
            borderColor: "rgba(0,0,0,0.2)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } },
          centerTotal: {
            title: "TOTAL EXPENDITURE",
            text: () => formatCurrency(FINANCIAL_DATA.macro.expenditure.budget2027)
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const cat = FINANCIAL_DATA.expenditureCategories[ctx.dataIndex];
                return `${cat.name}: PKR ${cat.budget2027}m (${cat.share2027}%)`;
              }
            }
          },
          datalabels: {
            color: "#ffffff",
            font: { family: "'JetBrains Mono', monospace", weight: "800", size: 10 },
            formatter: (val, ctx) => {
              const cat = FINANCIAL_DATA.expenditureCategories[ctx.dataIndex];
              return `${cat.share2027}%\n${formatCurrency(val, false)}`;
            },
            textAlign: "center"
          }
        },
        cutout: "60%"
      }
    });
  }

  const barCtx = document.getElementById("expenditureBarChart");
  if (barCtx) {
    state.charts.expBar = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Salaries", "Operations", "CapEx", "Admin"],
        datasets: [
          {
            label: "2026 forecast",
            data: FINANCIAL_DATA.expenditureCategories.map((c) => c.forecast2026),
            backgroundColor: "rgba(148, 163, 184, 0.4)",
            borderRadius: 4
          },
          {
            label: "2027 budget",
            data: FINANCIAL_DATA.expenditureCategories.map((c) => c.budget2027),
            backgroundColor: FINANCIAL_DATA.expenditureCategories.map((c) => c.color),
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
            }
          },
          datalabels: {
            anchor: "end",
            align: "top",
            offset: 2,
            font: { family: "'JetBrains Mono', monospace", weight: "700", size: 9 },
            color: () => getChartTextColor(),
            formatter: (val) => formatCurrency(val, false)
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grace: "15%",
            grid: { color: getChartGridColor() },
            ticks: { callback: (val) => `${val}m` }
          }
        }
      }
    });
  }
}

function buildSimulationChart() {
  const ctx = document.getElementById("simChart");
  if (!ctx) return;

  state.charts.sim = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["2027 Budget Baseline", "Simulated Projection"],
      datasets: [
        {
          label: "Revenue",
          data: [FINANCIAL_DATA.macro.revenue.budget2027, FINANCIAL_DATA.macro.revenue.budget2027],
          backgroundColor: "#10b981",
          borderRadius: 6
        },
        {
          label: "Expenditure",
          data: [FINANCIAL_DATA.macro.expenditure.budget2027, FINANCIAL_DATA.macro.expenditure.budget2027],
          backgroundColor: "#ef4444",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        datalabels: {
          anchor: "end",
          align: "top",
          offset: 3,
          font: { family: "'JetBrains Mono', monospace", weight: "700", size: 10 },
          color: () => getChartTextColor(),
          formatter: (val) => formatCurrency(val, false)
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grace: "15%",
          grid: { color: getChartGridColor() },
          ticks: { callback: (val) => `${val}m` }
        }
      }
    }
  });
}

function updateChartsTheme() {
  const textColor = getChartTextColor();
  const gridColor = getChartGridColor();

  Chart.defaults.color = textColor;

  Object.values(state.charts).forEach((chart) => {
    if (!chart || !chart.options) return;
    if (chart.options.scales) {
      if (chart.options.scales.x && chart.options.scales.x.grid) {
        chart.options.scales.x.grid.color = gridColor;
      }
      if (chart.options.scales.y && chart.options.scales.y.grid) {
        chart.options.scales.y.grid.color = gridColor;
      }
    }
    chart.update();
  });
}

function updateChartsUnit() {
  Object.values(state.charts).forEach((chart) => {
    if (chart && chart.update) chart.update();
  });
}

// ==========================================================================
// What-If Scenario Lab Engine
// ==========================================================================

function initSimulator() {
  const govtSlider = document.getElementById("simGovt");
  const foreignSlider = document.getElementById("simForeign");
  const zakatSlider = document.getElementById("simZakat");
  const salarySlider = document.getElementById("simSalaryInc");
  const opsSlider = document.getElementById("simOpsInflation");
  const resetBtn = document.getElementById("resetSimBtn");

  if (!govtSlider) return;

  const updateSim = () => {
    state.simParams.govtPct = parseFloat(govtSlider.value);
    state.simParams.foreignPct = parseFloat(foreignSlider.value);
    state.simParams.zakatPct = parseFloat(zakatSlider.value);
    state.simParams.salaryIncPct = parseFloat(salarySlider.value);
    state.simParams.opsInflationPct = parseFloat(opsSlider.value);

    // Labels
    const simGovtVal = (572.30 * (state.simParams.govtPct / 100)).toFixed(2);
    document.getElementById("simGovtVal").textContent = `${state.simParams.govtPct}% (${formatCurrency(simGovtVal)})`;

    const simForeignVal = (465.34 * (state.simParams.foreignPct / 100)).toFixed(2);
    document.getElementById("simForeignVal").textContent = `${state.simParams.foreignPct}% (${formatCurrency(simForeignVal)})`;

    const simZakatVal = (50.00 * (state.simParams.zakatPct / 100)).toFixed(2);
    document.getElementById("simZakatVal").textContent = `${state.simParams.zakatPct}% (${formatCurrency(simZakatVal)})`;

    document.getElementById("simSalaryIncVal").textContent = `${state.simParams.salaryIncPct}% ${state.simParams.salaryIncPct === 12 ? '(Proposed Baseline)' : ''}`;

    const simOpsVal = (603.55 * (1 + state.simParams.opsInflationPct / 100)).toFixed(2);
    document.getElementById("simOpsInflationVal").textContent = `${state.simParams.opsInflationPct > 0 ? '+' : ''}${state.simParams.opsInflationPct}% (${formatCurrency(simOpsVal)})`;

    recalculateSimulator();
  };

  govtSlider.addEventListener("input", updateSim);
  foreignSlider.addEventListener("input", updateSim);
  zakatSlider.addEventListener("input", updateSim);
  salarySlider.addEventListener("input", updateSim);
  opsSlider.addEventListener("input", updateSim);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      applyPreset({ govt: 100, foreign: 100, zakat: 100, salary: 12, ops: 0 });
    });
  }

  // Preset Buttons
  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.getAttribute("data-preset");
      switch (presetKey) {
        case "baseline":
          applyPreset({ govt: 100, foreign: 100, zakat: 100, salary: 12, ops: 0 });
          break;
        case "govt-delay":
          applyPreset({ govt: 90, foreign: 100, zakat: 100, salary: 12, ops: 0 });
          break;
        case "zakat-short":
          applyPreset({ govt: 100, foreign: 100, zakat: 80, salary: 12, ops: 0 });
          break;
        case "salary-freeze":
          applyPreset({ govt: 100, foreign: 100, zakat: 100, salary: 8, ops: -2 });
          break;
        case "perfect-storm":
          applyPreset({ govt: 92, foreign: 95, zakat: 85, salary: 14, ops: 5 });
          break;
      }
    });
  });

  updateSim();
}

function applyPreset(p) {
  document.getElementById("simGovt").value = p.govt;
  document.getElementById("simForeign").value = p.foreign;
  document.getElementById("simZakat").value = p.zakat;
  document.getElementById("simSalaryInc").value = p.salary;
  document.getElementById("simOpsInflation").value = p.ops;
  document.getElementById("simGovt").dispatchEvent(new Event("input"));
}

function recalculateSimulator() {
  // Inflows
  const simGovt = 572.30 * (state.simParams.govtPct / 100);
  const simForeign = 465.34 * (state.simParams.foreignPct / 100);
  const simLocal = 125.59;
  const simZakat = 50.00 * (state.simParams.zakatPct / 100);
  const simOther = 40.60;

  const simRevenue = simGovt + simForeign + simLocal + simZakat + simOther;

  // Outflows
  // Baseline 2026 salaries: 445.29. Proposed 12% adjustment is 53.43. Plus recruitments: 29.37. Total = 528.09.
  const salaryAdjustmentAmount = 445.29 * (state.simParams.salaryIncPct / 100);
  const simSalaries = 445.29 + salaryAdjustmentAmount + 29.37;

  const simOps = 603.55 * (1 + state.simParams.opsInflationPct / 100);
  const simCapEx = 59.09;
  const simAdmin = 61.71;

  const simExpenditure = simSalaries + simOps + simCapEx + simAdmin;
  const simSurplus = simRevenue - simExpenditure;
  const simMargin = (simSurplus / simRevenue) * 100;

  // UI Updates
  const banner = document.getElementById("simKpiBanner");
  const statusBadge = document.getElementById("simStatusBadge");
  const surplusVal = document.getElementById("simSurplusVal");
  const surplusSub = document.getElementById("simSurplusSub");

  if (!banner || !statusBadge || !surplusVal) return;

  banner.classList.remove("deficit-state", "marginal-state");

  if (simSurplus < 0) {
    banner.classList.add("deficit-state");
    statusBadge.textContent = "DEFICIT WARNING";
    surplusVal.textContent = `-PKR ${formatCurrency(Math.abs(simSurplus), false)}`;
    surplusSub.textContent = `Deficit of ${Math.abs(simMargin).toFixed(2)}% of turnover | Critical deficit risk`;
  } else if (simSurplus < 5.0) {
    banner.classList.add("marginal-state");
    statusBadge.textContent = "MARGINAL SURPLUS";
    surplusVal.textContent = `+PKR ${formatCurrency(simSurplus, false)}`;
    surplusSub.textContent = `Operating Margin: ${simMargin.toFixed(2)}% | Extremely narrow headroom`;
  } else {
    statusBadge.textContent = "COMFORTABLE SURPLUS";
    surplusVal.textContent = `+PKR ${formatCurrency(simSurplus, false)}`;
    surplusSub.textContent = `Operating Margin: ${simMargin.toFixed(2)}% | Solvent budget position`;
  }

  // Cards
  document.getElementById("simRevVal").textContent = formatCurrency(simRevenue);
  const revDiff = simRevenue - FINANCIAL_DATA.macro.revenue.budget2027;
  document.getElementById("simRevDiff").textContent = `${revDiff >= 0 ? '+' : ''}${formatCurrency(revDiff)} vs Budget`;
  document.getElementById("simRevDiff").className = `metric-diff ${revDiff >= 0 ? 'delta-positive' : 'delta-negative'}`;

  document.getElementById("simExpVal").textContent = formatCurrency(simExpenditure);
  const expDiff = simExpenditure - FINANCIAL_DATA.macro.expenditure.budget2027;
  document.getElementById("simExpDiff").textContent = `${expDiff >= 0 ? '+' : ''}${formatCurrency(expDiff)} vs Budget`;
  document.getElementById("simExpDiff").className = `metric-diff ${expDiff <= 0 ? 'delta-positive' : 'delta-negative'}`;

  const surplusDiff = simSurplus - FINANCIAL_DATA.macro.surplus.budget2027;
  document.getElementById("simDeltaVal").textContent = `${surplusDiff >= 0 ? '+' : ''}${formatCurrency(surplusDiff)}`;
  document.getElementById("simDeltaPercent").textContent = `${surplusDiff >= 0 ? 'Surplus expanded' : 'Buffer eroded'}`;

  document.getElementById("simMarginVal").textContent = `${simMargin >= 0 ? '+' : ''}${simMargin.toFixed(2)}%`;
  document.getElementById("simBufferStatus").textContent = simSurplus >= 0 ? "Solvent Buffer" : "Deficit State";

  // Chart
  if (state.charts.sim) {
    state.charts.sim.data.datasets[0].data = [
      FINANCIAL_DATA.macro.revenue.budget2027,
      parseFloat(simRevenue.toFixed(2))
    ];
    state.charts.sim.data.datasets[1].data = [
      FINANCIAL_DATA.macro.expenditure.budget2027,
      parseFloat(simExpenditure.toFixed(2))
    ];
    state.charts.sim.update();
  }
}

// ==========================================================================
// Slide 7: Audit Checklist & Persistence
// ==========================================================================

function initAuditChecklist() {
  const saved = state.resolvedAuditChecks;
  document.querySelectorAll(".variance-card").forEach((card) => {
    const chk = card.querySelector("input[type='checkbox']");
    if (!chk) return;

    const varTag = card.querySelector(".var-tag")?.textContent || "";
    if (saved.includes(varTag)) {
      chk.checked = true;
      card.classList.add("is-resolved");
    }
  });

  updateAuditBadge();
}

function toggleAuditCheck(checkbox, checkId) {
  const card = checkbox.closest(".variance-card");
  if (!card) return;

  const varTag = card.querySelector(".var-tag")?.textContent || checkId;

  if (checkbox.checked) {
    card.classList.add("is-resolved");
    if (!state.resolvedAuditChecks.includes(varTag)) {
      state.resolvedAuditChecks.push(varTag);
    }
  } else {
    card.classList.remove("is-resolved");
    state.resolvedAuditChecks = state.resolvedAuditChecks.filter((t) => t !== varTag);
  }

  localStorage.setItem("malc_resolved_audits_v2", JSON.stringify(state.resolvedAuditChecks));
  updateAuditBadge();
}

function updateAuditBadge() {
  const total = 6;
  const resolved = state.resolvedAuditChecks.length;
  const flagText = document.getElementById("auditBannerBadge");
  if (flagText) {
    if (resolved === total) {
      flagText.innerHTML = `<span style="color:#10b981;">✓ All 6 Audits Cleared</span>`;
    } else {
      flagText.innerHTML = `<span class="pulse-dot"></span> ${total - resolved} of ${total} Audits Pending`;
    }
  }
}

// ==========================================================================
// Action Buttons & CSV Export
// ==========================================================================

function initActionButtons() {
  const closeBanner = document.getElementById("closeAnnouncement");
  if (closeBanner) {
    closeBanner.addEventListener("click", () => {
      const banner = document.getElementById("announcementBar");
      if (banner) banner.style.display = "none";
    });
  }

  const quickWhatIf = document.getElementById("quickWhatIfBtn");
  if (quickWhatIf) {
    quickWhatIf.addEventListener("click", () => {
      switchTab("tab-simulator");
    });
  }

  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const auditFlag = document.getElementById("auditBannerBadge");
  if (auditFlag) {
    auditFlag.addEventListener("click", () => {
      switchTab("tab-variances");
    });
  }

  const toggleSurplusBtn = document.getElementById("toggleSurplusViewBtn");
  if (toggleSurplusBtn) {
    toggleSurplusBtn.addEventListener("click", toggleMacroSurplusView);
  }
}

function exportOverviewCSV() {
  const rows = [
    ["MARIE ADELAIDE LEPROSY CENTRE"],
    ["FORECAST 2026 & BUDGET 2027"],
    ["Financial overview, budget assumptions and key variances"],
    ["Period: 1 January - 31 December 2027"],
    [],
    ["Stream / Category", "2026 forecast (PKR m)", "2027 budget (PKR m)", "Change (PKR m)", "% change", "% Share"],
    ["REVENUE PROJECTIONS"],
    ...FINANCIAL_DATA.revenueStreams.map((s) => [
      s.name,
      s.forecast2026,
      s.budget2027,
      s.change,
      s.growth + "%",
      s.share2027 + "%"
    ]),
    ["TOTAL REVENUE", FINANCIAL_DATA.macro.revenue.forecast2026, FINANCIAL_DATA.macro.revenue.budget2027, FINANCIAL_DATA.macro.revenue.change, "+11%", "100.0%"],
    [],
    ["EXPENDITURE BUDGET"],
    ...FINANCIAL_DATA.expenditureCategories.map((c) => [
      c.name,
      c.forecast2026,
      c.budget2027,
      c.change,
      c.growth + "%",
      c.share2027 + "%"
    ]),
    ["TOTAL EXPENDITURE", FINANCIAL_DATA.macro.expenditure.forecast2026, FINANCIAL_DATA.macro.expenditure.budget2027, FINANCIAL_DATA.macro.expenditure.change, "+12%", "100.0%"],
    [],
    ["PROJECTED SURPLUS", FINANCIAL_DATA.macro.surplus.forecast2026, FINANCIAL_DATA.macro.surplus.budget2027, FINANCIAL_DATA.macro.surplus.change, "-88%", "0.11% margin"]
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "MALC_Forecast_2026_Budget_2027_Master_Schedule.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
