import * as iconvlite from 'iconv-lite'


function fix_text(text, textPrev, attempt = 1){
    // let text = 'Ch�o t?t c? m?i ng??i';
    // let text = 'Chào tất cả mọi người';
    // let text = 'Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i';

    // let text_encode = iconvlite.decode(text, 'sloppy-windows-1252');
    // let text_encode = iconvlite.default.encode(text, 'sloppy-windows-1252');
    // let text_encode = iconvlite.default.encode(text, 'sloppywindows1252');
    let text_encode = iconvlite.default.encode(text, 'windows-1252');
    text_encode = text_encode.replace('xc3','xc3\xa0'); 
    let text_decode = iconvlite.default.decode(text_encode, 'utf-8');
    
    // if( attempt == 1 ){
    //     fix_text( text_decode, text, attempt + 1 );
    // }else{

    // }
    
}

let text = 'TrÃ  Oolong Kim TuyÃªn Cáº§u Äáº¥t - Há»™p 220Gr - Dalat Farm';
// let text = 'Dá»‹ch vá»¥ & Khuyáº¿n mÃ£i';

let text_encode = iconvlite.default.encode(text, 'windows-1252');
console.log(text_encode);
text_encode = text_encode.replace('xc3','xc3\xa0'); 
let text_decode = iconvlite.default.decode(text_encode, 'utf-8');



console.log(text_decode);