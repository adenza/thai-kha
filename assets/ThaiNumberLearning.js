import { NumberCombinations } from './NumberCombinations.js';

export class ThaiNumberLearning {
    constructor() {
        this.combinator = new NumberCombinations();
        // Use available numbers from the combinator as pool (can be extended)
        const available = this.combinator.availableNumbers();
        this.currentNumber = available[Math.floor(Math.random() * available.length)];

        this.setupFeedbackElement();
        this.updateUI();
    }

    randomNumber() {
        const keys = this.combinator.availableNumbers();
        return keys[Math.floor(Math.random() * keys.length)];
    }

    updateUI() {
        const entry = this.combinator.get(this.currentNumber) || this.combinator.compose(this.currentNumber);
        if (!entry) return;

        const numberEl = document.getElementById('number');
        if (numberEl) numberEl.textContent = this.currentNumber;

        const audioEl = document.getElementById('oneAudio');
        if (audioEl) audioEl.src = (entry.audio && entry.audio.length) ? entry.audio[0] : '';

        // Recreate drop boxes and letters for the current word
        const word = entry.text;
        this.ensureDropBoxes(word.length);

        // Clear pool and populate with shuffled tiles (correct letters + extras)
        this.populateLettersArea(true);
    }

    playAudio(audioId) {
        const audioElement = document.getElementById(audioId);
        if (audioElement) audioElement.play();
    }

    setupFeedbackElement() {
        let feedback = document.getElementById('feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'feedback';
            feedback.style.position = 'fixed';
            feedback.style.bottom = '20px';
            feedback.style.left = '50%';
            feedback.style.transform = 'translateX(-50%)';
            feedback.style.padding = '10px 14px';
            feedback.style.borderRadius = '6px';
            feedback.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            feedback.style.fontSize = '16px';
            feedback.style.display = 'none';
            feedback.style.zIndex = '9999';
            document.body.appendChild(feedback);
        }
        this.feedbackEl = feedback;
        this.feedbackTimeout = null;
    }

    showFeedback(message, type = 'info', timeout = 1800) {
        if (!this.feedbackEl) return;
        this.feedbackEl.textContent = message;
        if (type === 'success') {
            this.feedbackEl.style.backgroundColor = '#7CFC00';
            this.feedbackEl.style.color = '#000';
        } else if (type === 'error') {
            this.feedbackEl.style.backgroundColor = '#FF6347';
            this.feedbackEl.style.color = '#fff';
        } else {
            this.feedbackEl.style.backgroundColor = '#333';
            this.feedbackEl.style.color = '#fff';
        }
        this.feedbackEl.style.display = 'block';
        if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => {
            this.feedbackEl.style.display = 'none';
        }, timeout);
    }

    clearFeedback() {
        if (this.feedbackEl) {
            this.feedbackEl.style.display = 'none';
            if (this.feedbackTimeout) {
                clearTimeout(this.feedbackTimeout);
                this.feedbackTimeout = null;
            }
        }
    }

    ensureDropBoxes(length) {
        const dropArea = document.getElementById('dropArea');
        if (!dropArea) return;
        // Recreate only if different length or if empty
        const current = dropArea.querySelectorAll('.dropBox').length;
        if (current === length) return;

        dropArea.innerHTML = '';
        for (let i = 0; i < length; i++) {
            const box = document.createElement('div');
            box.className = 'dropBox';
            box.setAttribute('ondrop', 'drop(event)');
            box.setAttribute('ondragover', 'allowDrop(event)');
            dropArea.appendChild(box);
        }
    }

    populateLettersArea(forceReset = false) {
        const lettersArea = document.getElementById('letters');
        if (!lettersArea) return;

        if (!forceReset && lettersArea.querySelectorAll('.letter').length > 0) return;

        // Get correct letters for current number
        const entry = this.combinator.get(this.currentNumber) || this.combinator.compose(this.currentNumber);
        if (!entry) return;
        const correct = entry.text.split('');

        // Pool of extra letters - can be expanded or generated dynamically
        const extrasPool = ['บ','ก','ฟ','ม','ล','ค','ร','ส','ง','ต','จ','ว','ป','อ','น'];

        // Build tiles array = correct letters + random extras until we have correct.length + 3
        const tiles = [...correct];
        while (tiles.length < correct.length + 3) {
            const r = extrasPool[Math.floor(Math.random() * extrasPool.length)];
            tiles.push(r);
        }

        // Shuffle tiles
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        // Clear and append tiles
        lettersArea.innerHTML = '';
        tiles.forEach((ch, idx) => {
            const d = document.createElement('div');
            d.className = 'letter';
            d.id = `letter_${Date.now()}_${idx}`;
            d.textContent = ch;
            d.setAttribute('draggable', 'true');
            d.setAttribute('ondragstart', 'drag(event)');
            lettersArea.appendChild(d);
        });
    }

    moveLettersBackToPool() {
        const lettersArea = document.getElementById('letters');
        const dropBoxes = document.querySelectorAll('.dropBox');
        if (!lettersArea) return;

        dropBoxes.forEach(box => {
            while (box.firstChild) {
                const child = box.firstChild;
                child.style.backgroundColor = '';
                lettersArea.appendChild(child);
            }
        });
    }

    checkCompletion(dropBoxes) {
        const entry = this.combinator.get(this.currentNumber) || this.combinator.compose(this.currentNumber);
        if (!entry) return;
        const correctWord = entry.text;
        let userWord = "";
        let allFilled = true;

        dropBoxes.forEach((box, index) => {
            if (box.hasChildNodes()) {
                let letter = box.firstChild.textContent;
                userWord += letter;
                if (letter === correctWord[index]) {
                    box.firstChild.style.backgroundColor = '#7CFC00';
                } else {
                    box.firstChild.style.backgroundColor = '#FF6347';
                }
            } else {
                allFilled = false;
            }
        });

        if (allFilled && userWord === correctWord) {
            this.showFeedback('Correct!', 'success', 1500);
            setTimeout(() => {
                this.nextNumber();
                this.clearFeedback();
            }, 700);
        } else if (allFilled) {
            this.showFeedback('Not quite — try again.', 'error', 1500);
        }
    }

    nextNumber() {
        // move letters back
        this.moveLettersBackToPool();

        // choose a new number different from current if possible
        const keys = this.combinator.availableNumbers();
        if (keys.length > 1) {
            let next;
            do { next = keys[Math.floor(Math.random() * keys.length)]; } while (next === this.currentNumber);
            this.currentNumber = next;
        } else {
            this.currentNumber = this.randomNumber();
        }

        // recreate UI for next round
        this.updateUI();

        // ensure letters draggable
        document.querySelectorAll('#letters .letter').forEach(letter => {
            letter.style.backgroundColor = '';
            letter.setAttribute('draggable', 'true');
            try { letter.removeAttribute('ondragstart'); } catch (e) {}
            letter.setAttribute('ondragstart', 'drag(event)');
        });
    }
}
