import { ThaiNumberLearning } from './assets/ThaiNumberLearning.js';

const learningModule = new ThaiNumberLearning();
// Expose to global so inline onclick handlers in index.html can access it
window.learningModule = learningModule;

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

function swapNodes(a, b) {
    // Safely swap two DOM nodes a and b even if they have different parents
    const parentA = a.parentNode;
    const parentB = b.parentNode;
    if (!parentA || !parentB) return;
    if (parentA === parentB) {
        // If in same parent, swap by replacing in order
        const nextA = a.nextSibling === b ? a : a.nextSibling;
        parentA.insertBefore(b, a);
        parentA.insertBefore(a, nextA);
        return;
    }

    const nextA = a.nextSibling;
    const nextB = b.nextSibling;

    parentA.insertBefore(b, nextA);
    parentB.insertBefore(a, nextB);
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

    // If dropTarget already has a child and the target is a dropBox, swap the dragged element with the existing child
    if (dropTarget.classList && dropTarget.classList.contains('dropBox') && dropTarget.hasChildNodes()) {
        const existing = dropTarget.firstChild;
        const parentOfDragged = letterElement.parentNode;

        if (parentOfDragged && parentOfDragged.classList && parentOfDragged.classList.contains('dropBox')) {
            // Swap between two drop boxes safely
            swapNodes(letterElement, existing);

            // Ensure styles remain consistent after swap
            letterElement.style.backgroundColor = '#e0e0e0';
            existing.style.backgroundColor = '#e0e0e0';
        } else {
            // If dragging from letters pool into an occupied box: place dragged into box and move existing back to pool
            dropTarget.replaceChild(letterElement, existing);
            existing.style.backgroundColor = '#e0e0e0';
            lettersContainer.appendChild(existing);
            letterElement.style.backgroundColor = '#e0e0e0';
        }

    } else {
        // Normal append for empty box or letters pool
        dropTarget.appendChild(letterElement);
        letterElement.style.backgroundColor = '#e0e0e0';
    }

    const dropBoxes = document.querySelectorAll('.dropBox');
    learningModule.checkCompletion(dropBoxes);
}

// Expose functions used by inline attributes to global scope because this file is an ES module
window.drag = drag;
window.allowDrop = allowDrop;
window.drop = drop;

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
