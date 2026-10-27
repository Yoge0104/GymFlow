/* ===================================================================
   GymFlow — Chart.js Theme-Aware Wrappers
   Area, Bar, Doughnut, and Line charts customized with GymFlow palettes.
   =================================================================== */

const GymCharts = {
  isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
           document.body.classList.contains('dark-theme');
  },

  getChartColors() {
    const isDark = this.isDarkMode();
    return {
      textColor: isDark ? '#94a3b8' : '#64748b',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
      accent: '#10b981',
      accentLight: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
      blue: '#2563eb',
      blueLight: isDark ? 'rgba(37, 99, 235, 0.25)' : 'rgba(37, 99, 235, 0.15)',
      purple: '#8b5cf6',
      amber: '#f59e0b',
      rose: '#f43f5e'
    };
  },

  renderRevenueChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const colors = this.getChartColors();
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colors.accentLight);
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Revenue (₹)',
          data: data || [3200, 3900, 4800, 5200, 6100, 7450],
          borderColor: colors.accent,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: colors.accent,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => ` Revenue: ₹${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor, font: { family: "'Plus Jakarta Sans', sans-serif" } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif" },
              callback: (val) => `₹${val}`
            }
          }
        }
      }
    });
  },

  renderAttendanceChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const colors = this.getChartColors();
    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Daily Check-ins',
          data: data || [92, 115, 124, 108, 96, 140, 78],
          backgroundColor: colors.blue,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.textColor }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, stepSize: 25 }
          }
        }
      }
    });
  },

  renderPlanDistributionChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const colors = this.getChartColors();
    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels || ['VIP Annual', 'Quarterly Pass', 'Semi-Annual', 'Monthly', 'PT Elite'],
        datasets: [{
          data: data || [45, 25, 15, 10, 5],
          backgroundColor: [
            colors.accent,
            colors.blue,
            colors.purple,
            colors.amber,
            colors.rose
          ],
          borderWidth: 2,
          borderColor: document.body.classList.contains('dark-theme') ? '#131c31' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textColor,
              usePointStyle: true,
              padding: 14,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }
            }
          }
        }
      }
    });
  },

  renderWeightProgressChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const colors = this.getChartColors();
    const ctx = canvas.getContext('2d');

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'Weight (kg)',
          data: data || [84.5, 83.2, 82.0, 81.3],
          borderColor: colors.accent,
          backgroundColor: colors.accentLight,
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: colors.accent
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: colors.textColor } },
          y: { grid: { color: colors.gridColor }, ticks: { color: colors.textColor } }
        }
      }
    });
  }
};

window.GymCharts = GymCharts;
<<<<<<< HEAD

document.addEventListener("DOMContentLoaded", function () {
    const STORAGE_KEY = "strongerGymProgressMeasurements";

    
    let measurements = [];

    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        measurements = savedData ? JSON.parse(savedData) : [];

        if (!Array.isArray(measurements) || measurements.length === 0) {
            measurements = demoMeasurements;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
        }
    } catch (error) {
        measurements = demoMeasurements;
    }

    let progressChart = null;

    function getElement(id) {
        return document.getElementById(id);
    }

    function saveMeasurements() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
            return true;
        } catch (error) {
            alert("Unable to save measurements in this browser.");
            return false;
        }
    }

    function formatValue(value, unit = "") {
        return value === null || value === undefined || value === ""
            ? "—"
            : `${value}${unit}`;
    }

    function updateKPI(id, value) {
        const element = getElement(id);
        if (element) element.textContent = value;
    }

    function renderDashboard() {
        // Newest measurement first in the history table
        const sorted = [...measurements].sort(
            (a, b) => b.date.localeCompare(a.date)
        );

        const latest = sorted[0];

        if (latest) {
            updateKPI("current-weight", formatValue(latest.weight, " kg"));
            updateKPI("current-body-fat", formatValue(latest.fat, "%"));
            updateKPI("current-chest", formatValue(latest.chest, " cm"));
            updateKPI("current-waist", formatValue(latest.waist, " cm"));
        }

        renderHistory(sorted);
        renderChart();
    }

    function renderHistory(data) {
        const tbody = getElement("progress-history-tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">No measurements found.</td>
                </tr>
            `;
            return;
        }

        data.forEach((item) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.date}</td>
                <td>${formatValue(item.weight, " kg")}</td>
                <td>${formatValue(item.fat, "%")}</td>
                <td>${formatValue(item.chest, " cm")}</td>
                <td>${formatValue(item.waist, " cm")}</td>
                <td>${formatValue(item.arms, " cm")}</td>
            `;

            tbody.appendChild(row);
        });
    }

    function renderChart() {
        const canvas = getElement("weightProgressChart");
        if (!canvas || typeof Chart === "undefined") return;

        const sorted = [...measurements].sort(
            (a, b) => a.date.localeCompare(b.date)
        );

        if (progressChart) {
            progressChart.destroy();
        }

        progressChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: sorted.map(item => item.date),
                datasets: [
                    {
                        label: "Weight (kg)",
                        data: sorted.map(item => item.weight),
                        borderColor: "#3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.12)",
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.35,
                        fill: true,
                        yAxisID: "y"
                    },
                    {
                        label: "Body Fat (%)",
                        data: sorted.map(item => item.fat),
                        borderColor: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.08)",
                        borderWidth: 3,
                        pointRadius: 4,
                        tension: 0.35,
                        fill: false,
                        yAxisID: "y1",
                        spanGaps: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Check-in Date"
                        }
                    },
                    y: {
                        beginAtZero: false,
                        position: "left",
                        title: {
                            display: true,
                            text: "Weight (kg)"
                        }
                    },
                    y1: {
                        beginAtZero: false,
                        position: "right",
                        title: {
                            display: true,
                            text: "Body Fat (%)"
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    // Save a new measurement from your existing form
    window.handleSaveMeasurement = function (event) {
        event.preventDefault();

        const date = getElement("m-date").value;
        const weight = Number(getElement("m-weight").value);

        if (!date || !Number.isFinite(weight) || weight <= 0) {
            alert("Please enter a valid date and weight.");
            return;
        }

        const optionalNumber = id => {
            const value = getElement(id).value;
            return value === "" ? null : Number(value);
        };

        const newMeasurement = {
            date,
            weight,
            fat: optionalNumber("m-fat"),
            chest: optionalNumber("m-chest"),
            waist: optionalNumber("m-waist"),
            arms: optionalNumber("m-arms")
        };

        const existingIndex = measurements.findIndex(
            item => item.date === date
        );

        if (existingIndex >= 0) {
            const confirmed = confirm(
                "A measurement already exists for this date. Replace it?"
            );
            if (!confirmed) return;

            measurements[existingIndex] = newMeasurement;
        } else {
            measurements.push(newMeasurement);
        }

        if (!saveMeasurements()) return;

        renderDashboard();

        event.target.reset();

        const modal = getElement("modal-add-metric");
        if (modal) modal.hidden = true;
    };

    // Search measurements by date or values
    window.filterProgress = function () {
        const search = (getElement("prog-search")?.value || "")
            .trim()
            .toLowerCase();

        const filtered = measurements.filter(item =>
            Object.values(item).some(value =>
                String(value ?? "").toLowerCase().includes(search)
            )
        );

        renderHistory(
            filtered.sort((a, b) => b.date.localeCompare(a.date))
        );
    };

    window.resetProgressFilters = function () {
        const search = getElement("prog-search");
        if (search) search.value = "";

        renderHistory(
            [...measurements].sort((a, b) => b.date.localeCompare(a.date))
        );
    };

    // Sort the history table by a field
    window.sortProgress = function (field) {
        const allowedFields = [
            "date", "weight", "fat", "chest", "waist", "arms"
        ];

        if (!allowedFields.includes(field)) return;

        const sorted = [...measurements].sort((a, b) => {
            const first = a[field] ?? "";
            const second = b[field] ?? "";

            if (field === "date") {
                return String(first).localeCompare(String(second));
            }

            return Number(first) - Number(second);
        });

        renderHistory(sorted);
    };

    window.openMeasurementModal = function () {
        const modal = getElement("modal-add-metric");
        if (modal) modal.hidden = false;

        const dateInput = getElement("m-date");
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().slice(0, 10);
        }
    };

    window.closeMeasurementModal = function () {
        const modal = getElement("modal-add-metric");
        if (modal) modal.hidden = true;
    };

    document.querySelectorAll("[data-modal-close]").forEach(button => {
        button.addEventListener("click", window.closeMeasurementModal);
    });

    renderDashboard();
});

=======
>>>>>>> d832a2791cfbe3530142912a0522d7e539f037e8
