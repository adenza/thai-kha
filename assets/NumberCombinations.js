export class NumberCombinations {
    constructor() {
        // Dictionary maps numeric value to { text: <Thai word>, tiles: [<visible graphemes>], audio: [<audio file paths>] }
        this.dictionary = {
            1:  { text: "หนึ่ง",    tiles: ["หน","ึ่","ง"],    audio: ["audio/1.mp3"] },
            2:  { text: "สอง",      tiles: ["ส","อ","ง"],      audio: ["audio/2.mp3"] },
            3:  { text: "สาม",      tiles: ["ส","า","ม"],      audio: ["audio/3.mp3"] },
            4:  { text: "สี่",       tiles: ["ส","ี่"],           audio: ["audio/4.mp3"] },
            5:  { text: "ห้า",      tiles: ["ห","้า"],           audio: ["audio/5.mp3"] },
            6:  { text: "หก",       tiles: ["ห","ก"],           audio: ["audio/6.mp3"] },
            7:  { text: "เจ็ด",     tiles: ["เจ","็ด"],         audio: ["audio/7.mp3"] },
            8:  { text: "แปด",      tiles: ["แ","ป","ด"],     audio: ["audio/8.mp3"] },
            9:  { text: "เก้า",     tiles: ["เก","้า"],         audio: ["audio/9.mp3"] },
            10: { text: "สิบ",      tiles: ["ส","ิบ"],         audio: ["audio/10.mp3"] },

            11: { text: "สิบเอ็ด",  tiles: ["สิบเอ็ด"],         audio: ["audio/11.mp3"] },
            12: { text: "สิบสอง",  tiles: ["สิบ","สอง"],     audio: ["audio/12.mp3"] },
            13: { text: "สิบสาม",  tiles: ["สิบ","สาม"],     audio: ["audio/13.mp3"] },
            14: { text: "สิบสี่",   tiles: ["สิบ","สี่"],      audio: ["audio/14.mp3"] },
            15: { text: "สิบห้า",  tiles: ["สิบ","ห้า"],     audio: ["audio/15.mp3"] },
            16: { text: "สิบหก",   tiles: ["สิบ","หก"],      audio: ["audio/16.mp3"] },
            17: { text: "สิบเจ็ด", tiles: ["สิบ","เจ็ด"],    audio: ["audio/17.mp3"] },
            18: { text: "สิบแปด",  tiles: ["สิบ","แปด"],     audio: ["audio/18.mp3"] },
            19: { text: "สิบเก้า",  tiles: ["สิบ","เก้า"],    audio: ["audio/19.mp3"] },

            20: { text: "ยี่สิบ",  tiles: ["ยี่","สิบ"],     audio: ["audio/20.mp3"] },
            30: { text: "สามสิบ",  tiles: ["สาม","สิบ"],     audio: ["audio/30.mp3"] },
            40: { text: "สี่สิบ",   tiles: ["สี่","สิบ"],      audio: ["audio/40.mp3"] },
            50: { text: "ห้าสิบ",  tiles: ["ห้า","สิบ"],     audio: ["audio/50.mp3"] },
            60: { text: "หกสิบ",   tiles: ["หก","สิบ"],      audio: ["audio/60.mp3"] },
            70: { text: "เจ็ดสิบ", tiles: ["เจ็ด","สิบ"],    audio: ["audio/70.mp3"] },
            80: { text: "แปดสิบ",  tiles: ["แปด","สิบ"],     audio: ["audio/80.mp3"] },
            90: { text: "เก้าสิบ", tiles: ["เก้า","สิบ"],    audio: ["audio/90.mp3"] },

            100: { text: "หนึ่งร้อย", tiles: ["หนึ่ง","ร้อย"], audio: ["audio/100.mp3"] },
            200: { text: "สองร้อย",  tiles: ["สอง","ร้อย"],  audio: ["audio/200.mp3"] },
            500: { text: "ห้าร้อย",   tiles: ["ห้า","ร้อย"],   audio: ["audio/500.mp3"] },
            1000:{ text: "หนึ่งพัน",  tiles: ["หนึ่ง","พัน"],  audio: ["audio/1000.mp3"] }
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
    // This simple implementation composes tiles and text for numbers 1..99 combining known tens and units.
    compose(number) {
        if (this.dictionary[number]) return this.dictionary[number];
        if (number > 0 && number < 100) {
            const tens = Math.floor(number / 10) * 10;
            const unit = number % 10;
            const tensEntry = this.dictionary[tens];
            const unitEntry = this.dictionary[unit];
            if (tensEntry && unitEntry) {
                return {
                    text: `${tensEntry.text}${unitEntry.text}`,
                    tiles: [...(tensEntry.tiles || [tensEntry.text]), ...(unitEntry.tiles || [unitEntry.text])],
                    audio: []
                };
            }
        }
        return null;
    }
}
