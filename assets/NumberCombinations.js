export class NumberCombinations {
    constructor() {
        // Dictionary maps numeric value to { text: <Thai word>, audio: [<audio file paths>] }
        // Audio arrays allow multiple recordings or variants per item.
        this.dictionary = {
            1:  { text: "หนึ่ง",    audio: ["audio/1.mp3"] },
            2:  { text: "สอง",      audio: ["audio/2.mp3"] },
            3:  { text: "สาม",      audio: ["audio/3.mp3"] },
            4:  { text: "สี่",       audio: ["audio/4.mp3"] },
            5:  { text: "ห้า",      audio: ["audio/5.mp3"] },
            6:  { text: "หก",       audio: ["audio/6.mp3"] },
            7:  { text: "เจ็ด",     audio: ["audio/7.mp3"] },
            8:  { text: "แปด",      audio: ["audio/8.mp3"] },
            9:  { text: "เก้า",     audio: ["audio/9.mp3"] },
            10: { text: "สิบ",      audio: ["audio/10.mp3"] },

            11: { text: "สิบเอ็ด",   audio: ["audio/11.mp3"] },
            12: { text: "สิบสอง",   audio: ["audio/12.mp3"] },
            13: { text: "สิบสาม",   audio: ["audio/13.mp3"] },
            14: { text: "สิบสี่",    audio: ["audio/14.mp3"] },
            15: { text: "สิบห้า",   audio: ["audio/15.mp3"] },
            16: { text: "สิบหก",    audio: ["audio/16.mp3"] },
            17: { text: "สิบเจ็ด",  audio: ["audio/17.mp3"] },
            18: { text: "สิบแปด",   audio: ["audio/18.mp3"] },
            19: { text: "สิบเก้า",   audio: ["audio/19.mp3"] },

            20: { text: "ยี่สิบ",   audio: ["audio/20.mp3"] },
            30: { text: "สามสิบ",   audio: ["audio/30.mp3"] },
            40: { text: "สี่สิบ",    audio: ["audio/40.mp3"] },
            50: { text: "ห้าสิบ",   audio: ["audio/50.mp3"] },
            60: { text: "หกสิบ",    audio: ["audio/60.mp3"] },
            70: { text: "เจ็ดสิบ",  audio: ["audio/70.mp3"] },
            80: { text: "แปดสิบ",   audio: ["audio/80.mp3"] },
            90: { text: "เก้าสิบ",  audio: ["audio/90.mp3"] },

            100: { text: "หนึ่งร้อย", audio: ["audio/100.mp3"] },
            200: { text: "สองร้อย",  audio: ["audio/200.mp3"] },
            500: { text: "ห้าร้อย",   audio: ["audio/500.mp3"] },
            1000:{ text: "หนึ่งพัน",  audio: ["audio/1000.mp3"] }
        };
    }

    // Return entry for numeric key. If missing, returns null.
    get(number) {
        return this.dictionary[number] || null;
    }

    // Return an array of available numeric keys sorted ascending
    availableNumbers() {
        return Object.keys(this.dictionary).map(k => parseInt(k, 10)).sort((a,b) => a-b);
    }

    // Helper: build composition for numbers not explicitly in dictionary (e.g., 21 => ยี่สิบเอ็ด)
    // This is a simple implementation for numbers 1..99 combining known tens and units.
    compose(number) {
        if (this.dictionary[number]) return this.dictionary[number];
        if (number > 0 && number < 100) {
            const tens = Math.floor(number / 10) * 10;
            const unit = number % 10;
            let tensText = '';
            let unitText = '';

            if (this.dictionary[tens]) tensText = this.dictionary[tens].text;
            if (this.dictionary[unit]) unitText = this.dictionary[unit].text;

            const combined = (tensText && unitText) ? `${tensText}${unitText}` : null;
            if (combined) {
                return { text: combined, audio: [] };
            }
        }
        return null;
    }
}
