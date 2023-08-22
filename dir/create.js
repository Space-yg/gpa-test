import { allLetters, maxGrade, startSystem, gradeLevels, subjectWeights, SessionsNames } from "./index.js";
import { calculateGPA } from "./calculate.js";
import { addSystemButtons, getSystem } from "./helpers.js";
const NumberInput = document.createElement("input");
NumberInput.type = "text";
NumberInput.value = "0";
function NumberInputOnInput(event, input) {
    const e = event;
    if (e.data === ".") {
        if (input.value.indexOf(".") !== input.value.length - 1)
            input.value = input.value.slice(0, -1);
    }
    else if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", null].indexOf(e.data) === -1)
        input.value = input.value.slice(0, -1);
    else if (input.value.length === 0)
        input.value = "0";
    else if (input.value[0] === "0" && input.value.indexOf(".") === -1 && input.value.length !== 1)
        input.value = e.data;
    else if (input.value.indexOf(".") !== -1 && input.value.split(".")[1].length > 3)
        input.value = input.value.slice(0, -1);
}
function NumberInputOnKeydown(event, input) {
    if (event.key === "ArrowUp")
        input.value = (Math.round((parseFloat(input.value) + 1) * 1000) / 1000).toString();
    else if (event.key === "ArrowDown" && parseFloat(input.value) < 1)
        input.value = "0";
    else if (event.key === "ArrowDown" && parseFloat(input.value) > 0)
        input.value = (Math.round((parseFloat(input.value) - 1) * 1000) / 1000).toString();
}
export function createGrade(grade, year, system, weight) {
    const table = document.createElement("table");
    table.id = grade;
    table.dataset["year"] = year.toString();
    const totalSessions = gradeLevels[grade].length;
    const colgroup = document.createElement("colgroup");
    const col1 = document.createElement("col");
    col1.className = "grades";
    colgroup.appendChild(col1);
    const col2 = document.createElement("col");
    col2.className = "gpa";
    colgroup.appendChild(col2);
    table.appendChild(colgroup);
    const thead = table.createTHead();
    const gradeTr = document.createElement("tr");
    (() => {
        const th = document.createElement("th");
        th.innerText = `Grade ${grade}`;
        gradeTr.appendChild(th);
    })();
    (() => {
        const th = document.createElement("th");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `grade-${grade}-custom`;
        checkbox.addEventListener("change", () => changeCustom(table, totalSessions, checkbox.checked));
        const label = document.createElement("label");
        label.innerText = "Custom";
        label.htmlFor = `grade-${grade}-custom`;
        th.appendChild(checkbox);
        th.appendChild(label);
        gradeTr.appendChild(th);
    })();
    thead.appendChild(gradeTr);
    const systemsTr = document.createElement("tr");
    (() => {
        const th = document.createElement("th");
        addSystemButtons(table, startSystem, th);
        systemsTr.appendChild(th);
    })();
    (() => {
        const th = document.createElement("th");
        th.innerText = "GPA";
        systemsTr.appendChild(th);
    })();
    thead.appendChild(systemsTr);
    const tbody = table.createTBody();
    const subjectsMainTr = document.createElement("tr");
    const subjectsMainTd = document.createElement("td");
    const subjectsTable = document.createElement("table");
    const subjectsThead = subjectsTable.createTHead();
    const subjectsTbody = subjectsTable.createTBody();
    (() => {
        const headTr = document.createElement("tr");
        const th = document.createElement("th");
        th.innerText = "Class";
        headTr.appendChild(th);
        gradeLevels[grade].forEach((session, i) => {
            const th = document.createElement("th");
            th.innerText = `${SessionsNames[totalSessions]} ${i + 1}`;
            headTr.appendChild(th);
            addSubjects(table, subjectsTable, system, session, i);
        });
        subjectsThead.appendChild(headTr);
    })();
    subjectsMainTd.appendChild(subjectsTable);
    subjectsMainTr.appendChild(subjectsMainTd);
    tbody.appendChild(subjectsMainTr);
    addGPA(table, weight, totalSessions);
    return table;
}
function createClassSelect(table, subjectNames) {
    const select = document.createElement("select");
    select.addEventListener("change", () => calculateGPA(table));
    subjectNames.forEach(name => select.innerHTML += `<option value="${name}">${name}</option>`);
    return select;
}
function changeCustom(table, sessions, custom) {
    const subjectsTable = table.tBodies[0].rows[0].cells[0].firstChild;
    subjectsTable.tBodies[0].remove();
    const tbody = subjectsTable.createTBody();
    if (custom) {
        (() => {
            const td = document.createElement("th");
            td.innerText = "Course Type";
            subjectsTable.tHead.rows[0].insertBefore(td, subjectsTable.tHead.rows[0].cells[0]);
        })();
        (() => {
            const th = document.createElement("th");
            th.innerText = "Credits";
            subjectsTable.tHead.rows[0].appendChild(th);
        })();
        tbody.appendChild(createEmptyRow(sessions + 3));
        addUnknownSubject(table, subjectsTable, sessions);
        addAddSubjectButton(table, subjectsTable, 1, sessions);
    }
    else {
        subjectsTable.tHead.rows[0].cells[sessions + 2].remove();
        subjectsTable.tHead.rows[0].cells[0].remove();
        gradeLevels[table.id].forEach((session, i) => {
            addSubjects(table, subjectsTable, getSystem(table), session, i);
        });
    }
    calculateGPA(table);
}
function addSubjects(table, subjectsTable, system, session, sessionNum) {
    const subjectsTbody = subjectsTable.tBodies[0];
    let s;
    if (typeof session === "string")
        s = gradeLevels[table.id][parseInt(session)];
    else
        s = session;
    if (sessionNum === 0) {
        s.forEach(subject => {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            const names = Object.keys(subject);
            tr.id = names[0].replace(" ", "-");
            if (names.length === 1)
                td.innerText = names[0];
            else
                td.appendChild(createClassSelect(table, names));
            tr.appendChild(td);
            tr.appendChild(createGradeInputTd(table, system));
            subjectsTbody.appendChild(tr);
        });
    }
    else {
        s.forEach(subject => {
            const names = Object.keys(subject);
            if (names.length === 1) {
                let tr = [...subjectsTbody.rows].find(tr => tr.cells[0].children.length === 0 && tr.cells[0].innerText === names[0]);
                if (tr)
                    tr.appendChild(createGradeInputTd(table, system));
                else {
                    tr = document.createElement("tr");
                    tr.id = names[0].replace(" ", "-");
                    const td = document.createElement("td");
                    td.innerText = names[0];
                    tr.appendChild(td);
                    for (let j = 0; j < sessionNum; j++)
                        tr.appendChild(document.createElement("td"));
                    tr.appendChild(createGradeInputTd(table, system));
                }
                subjectsTbody.appendChild(tr);
            }
            else {
                let tr = [...subjectsTbody.rows].find(tr => tr.cells[0].children.length === 1 && tr.id === names[0].replace(" ", "-"));
                if (tr)
                    tr.appendChild(createGradeInputTd(table, system));
                else {
                    tr = document.createElement("tr");
                    tr.id = names[0].replace(" ", "-");
                    const td = document.createElement("td");
                    td.appendChild(createClassSelect(table, names));
                    tr.appendChild(td);
                    for (let j = 0; j < sessionNum; j++)
                        tr.appendChild(document.createElement("td"));
                    tr.appendChild(createGradeInputTd(table, system));
                }
                subjectsTbody.appendChild(tr);
            }
        });
    }
}
function createEmptyRow(columns) {
    const tr = document.createElement("tr");
    for (let i = 0; i < columns; i++)
        tr.appendChild(document.createElement("td"));
    return tr;
}
function addAddSubjectButton(table, sessionTable, row, sessions) {
    if (!sessionTable.tBodies[0].rows[row])
        sessionTable.tBodies[0].appendChild(createEmptyRow(sessions + 3));
    const td = sessionTable.tBodies[0].rows[row].cells[sessions + 2];
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        button.remove();
        addUnknownSubject(table, sessionTable, sessions);
        addAddSubjectButton(table, sessionTable, sessionTable.tBodies[0].rows.length, sessions);
        calculateGPA(table);
    });
    button.innerText = "Add Subject";
    td.appendChild(button);
    return td;
}
function addUnknownSubject(table, sessionTable, sessions) {
    const row = sessionTable.tBodies[0].children.length - 1;
    const tr = sessionTable.tBodies[0].rows[row];
    const select = document.createElement("select");
    select.addEventListener("change", () => calculateGPA(table));
    for (const weight of subjectWeights)
        select.innerHTML += `<option value="${weight}">${weight}</option>`;
    tr.cells[0].appendChild(select);
    (() => {
        const input = document.createElement("input");
        input.placeholder = "Class Name";
        tr.cells[1].appendChild(input);
    })();
    for (let i = 0; i < sessions; i++) {
        const td = createGradeInputTd(table, getSystem(table));
        tr.cells[2 + i].appendChild(td.firstChild);
        tr.cells[2 + i].appendChild(td.lastChild);
    }
    (() => {
        const input = NumberInput.cloneNode();
        input.value = "1";
        input.addEventListener("input", event => {
            NumberInputOnInput(event, input);
            calculateGPA(table);
        });
        input.addEventListener("keydown", event => {
            NumberInputOnKeydown(event, input);
            if (event.key in ["ArrowUp", "ArrowDown"])
                calculateGPA(table);
        });
        tr.cells[sessions + 2].appendChild(input);
        const button = document.createElement("button");
        button.innerText = "X";
        button.addEventListener("click", () => {
            if (tr.sectionRowIndex === 0 && tr.parentElement.children.length === 2)
                return;
            tr.remove();
            calculateGPA(table);
        });
        tr.cells[sessions + 2].appendChild(button);
    })();
}
function createGradeInputTd(table, system) {
    const td = document.createElement("td");
    const select = document.createElement("select");
    select.className = "letter";
    select.addEventListener("change", () => calculateGPA(table));
    for (const letter of allLetters)
        select.innerHTML += `<option value="${letter}">${letter}</option>`;
    td.appendChild(select);
    const input = NumberInput.cloneNode();
    input.className = "percent";
    input.addEventListener("input", event => {
        NumberInputOnInput(event, input);
        if (parseFloat(input.value) > parseFloat(maxGrade))
            input.value = maxGrade;
        calculateGPA(table);
    });
    input.addEventListener("keydown", event => {
        if (event.key === "ArrowUp" && parseFloat(input.value) >= 99)
            input.value = "100";
        else
            NumberInputOnKeydown(event, input);
        if (event.key in ["ArrowUp", "ArrowDown"])
            calculateGPA(table);
    });
    input.value = "100";
    td.appendChild(input);
    if (system === "letter")
        input.hidden = true;
    else
        select.hidden = true;
    return td;
}
function addGPA(table, weight, semesters) {
    const gpaTable = document.createElement("table");
    const thead = gpaTable.createTHead();
    const tbody = gpaTable.createTBody();
    (() => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        const button1 = document.createElement("button");
        button1.innerText = "Weighted";
        button1.addEventListener("click", () => changeGPAWeight(table, "weighted"));
        th.appendChild(button1);
        const button2 = document.createElement("button");
        button2.innerText = "Unweighted";
        button2.addEventListener("click", () => changeGPAWeight(table, "unweighted"));
        th.appendChild(button2);
        tr.appendChild(th);
        if (weight === "weighted")
            button1.id = "selected";
        else
            button2.id = "selected";
        thead.appendChild(tr);
    })();
    for (let i = 1; i <= semesters; i++) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.id = `${SessionsNames[semesters].toLowerCase()}-${i}-gpa`;
        td.innerText = `${SessionsNames[semesters]} ${i}\n4.00`;
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    (() => {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.id = "cumulative-gpa";
        td.innerText = "Cumulative\n4.00";
        tr.appendChild(td);
        tbody.appendChild(tr);
    })();
    (() => {
        const td = document.createElement("td");
        td.appendChild(gpaTable);
        table.tBodies[0].rows[0].appendChild(td);
    })();
}
function changeGPAWeight(table, weight) {
    const selected = table.tBodies[0].rows[0].cells[1].querySelector("#selected");
    if (selected.innerText.toLowerCase() === weight)
        return;
    selected.id = "";
    if (selected.nextSibling)
        selected.nextSibling.id = "selected";
    else
        selected.previousSibling.id = "selected";
    calculateGPA(table);
}
