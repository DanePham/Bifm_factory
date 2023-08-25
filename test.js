// import ftfy from './ftfy.js'
String.prototype.slugify = function (separator = "-") {
    return this
        .toString()
        .normalize('NFD')                   // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '')   // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, separator);
};


// let text = 'TrÃ  Oolong Kim TuyÃªn Cáº§u Äáº¥t - Há»™p 220Gr - Dalat Farm';
// let text = 'Chào tất cả mọi người';
// let text_fix = ftfy.fix_encoding(text);
// console.log(text_fix);

let text = 'Combo 6 dây đàn hồi kháng lực miniband chuyên tập mông';
console.log(text.slugify());