function addRow() {
    var table=document.getElementById("table");
    var row=table.insertRow(-1);

    var cell1=row.insertCell(0);
    var cell2=row.insertCell(1);

    cell1.contentEditable="true";
    cell2.contentEditable="true";

    cell1.innerHTML="New Task"
    cell2.innerHTML="Enter task description here";
}

function removeLastRow() {
    const table=document.getElementById("table");
    table.deleteRow(-1);
}
