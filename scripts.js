import { ThaiNumberLearning } from './assets/ThaiNumberLearning.js';

const learningModule = new ThaiNumberLearning();

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text/plain");
    const letterElement = document.getElementById(data);
    if (!letterElement) return;

    // Determine the intended drop container: prefer the nearest .dropBox ancestor, otherwise #letters
    const dropBox = ev.target.closest('.dropBox');
    const lettersContainer = document.getElementById('letters');
    const dropTarget = dropBox || (ev.target === lettersContainer ? lettersContainer : null);

    if (!dropTarget) return; // Not a valid drop target

    // Prevent dropping into a dropBox that already has a child
    if (dropTarget.classList && dropTarget.classList.contains('dropBox') && dropTarget.hasChildNodes()) {
        return;
    }

    dropTarget.appendChild(letterElement);
    letterElement.style.backgroundColor = '#e0e0e0';

    const dropBoxes = document.querySelectorAll('.dropBox');
    learningModule.checkCompletion(dropBoxes);
}

// Use event delegation so newly created letters and drop boxes work without re-attaching listeners

document.addEventListener('dragstart', (ev) => {
    const t = ev.target;
    if (t && t.classList && t.classList.contains('letter')) {
        drag(ev);
    }
});

// dragover: allow drop when over a dropBox or the letters area
document.addEventListener('dragover', (ev) => {
    const dropBox = ev.target.closest && ev.target.closest('.dropBox');
    const lettersContainer = document.getElementById('letters');
    if (dropBox || ev.target === lettersContainer) {
        allowDrop(ev);
    }
});

// drop: delegate to the drop handler when appropriate
document.addEventListener('drop', (ev) => {
    const dropBox = ev.target.closest && ev.target.closest('.dropBox');
    const lettersContainer = document.getElementById('letters');
    if (dropBox || ev.target === lettersContainer) {
        drop(ev);
    }
});
