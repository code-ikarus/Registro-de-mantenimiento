function agregarAparato(){
  const table = document.getElementById("registro");
  const headerRow = table.rows[0];
  const newTh = document.createElement("th"); 
  newTh.contentEditable = "true";
  newTh.textContent = "Nuevo Aparato";
  headerRow.appendChild(newTh);

  for (let i = 1; i < table.rows.length; i++){
    const newTd = document.createElement("td");
    newTd.contentEditable = "true";
    table.rows[i].appendChild(newTd);
  };
  
}

function agregarTarea(){
  const table = document.getElementById("registro");
  const newRow = document.createElement("tr");

  const newTh = document.createElement("th");
  newTh.contentEditable = "true";
  newTh.textContent = "Nueva Tarea"
  newRow.appendChild(newTh);

  const numCols = table.rows[0].cells.length;
  for (i = 1; i < numCols; i++){
    const newTd = document.createElement("td");
    newTd.contentEditable = "true";
    newRow.appendChild(newTd);
  }

  table.tBodies[0].appendChild(newRow)
}

function eliminarUltimoAparato() {
  const table = document.getElementById("registro");
  const headerRow = table.rows[0];

  // Si hay al menos una columna extra (además de "Tareas / Equipos")
  if (headerRow.cells.length > 1) {
    headerRow.deleteCell(-1); // elimina última columna

    for (let i = 1; i < table.rows.length; i++) {
      table.rows[i].deleteCell(-1); // elimina celda correspondiente en cada fila
    }
  }
}

function eliminarUltimaTarea() {
  const table = document.getElementById("registro");

  // Si hay al menos una fila en tbody
  if (table.rows.length > 1) {
    table.deleteRow(-1); // elimina última fila
  }
}

// eliminar con backspace
document.addEventListener("keydown", function (e) {
  if (e.key === "Backspace") {
    const selection = window.getSelection();
    const node = selection.anchorNode;
    if (!node) return;

    const cell = node.nodeType === 3 ? node.parentElement : node;
    if (!cell || !cell.isContentEditable) return;

    // Si el contenido está vacío
    if (cell.innerText.trim() === "") {
      const table = document.getElementById("registro");

      // Eliminar columna si es TH del header
      if (cell.tagName === "TH" && cell.parentElement.rowIndex === 0) {
        const colIndex = cell.cellIndex;
        if (colIndex > 0) { // No borrar la columna de tareas
          for (let i = 0; i < table.rows.length; i++) {
            table.rows[i].deleteCell(colIndex);
          }
        }
      }

      // Eliminar fila si es TH de la fila (tarea)
      else if (cell.tagName === "TH" && cell.parentElement.rowIndex > 0) {
        const row = cell.parentElement;
        table.deleteRow(row.rowIndex);
      }
    }
  }
});



function guardarComoCSV(){
  const table = document.getElementById("registro");
  const title = document.querySelector(".editable-title").innerText;

  let csv = [["", title]]

  for (let i = 0; i < table.rows.length; i++){
    const row = table.rows[i];
    const rowData = [];
    for (let j = 0; j < row.cells.length; j++){
      const text = row.cells[j].innerText.replace(/"/g, '""');
      rowData.push(`"${text}"`);
    }
    csv.push(rowData);
  }

  const csvContent = csv.map(e => e.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "registro-mantenimiento.csv";
  document.body.appendChild(a)
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function guardarComoJSON() {
  const tabla = document.getElementById("registro");
  const titulo = document.querySelector(".editable-title").innerText;

  const data = {
    titulo,
    encabezados: [],
    tareas: [],
    celdas: []
  };

  const headerRow = tabla.rows[0];
  for (let i = 1; i < headerRow.cells.length; i++) {
    data.encabezados.push(headerRow.cells[i].innerText);
  }

  for (let i = 1; i < tabla.rows.length; i++) {
    const row = tabla.rows[i];
    data.tareas.push(row.cells[0].innerText);
    const fila = [];
    for (let j = 1; j < row.cells.length; j++) {
      fila.push(row.cells[j].innerText);
    }
    data.celdas.push(fila);
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "registro-mantenimiento.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function cargarDesdeJSON(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const contenido = JSON.parse(e.target.result);
    restaurarTablaDesdeJSON(contenido);
  };
  reader.readAsText(file);
}

function restaurarTablaDesdeJSON(data) {
  const tabla = document.getElementById("registro");
  const titulo = document.querySelector(".editable-title");
  titulo.innerText = data.titulo;

  tabla.innerHTML = "";

  const thead = tabla.createTHead();
  const headerRow = thead.insertRow();
  const thTarea = document.createElement("th");
  thTarea.textContent = "Tareas / Equipos";
  headerRow.appendChild(thTarea);

  for (const encabezado of data.encabezados) {
    const th = document.createElement("th");
    th.contentEditable = "true";
    th.innerText = encabezado;
    headerRow.appendChild(th);
  }

  const tbody = tabla.createTBody();
  for (let i = 0; i < data.tareas.length; i++) {
    const row = tbody.insertRow();
    const th = document.createElement("th");
    th.contentEditable = "true";
    th.innerText = data.tareas[i];
    row.appendChild(th);

    for (const contenido of data.celdas[i]) {
      const td = document.createElement("td");
      td.contentEditable = "true";
      td.innerText = contenido;
      row.appendChild(td);
    }
  }
}
