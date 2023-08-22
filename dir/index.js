import { createGrade } from "./create.js";
import { calculateCGPA, changeTranscript } from "./calculate.js";
const year = document.querySelector("select#year");
const json = await (await fetch(`../years/${year.value}.json`)).json();
year.addEventListener("change", async () => {
    await changeYear(year.value);
    resetGPAScale();
    changeMode();
});
export async function changeYear(year) {
    const json = await (await fetch(`../years/${year}.json`)).json();
    gpaScale = json["gpa scale"];
    gradeLevels = json["grade levels"];
}
let gpaScale = json["gpa scale"];
export let gradeLevels = json["grade levels"];
const minGrade = String(gpaScale.at(-1).percentage.min);
export const maxGrade = String(gpaScale[0].percentage.max);
export let letterToGPA = {};
export let percentageToGPA = {};
export let allLetters = [];
const keysTbody = document.querySelector("tbody#keys");
function resetGPAScale() {
    letterToGPA = {};
    percentageToGPA = {};
    allLetters = [];
    gpaScale.forEach(data => {
        letterToGPA[data.letter] = data.gpa;
        percentageToGPA[data.percentage.min] = data.gpa;
        allLetters.push(data.letter);
    });
    keysTbody.innerHTML = "";
    for (let i = 0; i < gpaScale.length; i++)
        keysTbody.innerHTML += `
    <tr>
        <td>${gpaScale[i].letter}</td>
        <td>${gpaScale[i].gpa}</td>
        <td>${gpaScale[i].percentage.min}-${i === 0 ? gpaScale[i].percentage.max : gpaScale[i - 1].percentage.min - 1}</td>
    </tr>`;
}
resetGPAScale();
export const gradingSystems = ["letter", "percentage"];
var startGrade = "12";
export var startSystem = "letter";
export function changeStartSystem(system) { if (system !== startSystem)
    startSystem = system; }
var startWeight = "weighted";
export const gradesLevels = document.querySelector("select#gradesLevels");
export const weightToGPA = {
    regular: 0,
    honers: 0.5,
    ap: 1,
    ib: 1,
    college: 1,
};
export const subjectWeights = [
    "Regular",
    "Honers",
    "AP",
    "IB",
    "College",
];
export const SessionsNames = {
    2: "Semester",
    3: "Trimester",
    4: "Quarter",
};
const transcript = {};
for (const grade in gradeLevels) {
    transcript[parseInt(grade)] = {
        qualityPoints: 0,
        extraQualityPoints: 0,
        credits: 0,
    };
    gradeLevels[grade].forEach(session => {
        if (typeof session === "string") {
            gradeLevels[grade][parseInt(session)].forEach(subject => {
                const data = subject[Object.keys(subject)[0]];
                transcript[parseInt(grade)].credits += data.credits;
                transcript[parseInt(grade)].qualityPoints += 4 * data.credits;
                transcript[parseInt(grade)].extraQualityPoints += weightToGPA[data.type];
            });
        }
        else {
            session.forEach(subject => {
                const data = subject[Object.keys(subject)[0]];
                transcript[parseInt(grade)].credits += data.credits;
                transcript[parseInt(grade)].qualityPoints += 4 * data.credits;
                transcript[parseInt(grade)].extraQualityPoints += weightToGPA[data.type];
            });
        }
    });
}
console.log(transcript);
changeTranscript(transcript);
export const gradesDiv = document.querySelector("div#grades");
export const mode = document.querySelector("select#mode");
export const cgpaTable = document.querySelector("table#cgpa");
(() => {
    const td = cgpaTable.tHead.rows[0].cells[0];
    const button1 = document.createElement("button");
    button1.innerText = "Weighted";
    button1.addEventListener("click", () => {
        const selected = cgpaTable.tHead.rows[0].querySelector("#selected");
        if (selected.innerText.toLowerCase() === "weighted")
            return;
        selected.id = "";
        if (selected.nextSibling)
            selected.nextSibling.id = "selected";
        else
            selected.previousSibling.id = "selected";
        calculateCGPA();
    });
    td.appendChild(button1);
    const button2 = document.createElement("button");
    button2.innerText = "Unweighted";
    button2.addEventListener("click", () => {
        const selected = cgpaTable.tHead.rows[0].querySelector("#selected");
        if (selected.innerText.toLowerCase() === "unweighted")
            return;
        selected.id = "";
        if (selected.nextSibling)
            selected.nextSibling.id = "selected";
        else
            selected.previousSibling.id = "selected";
        calculateCGPA();
    });
    td.appendChild(button2);
    if (startWeight === "weighted")
        button1.id = "selected";
    else
        button2.id = "selected";
})();
async function changeMode() {
    gradesDiv.innerHTML = "";
    gradesLevels.innerHTML = "";
    for (const grade in gradeLevels)
        gradesLevels.innerHTML += `<option value="${grade}" ${grade === startGrade ? "selected" : ""}>${grade}</option>`;
    gradesLevels.onchange = () => {
        startGrade = gradesLevels.value;
        changeMode();
    };
    if (mode.value === "report card") {
        gradesDiv.style.gridTemplateColumns = "1fr";
        gradesLevels.hidden = false;
        gradesLevels.parentElement.hidden = false;
        cgpaTable.hidden = true;
        const table = createGrade(startGrade, year.value, startSystem, startWeight);
        gradesDiv.appendChild(table);
    }
    else if (mode.value === "transcript") {
        gradesLevels.hidden = true;
        gradesLevels.parentElement.hidden = true;
        cgpaTable.hidden = false;
        let subtractYears = 3;
        for (const grade in gradeLevels) {
            await changeYear((parseInt(year.value) - subtractYears).toString());
            const table = createGrade(grade, parseInt(year.value) - subtractYears, startSystem, startWeight);
            gradesDiv.appendChild(table);
            gradesDiv.appendChild(document.createElement("br"));
            subtractYears--;
        }
    }
}
mode.addEventListener("change", changeMode);
changeMode();
