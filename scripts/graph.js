function getGraphData() {
    const windowsByCase = {};
    const dataPoints = [];

    // timesArray is a global var from timer.js
    for (const result of timesArray) {
        const c = result.case;
        if (!windowsByCase[c]) windowsByCase[c] = [];
        const win = windowsByCase[c];
        win.push(result.ms);
        if (win.length > 5) win.shift();

        const ao5s = [];
        for (const vals of Object.values(windowsByCase)) {
            if (vals.length < 5) continue;
            const sorted = [...vals].sort((a, b) => a - b);
            const mid = sorted.slice(1, 4); // drop best and worst
            ao5s.push((mid[0] + mid[1] + mid[2]) / 3);
        }

        if (ao5s.length > 0)
            dataPoints.push(ao5s.reduce((a, b) => a + b, 0) / ao5s.length);
    }
    return dataPoints;
}

var progressChart = null;

function renderGraph() {
    var data = getGraphData();
    var canvas = document.getElementById("progressGraph");

    if (data.length === 0) {
        canvas.style.display = "none";
        return;
    }

    canvas.style.display = "block";

    var labels = data.map(function(_, i) { return i + 1; });

    if (progressChart) {
        progressChart.data.labels = labels;
        progressChart.data.datasets[0].data = data;
        progressChart.update();
        return;
    }

    progressChart = new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Avg ao5 per case (ms)",
                data: data,
                borderColor: "#004411",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            animation: false,
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return msToHumanReadable(Math.round(ctx.parsed.y));
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: "solve #" } },
                y: {
                    title: { display: true, text: "time" },
                    ticks: {
                        callback: function(val) {
                            return msToHumanReadable(Math.round(val));
                        }
                    }
                }
            }
        }
    });
}