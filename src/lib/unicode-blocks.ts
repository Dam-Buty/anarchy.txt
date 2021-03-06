import { ucs2 } from "punycode";

export function getUnicodeBlock(letter: string): string {
  const [decimalValue] = ucs2.decode(letter);
  const block = unicodeBlocks.find(({ start, end }) => {
    const decimalStart = parseInt(start, 16);
    const decimalEnd = parseInt(end, 16);

    return decimalStart <= decimalValue && decimalEnd >= decimalValue;
  });
  return block.name;
}

const unicodeBlocks: { start: string; end: string; name: string }[] = [
  {
    start: "0000",
    end: "007F",
    name: "Basic Latin",
  },
  {
    start: "0080",
    end: "00FF",
    name: "Latin-1 Supplement",
  },
  {
    start: "0100",
    end: "017F",
    name: "Latin Extended-A",
  },
  {
    start: "0180",
    end: "024F",
    name: "Latin Extended-B",
  },
  {
    start: "0250",
    end: "02AF",
    name: "IPA Extensions",
  },
  {
    start: "02B0",
    end: "02FF",
    name: "Spacing Modifier Letters",
  },
  {
    start: "0300",
    end: "036F",
    name: "Combining Diacritical Marks",
  },
  {
    start: "0370",
    end: "03FF",
    name: "Greek and Coptic",
  },
  {
    start: "0400",
    end: "04FF",
    name: "Cyrillic",
  },
  {
    start: "0500",
    end: "052F",
    name: "Cyrillic Supplement",
  },
  {
    start: "0530",
    end: "058F",
    name: "Armenian",
  },
  {
    start: "0590",
    end: "05FF",
    name: "Hebrew",
  },
  {
    start: "0600",
    end: "06FF",
    name: "Arabic",
  },
  {
    start: "0700",
    end: "074F",
    name: "Syriac",
  },
  {
    start: "0750",
    end: "077F",
    name: "Arabic Supplement",
  },
  {
    start: "0780",
    end: "07BF",
    name: "Thaana",
  },
  {
    start: "07C0",
    end: "07FF",
    name: "NKo",
  },
  {
    start: "0800",
    end: "083F",
    name: "Samaritan",
  },
  {
    start: "0840",
    end: "085F",
    name: "Mandaic",
  },
  {
    start: "0860",
    end: "086F",
    name: "Syriac Supplement",
  },
  {
    start: "0870",
    end: "089F",
    name: "Arabic Extended-B",
  },
  {
    start: "08A0",
    end: "08FF",
    name: "Arabic Extended-A",
  },
  {
    start: "0900",
    end: "097F",
    name: "Devanagari",
  },
  {
    start: "0980",
    end: "09FF",
    name: "Bengali",
  },
  {
    start: "0A00",
    end: "0A7F",
    name: "Gurmukhi",
  },
  {
    start: "0A80",
    end: "0AFF",
    name: "Gujarati",
  },
  {
    start: "0B00",
    end: "0B7F",
    name: "Oriya",
  },
  {
    start: "0B80",
    end: "0BFF",
    name: "Tamil",
  },
  {
    start: "0C00",
    end: "0C7F",
    name: "Telugu",
  },
  {
    start: "0C80",
    end: "0CFF",
    name: "Kannada",
  },
  {
    start: "0D00",
    end: "0D7F",
    name: "Malayalam",
  },
  {
    start: "0D80",
    end: "0DFF",
    name: "Sinhala",
  },
  {
    start: "0E00",
    end: "0E7F",
    name: "Thai",
  },
  {
    start: "0E80",
    end: "0EFF",
    name: "Lao",
  },
  {
    start: "0F00",
    end: "0FFF",
    name: "Tibetan",
  },
  {
    start: "1000",
    end: "109F",
    name: "Myanmar",
  },
  {
    start: "10A0",
    end: "10FF",
    name: "Georgian",
  },
  {
    start: "1100",
    end: "11FF",
    name: "Hangul Jamo",
  },
  {
    start: "1200",
    end: "137F",
    name: "Ethiopic",
  },
  {
    start: "1380",
    end: "139F",
    name: "Ethiopic Supplement",
  },
  {
    start: "13A0",
    end: "13FF",
    name: "Cherokee",
  },
  {
    start: "1400",
    end: "167F",
    name: "Unified Canadian Aboriginal Syllabics",
  },
  {
    start: "1680",
    end: "169F",
    name: "Ogham",
  },
  {
    start: "16A0",
    end: "16FF",
    name: "Runic",
  },
  {
    start: "1700",
    end: "171F",
    name: "Tagalog",
  },
  {
    start: "1720",
    end: "173F",
    name: "Hanunoo",
  },
  {
    start: "1740",
    end: "175F",
    name: "Buhid",
  },
  {
    start: "1760",
    end: "177F",
    name: "Tagbanwa",
  },
  {
    start: "1780",
    end: "17FF",
    name: "Khmer",
  },
  {
    start: "1800",
    end: "18AF",
    name: "Mongolian",
  },
  {
    start: "18B0",
    end: "18FF",
    name: "Unified Canadian Aboriginal Syllabics Extended",
  },
  {
    start: "1900",
    end: "194F",
    name: "Limbu",
  },
  {
    start: "1950",
    end: "197F",
    name: "Tai Le",
  },
  {
    start: "1980",
    end: "19DF",
    name: "New Tai Lue",
  },
  {
    start: "19E0",
    end: "19FF",
    name: "Khmer Symbols",
  },
  {
    start: "1A00",
    end: "1A1F",
    name: "Buginese",
  },
  {
    start: "1A20",
    end: "1AAF",
    name: "Tai Tham",
  },
  {
    start: "1AB0",
    end: "1AFF",
    name: "Combining Diacritical Marks Extended",
  },
  {
    start: "1B00",
    end: "1B7F",
    name: "Balinese",
  },
  {
    start: "1B80",
    end: "1BBF",
    name: "Sundanese",
  },
  {
    start: "1BC0",
    end: "1BFF",
    name: "Batak",
  },
  {
    start: "1C00",
    end: "1C4F",
    name: "Lepcha",
  },
  {
    start: "1C50",
    end: "1C7F",
    name: "Ol Chiki",
  },
  {
    start: "1C80",
    end: "1C8F",
    name: "Cyrillic Extended-C",
  },
  {
    start: "1C90",
    end: "1CBF",
    name: "Georgian Extended",
  },
  {
    start: "1CC0",
    end: "1CCF",
    name: "Sundanese Supplement",
  },
  {
    start: "1CD0",
    end: "1CFF",
    name: "Vedic Extensions",
  },
  {
    start: "1D00",
    end: "1D7F",
    name: "Phonetic Extensions",
  },
  {
    start: "1D80",
    end: "1DBF",
    name: "Phonetic Extensions Supplement",
  },
  {
    start: "1DC0",
    end: "1DFF",
    name: "Combining Diacritical Marks Supplement",
  },
  {
    start: "1E00",
    end: "1EFF",
    name: "Latin Extended Additional",
  },
  {
    start: "1F00",
    end: "1FFF",
    name: "Greek Extended",
  },
  {
    start: "2000",
    end: "206F",
    name: "General Punctuation",
  },
  {
    start: "2070",
    end: "209F",
    name: "Superscripts and Subscripts",
  },
  {
    start: "20A0",
    end: "20CF",
    name: "Currency Symbols",
  },
  {
    start: "20D0",
    end: "20FF",
    name: "Combining Diacritical Marks for Symbols",
  },
  {
    start: "2100",
    end: "214F",
    name: "Letterlike Symbols",
  },
  {
    start: "2150",
    end: "218F",
    name: "Number Forms",
  },
  {
    start: "2190",
    end: "21FF",
    name: "Arrows",
  },
  {
    start: "2200",
    end: "22FF",
    name: "Mathematical Operators",
  },
  {
    start: "2300",
    end: "23FF",
    name: "Miscellaneous Technical",
  },
  {
    start: "2400",
    end: "243F",
    name: "Control Pictures",
  },
  {
    start: "2440",
    end: "245F",
    name: "Optical Character Recognition",
  },
  {
    start: "2460",
    end: "24FF",
    name: "Enclosed Alphanumerics",
  },
  {
    start: "2500",
    end: "257F",
    name: "Box Drawing",
  },
  {
    start: "2580",
    end: "259F",
    name: "Block Elements",
  },
  {
    start: "25A0",
    end: "25FF",
    name: "Geometric Shapes",
  },
  {
    start: "2600",
    end: "26FF",
    name: "Miscellaneous Symbols",
  },
  {
    start: "2700",
    end: "27BF",
    name: "Dingbats",
  },
  {
    start: "27C0",
    end: "27EF",
    name: "Miscellaneous Mathematical Symbols-A",
  },
  {
    start: "27F0",
    end: "27FF",
    name: "Supplemental Arrows-A",
  },
  {
    start: "2800",
    end: "28FF",
    name: "Braille Patterns",
  },
  {
    start: "2900",
    end: "297F",
    name: "Supplemental Arrows-B",
  },
  {
    start: "2980",
    end: "29FF",
    name: "Miscellaneous Mathematical Symbols-B",
  },
  {
    start: "2A00",
    end: "2AFF",
    name: "Supplemental Mathematical Operators",
  },
  {
    start: "2B00",
    end: "2BFF",
    name: "Miscellaneous Symbols and Arrows",
  },
  {
    start: "2C00",
    end: "2C5F",
    name: "Glagolitic",
  },
  {
    start: "2C60",
    end: "2C7F",
    name: "Latin Extended-C",
  },
  {
    start: "2C80",
    end: "2CFF",
    name: "Coptic",
  },
  {
    start: "2D00",
    end: "2D2F",
    name: "Georgian Supplement",
  },
  {
    start: "2D30",
    end: "2D7F",
    name: "Tifinagh",
  },
  {
    start: "2D80",
    end: "2DDF",
    name: "Ethiopic Extended",
  },
  {
    start: "2DE0",
    end: "2DFF",
    name: "Cyrillic Extended-A",
  },
  {
    start: "2E00",
    end: "2E7F",
    name: "Supplemental Punctuation",
  },
  {
    start: "2E80",
    end: "2EFF",
    name: "CJK Radicals Supplement",
  },
  {
    start: "2F00",
    end: "2FDF",
    name: "Kangxi Radicals",
  },
  {
    start: "2FF0",
    end: "2FFF",
    name: "Ideographic Description Characters",
  },
  {
    start: "3000",
    end: "303F",
    name: "CJK Symbols and Punctuation",
  },
  {
    start: "3040",
    end: "309F",
    name: "Hiragana",
  },
  {
    start: "30A0",
    end: "30FF",
    name: "Katakana",
  },
  {
    start: "3100",
    end: "312F",
    name: "Bopomofo",
  },
  {
    start: "3130",
    end: "318F",
    name: "Hangul Compatibility Jamo",
  },
  {
    start: "3190",
    end: "319F",
    name: "Kanbun",
  },
  {
    start: "31A0",
    end: "31BF",
    name: "Bopomofo Extended",
  },
  {
    start: "31C0",
    end: "31EF",
    name: "CJK Strokes",
  },
  {
    start: "31F0",
    end: "31FF",
    name: "Katakana Phonetic Extensions",
  },
  {
    start: "3200",
    end: "32FF",
    name: "Enclosed CJK Letters and Months",
  },
  {
    start: "3300",
    end: "33FF",
    name: "CJK Compatibility",
  },
  {
    start: "3400",
    end: "4DBF",
    name: "CJK Unified Ideographs Extension A",
  },
  {
    start: "4DC0",
    end: "4DFF",
    name: "Yijing Hexagram Symbols",
  },
  {
    start: "4E00",
    end: "9FFF",
    name: "CJK Unified Ideographs",
  },
  {
    start: "A000",
    end: "A48F",
    name: "Yi Syllables",
  },
  {
    start: "A490",
    end: "A4CF",
    name: "Yi Radicals",
  },
  {
    start: "A4D0",
    end: "A4FF",
    name: "Lisu",
  },
  {
    start: "A500",
    end: "A63F",
    name: "Vai",
  },
  {
    start: "A640",
    end: "A69F",
    name: "Cyrillic Extended-B",
  },
  {
    start: "A6A0",
    end: "A6FF",
    name: "Bamum",
  },
  {
    start: "A700",
    end: "A71F",
    name: "Modifier Tone Letters",
  },
  {
    start: "A720",
    end: "A7FF",
    name: "Latin Extended-D",
  },
  {
    start: "A800",
    end: "A82F",
    name: "Syloti Nagri",
  },
  {
    start: "A830",
    end: "A83F",
    name: "Common Indic Number Forms",
  },
  {
    start: "A840",
    end: "A87F",
    name: "Phags-pa",
  },
  {
    start: "A880",
    end: "A8DF",
    name: "Saurashtra",
  },
  {
    start: "A8E0",
    end: "A8FF",
    name: "Devanagari Extended",
  },
  {
    start: "A900",
    end: "A92F",
    name: "Kayah Li",
  },
  {
    start: "A930",
    end: "A95F",
    name: "Rejang",
  },
  {
    start: "A960",
    end: "A97F",
    name: "Hangul Jamo Extended-A",
  },
  {
    start: "A980",
    end: "A9DF",
    name: "Javanese",
  },
  {
    start: "A9E0",
    end: "A9FF",
    name: "Myanmar Extended-B",
  },
  {
    start: "AA00",
    end: "AA5F",
    name: "Cham",
  },
  {
    start: "AA60",
    end: "AA7F",
    name: "Myanmar Extended-A",
  },
  {
    start: "AA80",
    end: "AADF",
    name: "Tai Viet",
  },
  {
    start: "AAE0",
    end: "AAFF",
    name: "Meetei Mayek Extensions",
  },
  {
    start: "AB00",
    end: "AB2F",
    name: "Ethiopic Extended-A",
  },
  {
    start: "AB30",
    end: "AB6F",
    name: "Latin Extended-E",
  },
  {
    start: "AB70",
    end: "ABBF",
    name: "Cherokee Supplement",
  },
  {
    start: "ABC0",
    end: "ABFF",
    name: "Meetei Mayek",
  },
  {
    start: "AC00",
    end: "D7AF",
    name: "Hangul Syllables",
  },
  {
    start: "D7B0",
    end: "D7FF",
    name: "Hangul Jamo Extended-B",
  },
  {
    start: "D800",
    end: "DB7F",
    name: "High Surrogates",
  },
  {
    start: "DB80",
    end: "DBFF",
    name: "High Private Use Surrogates",
  },
  {
    start: "DC00",
    end: "DFFF",
    name: "Low Surrogates",
  },
  {
    start: "E000",
    end: "F8FF",
    name: "Private Use Area",
  },
  {
    start: "F900",
    end: "FAFF",
    name: "CJK Compatibility Ideographs",
  },
  {
    start: "FB00",
    end: "FB4F",
    name: "Alphabetic Presentation Forms",
  },
  {
    start: "FB50",
    end: "FDFF",
    name: "Arabic Presentation Forms-A",
  },
  {
    start: "FE00",
    end: "FE0F",
    name: "Variation Selectors",
  },
  {
    start: "FE10",
    end: "FE1F",
    name: "Vertical Forms",
  },
  {
    start: "FE20",
    end: "FE2F",
    name: "Combining Half Marks",
  },
  {
    start: "FE30",
    end: "FE4F",
    name: "CJK Compatibility Forms",
  },
  {
    start: "FE50",
    end: "FE6F",
    name: "Small Form Variants",
  },
  {
    start: "FE70",
    end: "FEFF",
    name: "Arabic Presentation Forms-B",
  },
  {
    start: "FF00",
    end: "FFEF",
    name: "Halfwidth and Fullwidth Forms",
  },
  {
    start: "FFF0",
    end: "FFFF",
    name: "Specials",
  },
  {
    start: "10000",
    end: "1007F",
    name: "Linear B Syllabary",
  },
  {
    start: "10080",
    end: "100FF",
    name: "Linear B Ideograms",
  },
  {
    start: "10100",
    end: "1013F",
    name: "Aegean Numbers",
  },
  {
    start: "10140",
    end: "1018F",
    name: "Ancient Greek Numbers",
  },
  {
    start: "10190",
    end: "101CF",
    name: "Ancient Symbols",
  },
  {
    start: "101D0",
    end: "101FF",
    name: "Phaistos Disc",
  },
  {
    start: "10280",
    end: "1029F",
    name: "Lycian",
  },
  {
    start: "102A0",
    end: "102DF",
    name: "Carian",
  },
  {
    start: "102E0",
    end: "102FF",
    name: "Coptic Epact Numbers",
  },
  {
    start: "10300",
    end: "1032F",
    name: "Old Italic",
  },
  {
    start: "10330",
    end: "1034F",
    name: "Gothic",
  },
  {
    start: "10350",
    end: "1037F",
    name: "Old Permic",
  },
  {
    start: "10380",
    end: "1039F",
    name: "Ugaritic",
  },
  {
    start: "103A0",
    end: "103DF",
    name: "Old Persian",
  },
  {
    start: "10400",
    end: "1044F",
    name: "Deseret",
  },
  {
    start: "10450",
    end: "1047F",
    name: "Shavian",
  },
  {
    start: "10480",
    end: "104AF",
    name: "Osmanya",
  },
  {
    start: "104B0",
    end: "104FF",
    name: "Osage",
  },
  {
    start: "10500",
    end: "1052F",
    name: "Elbasan",
  },
  {
    start: "10530",
    end: "1056F",
    name: "Caucasian Albanian",
  },
  {
    start: "10570",
    end: "105BF",
    name: "Vithkuqi",
  },
  {
    start: "10600",
    end: "1077F",
    name: "Linear A",
  },
  {
    start: "10780",
    end: "107BF",
    name: "Latin Extended-F",
  },
  {
    start: "10800",
    end: "1083F",
    name: "Cypriot Syllabary",
  },
  {
    start: "10840",
    end: "1085F",
    name: "Imperial Aramaic",
  },
  {
    start: "10860",
    end: "1087F",
    name: "Palmyrene",
  },
  {
    start: "10880",
    end: "108AF",
    name: "Nabataean",
  },
  {
    start: "108E0",
    end: "108FF",
    name: "Hatran",
  },
  {
    start: "10900",
    end: "1091F",
    name: "Phoenician",
  },
  {
    start: "10920",
    end: "1093F",
    name: "Lydian",
  },
  {
    start: "10980",
    end: "1099F",
    name: "Meroitic Hieroglyphs",
  },
  {
    start: "109A0",
    end: "109FF",
    name: "Meroitic Cursive",
  },
  {
    start: "10A00",
    end: "10A5F",
    name: "Kharoshthi",
  },
  {
    start: "10A60",
    end: "10A7F",
    name: "Old South Arabian",
  },
  {
    start: "10A80",
    end: "10A9F",
    name: "Old North Arabian",
  },
  {
    start: "10AC0",
    end: "10AFF",
    name: "Manichaean",
  },
  {
    start: "10B00",
    end: "10B3F",
    name: "Avestan",
  },
  {
    start: "10B40",
    end: "10B5F",
    name: "Inscriptional Parthian",
  },
  {
    start: "10B60",
    end: "10B7F",
    name: "Inscriptional Pahlavi",
  },
  {
    start: "10B80",
    end: "10BAF",
    name: "Psalter Pahlavi",
  },
  {
    start: "10C00",
    end: "10C4F",
    name: "Old Turkic",
  },
  {
    start: "10C80",
    end: "10CFF",
    name: "Old Hungarian",
  },
  {
    start: "10D00",
    end: "10D3F",
    name: "Hanifi Rohingya",
  },
  {
    start: "10E60",
    end: "10E7F",
    name: "Rumi Numeral Symbols",
  },
  {
    start: "10E80",
    end: "10EBF",
    name: "Yezidi",
  },
  {
    start: "10F00",
    end: "10F2F",
    name: "Old Sogdian",
  },
  {
    start: "10F30",
    end: "10F6F",
    name: "Sogdian",
  },
  {
    start: "10F70",
    end: "10FAF",
    name: "Old Uyghur",
  },
  {
    start: "10FB0",
    end: "10FDF",
    name: "Chorasmian",
  },
  {
    start: "10FE0",
    end: "10FFF",
    name: "Elymaic",
  },
  {
    start: "11000",
    end: "1107F",
    name: "Brahmi",
  },
  {
    start: "11080",
    end: "110CF",
    name: "Kaithi",
  },
  {
    start: "110D0",
    end: "110FF",
    name: "Sora Sompeng",
  },
  {
    start: "11100",
    end: "1114F",
    name: "Chakma",
  },
  {
    start: "11150",
    end: "1117F",
    name: "Mahajani",
  },
  {
    start: "11180",
    end: "111DF",
    name: "Sharada",
  },
  {
    start: "111E0",
    end: "111FF",
    name: "Sinhala Archaic Numbers",
  },
  {
    start: "11200",
    end: "1124F",
    name: "Khojki",
  },
  {
    start: "11280",
    end: "112AF",
    name: "Multani",
  },
  {
    start: "112B0",
    end: "112FF",
    name: "Khudawadi",
  },
  {
    start: "11300",
    end: "1137F",
    name: "Grantha",
  },
  {
    start: "11400",
    end: "1147F",
    name: "Newa",
  },
  {
    start: "11480",
    end: "114DF",
    name: "Tirhuta",
  },
  {
    start: "11580",
    end: "115FF",
    name: "Siddham",
  },
  {
    start: "11600",
    end: "1165F",
    name: "Modi",
  },
  {
    start: "11660",
    end: "1167F",
    name: "Mongolian Supplement",
  },
  {
    start: "11680",
    end: "116CF",
    name: "Takri",
  },
  {
    start: "11700",
    end: "1174F",
    name: "Ahom",
  },
  {
    start: "11800",
    end: "1184F",
    name: "Dogra",
  },
  {
    start: "118A0",
    end: "118FF",
    name: "Warang Citi",
  },
  {
    start: "11900",
    end: "1195F",
    name: "Dives Akuru",
  },
  {
    start: "119A0",
    end: "119FF",
    name: "Nandinagari",
  },
  {
    start: "11A00",
    end: "11A4F",
    name: "Zanabazar Square",
  },
  {
    start: "11A50",
    end: "11AAF",
    name: "Soyombo",
  },
  {
    start: "11AB0",
    end: "11ABF",
    name: "Unified Canadian Aboriginal Syllabics Extended-A",
  },
  {
    start: "11AC0",
    end: "11AFF",
    name: "Pau Cin Hau",
  },
  {
    start: "11C00",
    end: "11C6F",
    name: "Bhaiksuki",
  },
  {
    start: "11C70",
    end: "11CBF",
    name: "Marchen",
  },
  {
    start: "11D00",
    end: "11D5F",
    name: "Masaram Gondi",
  },
  {
    start: "11D60",
    end: "11DAF",
    name: "Gunjala Gondi",
  },
  {
    start: "11EE0",
    end: "11EFF",
    name: "Makasar",
  },
  {
    start: "11FB0",
    end: "11FBF",
    name: "Lisu Supplement",
  },
  {
    start: "11FC0",
    end: "11FFF",
    name: "Tamil Supplement",
  },
  {
    start: "12000",
    end: "123FF",
    name: "Cuneiform",
  },
  {
    start: "12400",
    end: "1247F",
    name: "Cuneiform Numbers and Punctuation",
  },
  {
    start: "12480",
    end: "1254F",
    name: "Early Dynastic Cuneiform",
  },
  {
    start: "12F90",
    end: "12FFF",
    name: "Cypro-Minoan",
  },
  {
    start: "13000",
    end: "1342F",
    name: "Egyptian Hieroglyphs",
  },
  {
    start: "13430",
    end: "1343F",
    name: "Egyptian Hieroglyph Format Controls",
  },
  {
    start: "14400",
    end: "1467F",
    name: "Anatolian Hieroglyphs",
  },
  {
    start: "16800",
    end: "16A3F",
    name: "Bamum Supplement",
  },
  {
    start: "16A40",
    end: "16A6F",
    name: "Mro",
  },
  {
    start: "16A70",
    end: "16ACF",
    name: "Tangsa",
  },
  {
    start: "16AD0",
    end: "16AFF",
    name: "Bassa Vah",
  },
  {
    start: "16B00",
    end: "16B8F",
    name: "Pahawh Hmong",
  },
  {
    start: "16E40",
    end: "16E9F",
    name: "Medefaidrin",
  },
  {
    start: "16F00",
    end: "16F9F",
    name: "Miao",
  },
  {
    start: "16FE0",
    end: "16FFF",
    name: "Ideographic Symbols and Punctuation",
  },
  {
    start: "17000",
    end: "187FF",
    name: "Tangut",
  },
  {
    start: "18800",
    end: "18AFF",
    name: "Tangut Components",
  },
  {
    start: "18B00",
    end: "18CFF",
    name: "Khitan Small Script",
  },
  {
    start: "18D00",
    end: "18D7F",
    name: "Tangut Supplement",
  },
  {
    start: "1AFF0",
    end: "1AFFF",
    name: "Kana Extended-B",
  },
  {
    start: "1B000",
    end: "1B0FF",
    name: "Kana Supplement",
  },
  {
    start: "1B100",
    end: "1B12F",
    name: "Kana Extended-A",
  },
  {
    start: "1B130",
    end: "1B16F",
    name: "Small Kana Extension",
  },
  {
    start: "1B170",
    end: "1B2FF",
    name: "Nushu",
  },
  {
    start: "1BC00",
    end: "1BC9F",
    name: "Duployan",
  },
  {
    start: "1BCA0",
    end: "1BCAF",
    name: "Shorthand Format Controls",
  },
  {
    start: "1CF00",
    end: "1CFCF",
    name: "Znamenny Musical Notation",
  },
  {
    start: "1D000",
    end: "1D0FF",
    name: "Byzantine Musical Symbols",
  },
  {
    start: "1D100",
    end: "1D1FF",
    name: "Musical Symbols",
  },
  {
    start: "1D200",
    end: "1D24F",
    name: "Ancient Greek Musical Notation",
  },
  {
    start: "1D2E0",
    end: "1D2FF",
    name: "Mayan Numerals",
  },
  {
    start: "1D300",
    end: "1D35F",
    name: "Tai Xuan Jing Symbols",
  },
  {
    start: "1D360",
    end: "1D37F",
    name: "Counting Rod Numerals",
  },
  {
    start: "1D400",
    end: "1D7FF",
    name: "Mathematical Alphanumeric Symbols",
  },
  {
    start: "1D800",
    end: "1DAAF",
    name: "Sutton SignWriting",
  },
  {
    start: "1DF00",
    end: "1DFFF",
    name: "Latin Extended-G",
  },
  {
    start: "1E000",
    end: "1E02F",
    name: "Glagolitic Supplement",
  },
  {
    start: "1E100",
    end: "1E14F",
    name: "Nyiakeng Puachue Hmong",
  },
  {
    start: "1E290",
    end: "1E2BF",
    name: "Toto",
  },
  {
    start: "1E2C0",
    end: "1E2FF",
    name: "Wancho",
  },
  {
    start: "1E7E0",
    end: "1E7FF",
    name: "Ethiopic Extended-B",
  },
  {
    start: "1E800",
    end: "1E8DF",
    name: "Mende Kikakui",
  },
  {
    start: "1E900",
    end: "1E95F",
    name: "Adlam",
  },
  {
    start: "1EC70",
    end: "1ECBF",
    name: "Indic Siyaq Numbers",
  },
  {
    start: "1ED00",
    end: "1ED4F",
    name: "Ottoman Siyaq Numbers",
  },
  {
    start: "1EE00",
    end: "1EEFF",
    name: "Arabic Mathematical Alphabetic Symbols",
  },
  {
    start: "1F000",
    end: "1F02F",
    name: "Mahjong Tiles",
  },
  {
    start: "1F030",
    end: "1F09F",
    name: "Domino Tiles",
  },
  {
    start: "1F0A0",
    end: "1F0FF",
    name: "Playing Cards",
  },
  {
    start: "1F100",
    end: "1F1FF",
    name: "Enclosed Alphanumeric Supplement",
  },
  {
    start: "1F200",
    end: "1F2FF",
    name: "Enclosed Ideographic Supplement",
  },
  {
    start: "1F300",
    end: "1F5FF",
    name: "Miscellaneous Symbols and Pictographs",
  },
  {
    start: "1F600",
    end: "1F64F",
    name: "Emoticons",
  },
  {
    start: "1F650",
    end: "1F67F",
    name: "Ornamental Dingbats",
  },
  {
    start: "1F680",
    end: "1F6FF",
    name: "Transport and Map Symbols",
  },
  {
    start: "1F700",
    end: "1F77F",
    name: "Alchemical Symbols",
  },
  {
    start: "1F780",
    end: "1F7FF",
    name: "Geometric Shapes Extended",
  },
  {
    start: "1F800",
    end: "1F8FF",
    name: "Supplemental Arrows-C",
  },
  {
    start: "1F900",
    end: "1F9FF",
    name: "Supplemental Symbols and Pictographs",
  },
  {
    start: "1FA00",
    end: "1FA6F",
    name: "Chess Symbols",
  },
  {
    start: "1FA70",
    end: "1FAFF",
    name: "Symbols and Pictographs Extended-A",
  },
  {
    start: "1FB00",
    end: "1FBFF",
    name: "Symbols for Legacy Computing",
  },
  {
    start: "20000",
    end: "2A6DF",
    name: "CJK Unified Ideographs Extension B",
  },
  {
    start: "2A700",
    end: "2B73F",
    name: "CJK Unified Ideographs Extension C",
  },
  {
    start: "2B740",
    end: "2B81F",
    name: "CJK Unified Ideographs Extension D",
  },
  {
    start: "2B820",
    end: "2CEAF",
    name: "CJK Unified Ideographs Extension E",
  },
  {
    start: "2CEB0",
    end: "2EBEF",
    name: "CJK Unified Ideographs Extension F",
  },
  {
    start: "2F800",
    end: "2FA1F",
    name: "CJK Compatibility Ideographs Supplement",
  },
  {
    start: "30000",
    end: "3134F",
    name: "CJK Unified Ideographs Extension G",
  },
  {
    start: "E0000",
    end: "E007F",
    name: "Tags",
  },
  {
    start: "E0100",
    end: "E01EF",
    name: "Variation Selectors Supplement",
  },
  {
    start: "F0000",
    end: "FFFFF",
    name: "Supplementary Private Use Area-A",
  },
  {
    start: "100000",
    end: "10FFFF",
    name: "Supplementary Private Use Area-B",
  },
];
