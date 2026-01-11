async function loadJSON(path) {
  const res = await fetch(path + "?v=" + Date.now());
  if (!res.ok) throw new Error("Failed to load " + path);
  return await res.json();
}

function renderStandingsRow(row, teamsCount) {
  const tr = document.createElement("tr");
  if (row.is_my_team) tr.classList.add("myteam");

  // row.matrix может быть длинной 13
  const matrix = Array.isArray(row.matrix) ? row.matrix : [];
  const padMatrix = [];
  for (let i = 0; i < teamsCount; i++) padMatrix.push(matrix[i] ?? "");

  const cells = [
    `<td>${row.pos ?? ""}</td>`,
    `<td class="team">${row.team ?? ""}</td>`,
    ...padMatrix.map(v => `<td>${v ?? ""}</td>`),
    `<td>${row.gp ?? ""}</td>`,
    `<td>${row.w ?? ""}</td>`,
    `<td>${row.wb ?? ""}</td>`,
    `<td>${row.pb ?? ""}</td>`,
    `<td>${row.l ?? ""}</td>`,
    `<td>${row.gd ?? ""}</td>`,
    `<td>${row.pim ?? ""}</td>`,
    `<td><b>${row.pts ?? ""}</b></td>`
  ];

  tr.innerHTML = cells.join("");
  return tr;
}

async function renderStandings() {
  const data = await loadJSON("data/standings.json");

  // Заголовки
  document.getElementById("stTitle").textContent = data.title || "Турнирное положение";
  document.getElementById("stSub").textContent = data.subtitle || "";
  document.getElementById("stUpd").textContent = data.updated ? ("Обновлено: " + data.updated) : "";

  // Колонки
  const colsTr = document.getElementById("stCols");
  colsTr.innerHTML = "";
  const cols = data.columns || [];
  cols.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c;
    colsTr.appendChild(th);
  });

  // Сколько команд в матрице 1..N
  // Мы считаем: между "Команды" и "И" стоят номера 1..N
  let teamsCount = 0;
  const idxTeams = cols.indexOf("Команды");
  const idxI = cols.indexOf("И");
  if (idxTeams !== -1 && idxI !== -1 && idxI > idxTeams) {
    teamsCount = idxI - idxTeams - 1;
  }

  // Строки
  const tbody = document.getElementById("stRows");
  tbody.innerHTML = "";
  (data.rows || []).forEach(r => {
    tbody.appendChild(renderStandingsRow(r, teamsCount));
  });
}

// Запускаем сразу при открытии страницы
renderStandings().catch(err => {
  console.error(err);
  const card = document.getElementById("standingsCard");
  if (card) {
    card.innerHTML = `<div class="card-title">Таблица</div><div>Ошибка загрузки таблицы</div>`;
  }
});
