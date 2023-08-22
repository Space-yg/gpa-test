import { changeStartSystem, gradeLevels, gradesDiv, gradingSystems, mode } from "./index.js";
import { calculateGPA } from "./calculate.js";
export function addSystemButtons(table, start, element) {
    for (const system of gradingSystems) {
        const button = document.createElement("button");
        if (system === start)
            button.id = "selected";
        button.innerText = system[0].toUpperCase() + system.slice(1);
        button.addEventListener("click", () => {
            if (button.id === "selected")
                return;
            button.id = "selected";
            if (button.previousElementSibling)
                button.previousElementSibling.id = "";
            else if (button.nextElementSibling)
                button.nextElementSibling.id = "";
            changeSystem(table, system);
            calculateGPA(table);
        });
        element.appendChild(button);
    }
}
function changeSystem(table, system) {
    if (mode.value === "report card")
        changeStartSystem(system);
    else {
        let similar = true;
        for (const table of gradesDiv.children) {
            if (table instanceof HTMLBRElement)
                continue;
            if (getSystem(table) !== system) {
                similar = false;
                break;
            }
        }
        if (similar)
            changeStartSystem(system);
    }
    const tbody = table.tBodies[0];
    for (let i = 0; i < gradeLevels[table.id].length; i++) {
        for (const tr of tbody.rows[0].cells[i].firstChild.tBodies[0].rows) {
            if (tr.cells[0].children.length === 0 && tr.cells[0].innerText === "")
                break;
            const selects = tr.querySelectorAll("select.letter");
            const inputs = tr.querySelectorAll("input.percent");
            if (system === "letter") {
                for (const select of selects)
                    select.hidden = false;
                for (const input of inputs)
                    input.hidden = true;
            }
            else {
                for (const select of selects)
                    select.hidden = true;
                for (const input of inputs)
                    input.hidden = false;
            }
        }
    }
}
export function getWeight(table) {
    return table.tBodies[0].rows[0].cells[1].querySelector("button#selected").innerText.toLowerCase();
}
export function getCustom(table) {
    return table.tHead.rows[0].querySelector(`input#grade-${table.id}-custom`).checked;
}
export function getSystem(table) {
    return table.tHead.rows[1].querySelector("#selected").innerText.toLowerCase();
}
