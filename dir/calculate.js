import { gradeLevels, letterToGPA, percentageToGPA, cgpaTable, weightToGPA, SessionsNames, changeYear, mode } from "./index.js";
import { getCustom, getSystem, getWeight } from "./helpers.js";
var transcript = {};
export function changeTranscript(obj) { transcript = obj; }
export async function calculateGPA(table) {
    const system = getSystem(table);
    const weight = getWeight(table);
    const custom = getCustom(table);
    const subjectsTable = table.tBodies[0].rows[0].cells[0].firstChild;
    const sessionsAmount = subjectsTable.tHead.rows[0].cells.length - (custom ? 3 : 1);
    const sessionsName = SessionsNames[sessionsAmount];
    var qualityPoints = 0;
    var extraQualityPoints = 0;
    var credits = 0;
    let sessionQualityPoints = {};
    let sessionExtraQualityPoints = {};
    let sessionCredits = {};
    for (let i = 0; i < sessionsAmount; i++) {
        sessionQualityPoints[i] = 0;
        sessionExtraQualityPoints[i] = 0;
        sessionCredits[i] = 0;
    }
    if (!custom) {
        for (const tr of subjectsTable.tBodies[0].rows) {
            const classTd = tr.cells[0];
            const className = classTd.children.length === 0 ? classTd.innerText : classTd.children[0].value;
            if (mode.value === "transcript")
                await changeYear(table.dataset["year"]);
            const selects = tr.querySelectorAll("select.letter");
            const inputs = tr.querySelectorAll("input.percent");
            for (let i = 0; i < sessionsAmount; i++) {
                let credit = 0;
                let subject;
                if (typeof gradeLevels[table.id][i] === "string")
                    subject = gradeLevels[table.id][parseInt(gradeLevels[table.id][i])].find(subject => subject[className])[className];
                else
                    subject = gradeLevels[table.id][i].find(subject => subject[className])[className];
                credit = subject.credits;
                sessionExtraQualityPoints[i] += weightToGPA[subject.type];
                sessionCredits[i] += credit;
                if (system === "letter") {
                    sessionQualityPoints[i] += letterToGPA[selects[i].value] * credit;
                }
                else {
                    const mins = Object.keys(percentageToGPA).map(string => parseFloat(string)).sort((a, b) => b - a);
                    for (const min of mins) {
                        if (parseFloat(inputs[i].value) >= min) {
                            sessionQualityPoints[i] += percentageToGPA[min] * credit;
                            break;
                        }
                    }
                }
            }
        }
    }
    else {
        for (const tr of subjectsTable.tBodies[0].rows) {
            if (tr.cells[0].children.length === 0)
                break;
            const courseType = tr.cells[0].firstChild.value.toLowerCase();
            const selects = tr.querySelectorAll("select.letter");
            const inputs = tr.querySelectorAll("input.percent");
            for (let i = 0; i < sessionsAmount; i++) {
                sessionExtraQualityPoints[i] += weightToGPA[courseType];
                let credit = 0;
                credit = parseFloat(tr.cells[sessionsAmount + 2].firstChild.value);
                sessionCredits[i] += credit;
                if (system === "letter") {
                    sessionQualityPoints[i] += letterToGPA[selects[i].value] * credit;
                }
                else {
                    const mins = Object.keys(percentageToGPA).map(string => parseFloat(string)).sort((a, b) => b - a);
                    for (const min of mins) {
                        if (parseFloat(inputs[i].value) >= min) {
                            sessionQualityPoints[i] += percentageToGPA[min] * credit;
                            break;
                        }
                    }
                }
            }
        }
    }
    for (let i = 0; i < sessionsAmount; i++) {
        qualityPoints += sessionQualityPoints[i];
        extraQualityPoints += sessionExtraQualityPoints[i];
        credits += sessionCredits[i];
        table.querySelector(`td#${sessionsName.toLowerCase()}-${i + 1}-gpa`).innerText = `${sessionsName} ${i + 1}\n${((sessionQualityPoints[i] + (weight === "weighted" ? sessionExtraQualityPoints[i] : 0)) / sessionCredits[i]).toFixed(2)}`;
    }
    table.querySelector("td#cumulative-gpa").innerText = `Cumulative\n${((qualityPoints + (weight === "weighted" ? extraQualityPoints : 0)) / credits).toFixed(2)}`;
    transcript[parseInt(table.id)] = {
        qualityPoints: qualityPoints,
        extraQualityPoints: extraQualityPoints,
        credits: credits,
    };
    if (mode.value === "transcript")
        calculateCGPA();
}
export function calculateCGPA() {
    var totalQualityPoints = 0;
    var totalExtraQualityPoints = 0;
    var totalCredits = 0;
    for (const grade in transcript) {
        totalQualityPoints += transcript[grade].qualityPoints;
        totalExtraQualityPoints += transcript[grade].extraQualityPoints;
        totalCredits += transcript[grade].credits;
    }
    cgpaTable.tBodies[0].rows[0].cells[0].innerText = `CGPA: ${((totalQualityPoints + (cgpaTable.querySelector("button#selected").innerText.toLowerCase() === "weighted" ? totalExtraQualityPoints : 0)) / totalCredits).toFixed(2)}`;
}
