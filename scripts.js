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

// --- DEBUG HELPERS: temporary logging and overlay to diagnose touch/tap issues ---
function ensureDebugOverlay() {
    let overlay = document.getElementById('touchDebugOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'touchDebugOverlay';
        overlay.style.position = 'fixed';
        overlay.style.width = '24px';
        overlay.style.height = '24px';
        overlay.style.borderRadius = '12px';
        overlay.style.background = 'rgba(255,0,0,0.6)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = 99999;
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }
    return overlay;
}

function showDebugDot(x, y, duration = 800) {
    const overlay = ensureDebugOverlay();
    overlay.style.left = `${x - 12}px`;
    overlay.style.top = `${y - 12}px`;
    overlay.style.display = 'block';
    setTimeout(() => { overlay.style.display = 'none'; }, duration);
}

console.log('Debug: scripts.js loaded');

// Touch support for mobile: simulate drag-and-drop using touch events
(function enableTouchDragAndDrop() {
    let touchState = {
        draggingEl: null,
        clone: null,
        startParent: null,
        startNextSibling: null
    };

    function findDropTargetAroundPoint(x, y, radius = 20) {
        // Search a square grid around (x,y) for a dropBox or #letters element
        const step = 5; // px
        for (let dx = -radius; dx <= radius; dx += step) {
            for (let dy = -radius; dy <= radius; dy += step) {
                const el = document.elementFromPoint(x + dx, y + dy);
                if (!el) continue;
                const drop = el.closest && (el.closest('.dropBox') || (el.id === 'letters' ? el : null));
                if (drop) return drop;
            }
        }
        return null;
    }

    function onTouchStart(e) {
        console.log('Debug touchstart', e.type, e.touches && e.touches.length);
        const t = e.target.closest && e.target.closest('.letter');
        console.log('Debug touchstart target.closest(.letter)=', t);
        if (!t) return;
        // Prevent normal behavior
        e.preventDefault();

        touchState.draggingEl = t;
        touchState.startParent = t.parentNode;
        touchState.startNextSibling = t.nextSibling;

        // Create a visual clone to follow the finger
        const rect = t.getBoundingClientRect();
        const clone = t.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.pointerEvents = 'none';
        clone.style.opacity = '0.9';
        clone.style.zIndex = 9999;
        document.body.appendChild(clone);
        touchState.clone = clone;

        // Optionally style original to indicate dragging
        t.style.visibility = 'hidden';
    }

    function onTouchMove(e) {
        if (!touchState.clone) return;
        const touch = e.touches[0];
        if (!touch) return;
        console.log('Debug touchmove', touch.clientX, touch.clientY);
        e.preventDefault();
        // Move clone so finger appears to drag it
        touchState.clone.style.left = `${touch.clientX - touchState.clone.offsetWidth / 2}px`;
        touchState.clone.style.top = `${touch.clientY - touchState.clone.offsetHeight / 2}px`;
    }

    function onTouchEnd(e) {
        console.log('Debug touchend', e.type, e.changedTouches && e.changedTouches.length);
        if (!touchState.draggingEl) return;
        e.preventDefault();
        const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
        if (touch) showDebugDot(touch.clientX, touch.clientY, 1000);
        let dropTarget = null;
        if (touch) {
            // First try the direct point
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            console.log('Debug elementFromPoint at touch=', el && el.tagName, 'closest dropBox=', el && el.closest && el.closest('.dropBox'));
            if (el) dropTarget = el.closest('.dropBox') || (el.id === 'letters' ? el : null);

            // If not found, search a small area around the point to account for fat fingers
            if (!dropTarget) {
                dropTarget = findDropTargetAroundPoint(touch.clientX, touch.clientY, 30);
                console.log('Debug searchAround found dropTarget=', dropTarget);
            }
        }

        // If no drop target, return to original pool
        if (!dropTarget) {
            console.log('Debug no drop target, restoring');
            // restore original
            if (touchState.startParent) {
                if (touchState.startNextSibling) touchState.startParent.insertBefore(touchState.draggingEl, touchState.startNextSibling);
                else touchState.startParent.appendChild(touchState.draggingEl);
            }
        } else {
            console.log('Debug dropping into', dropTarget);
            // If occupied dropBox, handle swap/move similar to drop()
            if (dropTarget.classList && dropTarget.classList.contains('dropBox') && dropTarget.hasChildNodes()) {
                const existing = dropTarget.firstChild;
                const parentOfDragged = touchState.draggingEl.parentNode;
                if (parentOfDragged && parentOfDragged.classList && parentOfDragged.classList.contains('dropBox')) {
                    swapNodes(touchState.draggingEl, existing);
                } else {
                    dropTarget.replaceChild(touchState.draggingEl, existing);
                    existing.style.backgroundColor = '#e0e0e0';
                    const lettersContainer = document.getElementById('letters');
                    if (lettersContainer) lettersContainer.appendChild(existing);
                }
            } else {
                dropTarget.appendChild(touchState.draggingEl);
            }
        }

        // cleanup
        if (touchState.clone && touchState.clone.parentNode) touchState.clone.parentNode.removeChild(touchState.clone);
        if (touchState.draggingEl) touchState.draggingEl.style.visibility = '';

        const dropBoxes = document.querySelectorAll('.dropBox');
        learningModule.checkCompletion(dropBoxes);

        touchState.draggingEl = null;
        touchState.clone = null;
        touchState.startParent = null;
        touchState.startNextSibling = null;
    }

    // Attach listeners on document so dynamically created letters are handled
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', onTouchEnd, { passive: false });
})();

// Tap-to-select / tap-to-place fallback to support DevTools mobile emulation and users who prefer taps
(function enableTapToPlaceFallback() {
    let selectedTile = null;

    function clearSelection() {
        if (selectedTile) {
            selectedTile.style.outline = '';
            selectedTile = null;
        }
    }

    function selectTile(tile) {
        clearSelection();
        selectedTile = tile;
        selectedTile.style.outline = '3px solid #008cba';
    }

    function onTap(e) {
        console.log('Debug onTap target=', e.target && e.target.className, 'id=', e.target && e.target.id);
        const target = e.target;
        // If tapping a letter, select it
        const letter = target.closest && target.closest('.letter');
        if (letter) {
            e.preventDefault();
            selectTile(letter);
            return;
        }

        // If tapping a dropBox or letters container while a tile is selected, place it
        if (selectedTile) {
            const dropBox = target.closest && target.closest('.dropBox');
            const lettersContainer = target.id === 'letters' ? target : target.closest && target.closest('#letters');
            const dropTarget = dropBox || lettersContainer || null;
            if (dropTarget) {
                console.log('Debug placing selected tile into', dropTarget);
                // Handle occupied dropBox swapping
                if (dropTarget.classList && dropTarget.classList.contains('dropBox') && dropTarget.hasChildNodes()) {
                    const existing = dropTarget.firstChild;
                    const parentOfSelected = selectedTile.parentNode;
                    if (parentOfSelected && parentOfSelected.classList && parentOfSelected.classList.contains('dropBox')) {
                        swapNodes(selectedTile, existing);
                    } else {
                        dropTarget.replaceChild(selectedTile, existing);
                        existing.style.backgroundColor = '#e0e0e0';
                        const letters = document.getElementById('letters');
                        if (letters) letters.appendChild(existing);
                    }
                } else {
                    dropTarget.appendChild(selectedTile);
                }

                // After placing, clear selection and check completion
                clearSelection();
                const dropBoxes = document.querySelectorAll('.dropBox');
                learningModule.checkCompletion(dropBoxes);
            } else {
                // Tapped somewhere else -> clear selection
                clearSelection();
            }
        }
    }

    document.addEventListener('click', onTap, true);
})();

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
